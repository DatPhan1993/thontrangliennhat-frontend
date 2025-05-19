import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getNewsById, updateNews } from '~/services/newsService';
import { getCategoriesBySlug } from '~/services/categoryService';
import PushNotification from '~/components/PushNotification/PushNotification';
import styles from './UpdateNews.module.scss';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import routes from '~/config/routes';
import Title from '~/components/Title/Title';
import { Spin } from 'antd';
import { getImageUrl, normalizeImageUrl } from '~/utils/imageUtils';

const UpdateNews = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [initialValues, setInitialValues] = useState(null);

    // Predefined categories as requested
    const predefinedCategories = [
        { id: 'tin-hop-tac-xa', title: 'Tin hợp tác xã' },
        { id: 'tin-nong-nghiep-du-lich', title: 'Tin nông nghiệp - du lịch' },
        { id: 'tin-kinh-te-xa-hoi', title: 'Tin kinh tế - xã hội' }
    ];

    const validationSchema = Yup.object({
        title: Yup.string().required('Tiêu đề là bắt buộc'),
        summary: Yup.string().required('Tóm tắt là bắt buộc'),
        image: Yup.mixed().required('Hình ảnh là bắt buộc'),
        categoryId: Yup.string().required('Danh mục là bắt buộc'),
        content: Yup.string().required('Nội dung là bắt buộc'),
        isFeatured: Yup.boolean(),
        views: Yup.number().min(0, 'Số lượt xem không thể là số âm').integer('Số lượt xem phải là số nguyên'),
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategoriesBySlug('tin-tuc');
                
                // Combine fetched categories with predefined ones
                // In a real application, you'd want to check for duplicates
                setCategories([...predefinedCategories, ...fetchedCategories.filter(
                    cat => !predefinedCategories.some(pc => pc.id === cat.id)
                )]);
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
                // Use predefined categories as fallback
                setCategories(predefinedCategories);
            }
        };

        const fetchNews = async () => {
            try {
                const news = await getNewsById(id);
                
                // Handle images correctly based on its type
                let imageValue;
                if (news.images) {
                    if (Array.isArray(news.images)) {
                        imageValue = news.images.length > 0 ? news.images[0] : null;
                    } else if (typeof news.images === 'string') {
                        imageValue = news.images;
                    }
                }
                
                // Process the image URL to ensure it's properly normalized
                const processedImageUrl = imageValue ? getImageUrl(imageValue) : '/placeholder-image.svg';
                console.log('Processed image URL:', processedImageUrl);
                
                setInitialValues({
                    title: news.title,
                    summary: news.summary,
                    image: processedImageUrl,
                    categoryId: news.child_nav_id,
                    content: news.content,
                    isFeatured: news.isFeatured,
                    views: news.views || 0,
                });
            } catch (error) {
                console.error('Lỗi khi tải tin tức:', error);
            }
        };

        fetchCategories();
        fetchNews();
    }, [id]);

    const handleImageUpload = (event, setFieldValue) => {
        const file = event.target.files[0];
        setFieldValue('image', file);
    };

    const handleSubmit = async (values, { resetForm }) => {
        try {
            setNotification({ message: '', type: '' });
            
            // Create a FormData instance
            const formData = new FormData();
            
            // Add basic form fields
            formData.append('title', values.title);
            formData.append('summary', values.summary);
            
            // Add image handling
            if (values.image && values.image instanceof File) {
                console.log("Adding new image file to request:", values.image.name);
                formData.append('images[]', values.image);
            } else if (values.image && typeof values.image === 'string') {
                console.log("Keeping existing image:", values.image);
                formData.append('images[]', values.image);
            } else if (initialValues.image) {
                console.log("Using initial image as fallback:", initialValues.image);
                formData.append('images[]', initialValues.image);
            }
            
            // Add category
            formData.append('child_nav_id', values.categoryId);
            
            // Process content text to make it HTML if it doesn't already have HTML tags
            let processedContent = values.content || '';
            if (processedContent && !processedContent.includes('<')) {
                // Convert plain text to HTML with paragraphs
                processedContent = '<p>' + processedContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
            }
            formData.append('content', processedContent);
            
            // Add featured status
            formData.append('isFeatured', values.isFeatured ? 1 : 0);
            
            // Add views
            formData.append('views', parseInt(values.views, 10) || 0);
            
            // Log form data for debugging
            console.log('Submitting update for news ID:', id);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
            }

            // Send the update request
            await updateNews(id, formData);
            
            setNotification({ message: 'Cập nhật tin tức thành công!', type: 'success' });
            
            setTimeout(() => {
                navigate(routes.newsList);
            }, 1000);
        } catch (error) {
            console.error('Error updating news:', error);
            setNotification({ 
                message: `Lỗi khi cập nhật tin tức: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`, 
                type: 'error'
            });
        }
    };

    if (!initialValues) {
        return <LoadingScreen />;
    }

    return (
        <div className={styles.editNews}>
            <Title text="Cập nhật tin tức" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {({ isSubmitting, setFieldValue, values }) => (
                    <Form className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title">Tiêu Đề</label>
                            <Field name="title" type="text" className={styles.input} />
                            <ErrorMessage name="title" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="summary">Tóm Tắt</label>
                            <Field name="summary" type="text" className={styles.input} />
                            <ErrorMessage name="summary" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Chọn Hình Ảnh</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => handleImageUpload(event, setFieldValue)}
                            />
                            <ErrorMessage name="image" component="div" className={styles.error} />
                        </div>
                        {values.image && (
                            <div className={styles.imagePreview}>
                                <img
                                    src={
                                        values.image instanceof File
                                            ? URL.createObjectURL(values.image)
                                            : values.image
                                    }
                                    alt="Preview"
                                    className={styles.newsImage}
                                    onError={(e) => {
                                        console.error('Image failed to load:', e.target.src);
                                        e.target.src = '/placeholder-image.svg';
                                    }}
                                />
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label htmlFor="categoryId">Danh Mục</label>
                            <Field as="select" name="categoryId" className={styles.input}>
                                <option value="">Chọn danh mục</option>
                                {predefinedCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.title}
                                    </option>
                                ))}
                                {categories.filter(cat => !predefinedCategories.some(pc => pc.id === cat.id))
                                    .map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.title}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="categoryId" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="content">Nội Dung</label>
                            <Field 
                                as="textarea" 
                                name="content" 
                                className={styles.textarea}
                                rows="12"
                                placeholder="Viết nội dung tin tức của bạn tại đây..."
                            />
                            <ErrorMessage name="content" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>
                                <Field type="checkbox" name="isFeatured" />
                                Đánh dấu là nổi bật
                            </label>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="views">Số lượt xem</label>
                            <Field name="views" type="number" min="0" className={styles.input} />
                            <ErrorMessage name="views" component="div" className={styles.error} />
                        </div>
                        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                            {isSubmitting ? <Spin size="small" /> : 'Cập nhật'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default UpdateNews;
