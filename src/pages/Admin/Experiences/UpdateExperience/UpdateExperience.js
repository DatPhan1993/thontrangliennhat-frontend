import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getExperienceById, updateExperience } from '~/services/experienceService';
import { getCategoriesBySlug } from '~/services/categoryService';
import PushNotification from '~/components/PushNotification/PushNotification';
import styles from './UpdateExperience.module.scss';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import routes from '~/config/routes';
import Title from '~/components/Title/Title';
import { Spin } from 'antd';
import useDataRefresh from '~/hooks/useDataRefresh';

const UpdateExperience = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [initialValues, setInitialValues] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { clearExperienceCache } = useDataRefresh();

    // Helper function to ensure proper image URL format
    const formatImageUrl = (url) => {
        if (!url) return '';
        
        // If it's already a full URL or data URL, return as is
        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }
        
        // If it's a relative path, make it absolute
        if (url.startsWith('/')) {
            // Use the API server URL for images
            return `http://localhost:3001${url}`;
        }
        
        // Default case - add leading slash if needed
        return `http://localhost:3001/${url}`;
    };

    const validationSchema = Yup.object({
        title: Yup.string().required('Tiêu đề là bắt buộc'),
        summary: Yup.string().required('Tóm tắt là bắt buộc'),
        image: Yup.mixed().required('Hình ảnh là bắt buộc'),
        categoryId: Yup.string().required('Danh mục là bắt buộc'),
        content: Yup.string().required('Nội dung là bắt buộc'),
    });

    const fetchExperienceData = async () => {
        try {
            // Clear cache first to ensure we get fresh data
            clearExperienceCache();
            
            const experience = await getExperienceById(id);
            console.log('Fetched experience:', experience);
            
            // Ensure images is an array with at least one item
            let imageUrl = '';
            if (experience.images) {
                if (Array.isArray(experience.images) && experience.images.length > 0) {
                    imageUrl = experience.images[0];
                } else if (typeof experience.images === 'string') {
                    imageUrl = experience.images;
                }
            }
            
            // Format the image URL
            const formattedImageUrl = formatImageUrl(imageUrl);
            console.log('Formatted image URL:', formattedImageUrl);
            
            setImagePreviewUrl(formattedImageUrl);
            
            setInitialValues({
                title: experience.name,
                summary: experience.summary,
                image: imageUrl, // Keep the original URL in the form value
                categoryId: experience.child_nav_id,
                content: experience.content || '',
            });
        } catch (error) {
            console.error('Lỗi khi tải trải nghiệm:', error);
            setNotification({ 
                message: 'Không thể tải dữ liệu trải nghiệm. Vui lòng thử lại sau.', 
                type: 'error' 
            });
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategoriesBySlug('trai-nghiem');
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
            }
        };

        fetchCategories();
        fetchExperienceData();
    }, [id]);

    const handleImageUpload = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setFieldValue('image', file);
        }
    };
    
    const handleSubmit = async (values, { setSubmitting }) => {
        setIsSubmitting(true);
        try {
            // Clear experience cache before submitting
            clearExperienceCache();
            
            const formData = new FormData();

            // Log the values being submitted
            console.log('Submitting values:', values);

            formData.append('name', values.title);
            formData.append('summary', values.summary);

            if (values.image instanceof File) {
                console.log('Appending new file image');
                formData.append('images[]', values.image);
            } else if (typeof values.image === 'string' && values.image) {
                console.log('Using existing image URL:', values.image);
                formData.append('images[]', values.image);
            } else if (initialValues.image) {
                console.log('Falling back to initial image URL:', initialValues.image);
                formData.append('images[]', initialValues.image);
            }

            formData.append('child_nav_id', values.categoryId);
            formData.append('content', values.content);

            // Log FormData contents for debugging
            console.log('FormData contents:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }

            // Update the experience
            const response = await updateExperience(id, formData);
            console.log('Update response:', response);
            
            // Clear cache again after update
            clearExperienceCache();
            
            setNotification({ message: 'Cập nhật trải nghiệm thành công!', type: 'success' });
            
            // Refresh the data after successful update
            await fetchExperienceData();
            
            // Navigate after a short delay
            setTimeout(() => {
                navigate(routes.experienceList);
            }, 1500);
        } catch (error) {
            console.error('Lỗi khi cập nhật trải nghiệm:', error);
            setNotification({ 
                message: 'Lỗi khi cập nhật trải nghiệm. Vui lòng thử lại.', 
                type: 'error' 
            });
        } finally {
            setSubmitting(false);
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(routes.experienceList);
    };

    if (!initialValues) {
        return <LoadingScreen />;
    }

    return (
        <div className={styles.editExperience}>
            <Title text="Cập nhật trải nghiệm" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <Formik 
                initialValues={initialValues} 
                validationSchema={validationSchema} 
                onSubmit={handleSubmit}
                enableReinitialize={true} // This ensures form updates when initialValues change
            >
                {({ isSubmitting: formSubmitting, setFieldValue, values }) => (
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
                        
                        {imagePreviewUrl && (
                            <div className={styles.imagePreview}>
                                <img
                                    src={imagePreviewUrl}
                                    alt="Experience Preview"
                                    className={styles.experienceImage}
                                    onError={(e) => {
                                        console.error('Image failed to load:', e);
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkjDrG5oIOG6o25oPC90ZXh0Pjwvc3ZnPg==';
                                    }}
                                />
                            </div>
                        )}
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="categoryId">Danh Mục</label>
                            <Field as="select" name="categoryId" className={styles.input}>
                                <option value="">Chọn danh mục</option>
                                <option value="4">Không gian làng quê yên bình</option>
                                <option value="5">Ẩm thực đồng quê tươi ngon</option>
                                <option value="6">Hoạt động trải nghiệm nông thôn</option>
                                <option value="7">Phiên chợ quê truyền thống</option>
                                {categories.map((category) => (
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
                                className={styles.contentTextarea} 
                                rows="15"
                            />
                            <ErrorMessage name="content" component="div" className={styles.error} />
                        </div>
                        <div className={styles.buttonGroup}>
                            <button 
                                type="submit" 
                                disabled={formSubmitting || isSubmitting} 
                                className={styles.submitButton}
                            >
                                {formSubmitting || isSubmitting ? <Spin size="small" /> : 'Cập nhật'}
                            </button>
                            <button 
                                type="button"
                                onClick={handleCancel}
                                className={styles.cancelButton}
                            >
                                Hủy
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default UpdateExperience;
