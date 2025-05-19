import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getServiceById, updateService } from '~/services/serviceService';
import { getCategoriesBySlug } from '~/services/categoryService';
import PushNotification from '~/components/PushNotification/PushNotification';
import styles from './UpdateService.module.scss';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import routes from '~/config/routes';
import Title from '~/components/Title/Title';
import { Spin } from 'antd';
import { normalizeImageUrl } from '~/utils/imageUtils';

const UpdateService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [initialValues, setInitialValues] = useState(null);
    const [loadingService, setLoadingService] = useState(true);
    const [loadingError, setLoadingError] = useState(null);

    // Danh sách các danh mục đặc biệt cho dịch vụ
    const serviceCategories = [
        { id: 1, title: 'Du lịch trải nghiệm nông nghiệp' },
        { id: 2, title: 'Phiên chợ quê' },
        { id: 3, title: 'Trò chơi dân gian' }
    ];

    const validationSchema = Yup.object({
        title: Yup.string().required('Tiêu đề là bắt buộc'),
        summary: Yup.string().required('Tóm tắt là bắt buộc'),
        image: Yup.mixed().required('Hình ảnh là bắt buộc'),
        categoryId: Yup.string().required('Danh mục là bắt buộc'),
        content: Yup.string().required('Nội dung là bắt buộc'),
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategoriesBySlug('dich-vu');
                if (fetchedCategories && fetchedCategories.length > 0) {
                    setCategories(fetchedCategories);
                } else {
                    // Use default categories if API returns empty
                    setCategories(serviceCategories);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
                setLoadingError('Không thể tải danh mục dịch vụ.');
                // Use default categories on error
                setCategories(serviceCategories);
            }
        };

        const fetchService = async () => {
            setLoadingService(true);
            setLoadingError(null);
            try {
                console.log('Fetching service with ID:', id);
                const service = await getServiceById(id);
                console.log('Service data received:', service);
                
                // Normalize the image URL for proper display
                let imageUrl = '';
                if (service.images) {
                    if (Array.isArray(service.images) && service.images.length > 0) {
                        imageUrl = normalizeImageUrl(service.images[0]);
                    } else if (typeof service.images === 'string') {
                        imageUrl = normalizeImageUrl(service.images);
                    }
                } else if (service.image) {
                    imageUrl = normalizeImageUrl(service.image);
                }
                
                console.log('Normalized image URL:', imageUrl);
                
                setInitialValues({
                    title: service.name,
                    summary: service.summary,
                    image: imageUrl,
                    categoryId: service.child_nav_id,
                    content: service.content || '',
                });
                setLoadingService(false);
            } catch (error) {
                console.error('Lỗi khi tải dịch vụ:', error);
                setLoadingError('Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.');
                setLoadingService(false);
            }
        };

        fetchCategories();
        fetchService();
    }, [id]);

    const handleImageUpload = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            console.log('New image selected:', file.name);
            setFieldValue('image', file);
        }
    };
    const handleSubmit = async (values, { resetForm }) => {
        console.log('Submit values:', values);
        const formData = new FormData();

        formData.append('name', values.title);
        formData.append('summary', values.summary);

        // Handle image upload
        if (values.image instanceof File) {
            // It's a new file uploaded by the user
            formData.append('images[]', values.image);
            console.log('Appending new image file:', values.image.name);
        } else if (typeof values.image === 'string' && values.image) {
            // For existing images, we need to handle them differently
            if (values.image.startsWith('http') || values.image.startsWith('/')) {
                // It's an existing image URL
                formData.append('images', values.image);
                console.log('Keeping existing image URL:', values.image);
            } else {
                // In case it's a base64 string or some other format
                try {
                    const response = await fetch(values.image);
                    const blob = await response.blob();
                    const file = new File([blob], "image.jpg", { type: "image/jpeg" });
                    formData.append('images[]', file);
                    console.log('Converted image string to file');
                } catch (error) {
                    console.error('Error converting image:', error);
                    formData.append('images', values.image);
                }
            }
        } else {
            console.log('No image provided');
        }

        formData.append('child_nav_id', values.categoryId);
        formData.append('content', values.content);
        // Adding isFeatured with a default value
        formData.append('isFeatured', 1);
        
        // Log the formData contents for debugging
        console.log('Submitting form data for service ID:', id);
        for (let [key, value] of formData.entries()) {
            console.log(`FormData: ${key} = ${value instanceof File ? value.name : (typeof value === 'string' ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : value)}`);
        }

        try {
            console.log('Calling updateService API');
            const updatedService = await updateService(id, formData);
            console.log('Service updated successfully:', updatedService);
            setNotification({ message: 'Cập nhật dịch vụ thành công!', type: 'success' });
            setTimeout(() => {
                navigate(routes.serviceList);
            }, 1000);
        } catch (error) {
            console.error('Error details:', error);
            setNotification({ message: 'Lỗi khi cập nhật dịch vụ.', type: 'error' });
            console.error('Lỗi khi cập nhật dịch vụ:', error);
        }
    };

    if (loadingService) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingScreen />
                <p>Đang tải thông tin dịch vụ...</p>
            </div>
        );
    }

    if (loadingError) {
        return (
            <div className={styles.errorContainer}>
                <h2>Lỗi</h2>
                <p>{loadingError}</p>
                <button 
                    className={styles.backButton}
                    onClick={() => navigate(routes.serviceList)}
                >
                    Quay lại danh sách dịch vụ
                </button>
            </div>
        );
    }

    // Only render the form if we have initialValues
    if (!initialValues) {
        return (
            <div className={styles.errorContainer}>
                <h2>Không tìm thấy dịch vụ</h2>
                <p>Dịch vụ này không tồn tại hoặc đã bị xóa.</p>
                <button 
                    className={styles.backButton}
                    onClick={() => navigate(routes.serviceList)}
                >
                    Quay lại danh sách dịch vụ
                </button>
            </div>
        );
    }

    return (
        <div className={styles.editService}>
            <Title text="Cập nhật dịch vụ" />
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
                                className={styles.fileInput}
                            />
                            <ErrorMessage name="image" component="div" className={styles.error} />
                        </div>
                        {values.image && (
                            <div className={styles.imagePreview}>
                                <img
                                    src={values.image}
                                    alt="Service"
                                    className={styles.serviceImage}
                                />
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label htmlFor="categoryId">Danh Mục</label>
                            <Field as="select" name="categoryId" className={styles.input}>
                                <option value="">Chọn danh mục</option>
                                {/* Danh mục đặc biệt */}
                                {serviceCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.title}
                                    </option>
                                ))}
                                
                                {/* Các danh mục từ server */}
                                {categories.length > serviceCategories.length && (
                                    <option disabled>──────────</option>
                                )}
                                {categories.length > serviceCategories.length && 
                                    categories
                                        .filter(cat => !serviceCategories.some(sc => sc.id == cat.id))
                                        .map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.title || category.name}
                                            </option>
                                        ))
                                }
                            </Field>
                            <ErrorMessage name="categoryId" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="content">Nội Dung</label>
                            <Field
                                as="textarea"
                                name="content"
                                className={`${styles.input} ${styles.textarea}`}
                                rows="10"
                            />
                            <ErrorMessage name="content" component="div" className={styles.error} />
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

export default UpdateService;
