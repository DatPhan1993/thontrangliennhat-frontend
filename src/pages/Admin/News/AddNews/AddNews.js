import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createNews } from '~/services/newsService';
import { getCategoriesBySlug } from '~/services/categoryService';
import PushNotification from '~/components/PushNotification/PushNotification';
import styles from './AddNews.module.scss';
import routes from '~/config/routes';
import { useNavigate } from 'react-router-dom';
import Title from '~/components/Title/Title';
import { useDropzone } from 'react-dropzone';
import { Spin } from 'antd';
import axios from 'axios';

const AddNews = () => {
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    // Predefined categories as requested
    const predefinedCategories = [
        { id: 'tin-hop-tac-xa', title: 'Tin hợp tác xã' },
        { id: 'tin-nong-nghiep-du-lich', title: 'Tin nông nghiệp - du lịch' },
        { id: 'tin-kinh-te-xa-hoi', title: 'Tin kinh tế - xã hội' }
    ];

    const initialValues = {
        title: '',
        summary: '',
        image: '',
        categoryId: '',
        content: '',
        isFeatured: false,
        views: 0,
    };

    const validationSchema = Yup.object({
        title: Yup.string().required('Tiêu đề là bắt buộc'),
        summary: Yup.string().required('Tóm tắt là bắt buộc'),
        content: Yup.string(),
        categoryId: Yup.string().required('Danh mục là bắt buộc'),
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                console.log("Fetching news categories...");
                const fetchedCategories = await getCategoriesBySlug('tin-tuc');
                console.log("Categories fetched:", fetchedCategories);
                
                if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
                    // Combine fetched categories with predefined ones
                    // In a real application, you'd want to check for duplicates
                    setCategories([...predefinedCategories, ...fetchedCategories.filter(
                        cat => !predefinedCategories.some(pc => pc.id === cat.id)
                    )]);
                } else {
                    console.warn("No categories found or invalid data format");
                    // Use predefined categories as fallback
                    setCategories(predefinedCategories);
                    setNotification({ 
                        message: 'Không thể tải danh mục tin tức. Sử dụng danh mục mặc định.', 
                        type: 'warning' 
                    });
                }
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
                // Use predefined categories as fallback
                setCategories(predefinedCategories);
                setNotification({ 
                    message: 'Không thể tải danh mục tin tức: ' + error.message, 
                    type: 'error' 
                });
            }
        };
        
        fetchCategories();
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
            // Don't automatically upload - will do it on form submit
        },
        accept: {
            'image/*': []
        },
        maxSize: 5242880, // 5MB
    });

    // This will be called when form is submitted
    const uploadImages = async (imageFiles) => {
        if (!imageFiles || imageFiles.length === 0) {
            return [];
        }
        
        setIsUploading(true);
        const uploadedUrls = [];
        
        try {
            for (const file of imageFiles) {
        const formData = new FormData();
                formData.append('image', file);
                
                const response = await axios.post('http://localhost:3001/api/upload/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
                if (response.data && response.data.data && response.data.data.url) {
                    uploadedUrls.push(response.data.data.url);
                }
            }
            
            if (uploadedUrls.length > 0) {
                setNotification({ message: 'Tải ảnh lên thành công', type: 'success' });
            } else {
                setNotification({ message: 'Không thể tải ảnh lên', type: 'error' });
            }
            
            return uploadedUrls;
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên:', error);
            setNotification({ message: 'Lỗi khi tải ảnh lên: ' + error.message, type: 'error' });
            return [];
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            console.log("Form values:", values);
            setSubmitting(true);
            
            // First upload any images
            let imageUrls = [];
            if (files.length > 0) {
                try {
                    imageUrls = await uploadImages(files);
                } catch (error) {
                    console.error('Lỗi tải ảnh:', error);
                    setNotification({ 
                        message: 'Lỗi khi tải ảnh lên, nhưng sẽ tiếp tục tạo tin tức.', 
                        type: 'warning' 
                    });
                    // Continue without images
                }
            }
            
            // Process content text to make it HTML if it doesn't already have HTML tags
            let processedContent = values.content || '';
            if (processedContent && !processedContent.includes('<')) {
                // Convert plain text to HTML with paragraphs
                processedContent = '<p>' + processedContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
            }
            
            // Then create the news
            const newsData = {
                title: values.title,
                summary: values.summary,
                content: processedContent,
                image: imageUrls.length > 0 ? imageUrls[0] : '/images/placeholder-image.jpg',
                images: imageUrls,
                categoryId: values.categoryId,
                isFeatured: values.isFeatured,
                views: parseInt(values.views, 10) || 0
            };
            
            console.log("Sending news data:", newsData);
            await createNews(newsData);
            setNotification({ message: 'Thêm tin tức thành công!', type: 'success' });
            resetForm();
            setFiles([]);
            
            setTimeout(() => {
                navigate(routes.newsList);
            }, 1500);
        } catch (error) {
            console.error('Lỗi khi tạo tin tức:', error);
            setNotification({ 
                message: 'Lỗi khi thêm tin tức: ' + (error.response?.data?.message || error.message || 'Lỗi không xác định'), 
                type: 'error' 
            });
        } finally {
            setSubmitting(false);
        }
    };

    const removeFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.addNews}>
            <Title text="Thêm mới tin tức" />
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
                            <div {...getRootProps()} className={styles.dropzone}>
                                <input {...getInputProps()} />
                                <p>Kéo thả file vào đây, hoặc nhấn để chọn file</p>
                            </div>
                            {isUploading && <div className={styles.uploading}>Đang tải ảnh lên... <Spin size="small" /></div>}
                        </div>
                        <div className={styles.imagesPreview}>
                            {files.map((img, index) => (
                                <div key={index} className={styles.imageContainer}>
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`News ${index}`}
                                        className={styles.productImage}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className={styles.removeButton}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
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
                        <button 
                            type="submit" 
                            disabled={isSubmitting || isUploading} 
                            className={styles.submitButton}
                        >
                            {isSubmitting ? <Spin size="small" /> : 'Thêm Tin Tức'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddNews;
