import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createService } from '~/services/serviceService';
import PushNotification from '~/components/PushNotification/PushNotification';
import styles from './AddService.module.scss';
import routes from '~/config/routes';
import { useNavigate } from 'react-router-dom';
import Title from '~/components/Title/Title';
import { useDropzone } from 'react-dropzone';
import { Spin } from 'antd';
import { getCategoriesByType, getCategories } from '~/services/categoryService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

const AddService = () => {
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Danh sách các danh mục đặc biệt cho dịch vụ
    const serviceCategories = [
        { id: 1, title: 'Du lịch trải nghiệm nông nghiệp' },
        { id: 2, title: 'Phiên chợ quê' },
        { id: 3, title: 'Trò chơi dân gian' }
    ];

    const initialValues = {
        title: '',
        summary: '',
        categoryId: '',
        content: '',
    };

    const validationSchema = Yup.object({
        title: Yup.string().required('Tiêu đề là bắt buộc'),
        summary: Yup.string().required('Tóm tắt là bắt buộc'),
        categoryId: Yup.string().required('Danh mục là bắt buộc'),
        content: Yup.string().required('Nội dung là bắt buộc'),
    });

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                // Try both methods to get categories
                let fetchedCategories = [];
                try {
                    fetchedCategories = await getCategoriesByType('dich-vu');
                    console.log('Categories from getCategoriesByType:', fetchedCategories);
                } catch (error) {
                    console.log('Error using getCategoriesByType:', error);
                    // Fallback to getCategories
                    fetchedCategories = await getCategories();
                    console.log('Categories from getCategories:', fetchedCategories);
                }
                
                if (fetchedCategories && fetchedCategories.length > 0) {
                    setCategories(fetchedCategories);
                } else {
                    // Use default categories
                    setCategories(serviceCategories);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
                // Set default categories
                setCategories(serviceCategories);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
        },
        accept: 'image/*',
    });

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        setSubmitting(true);
        
        try {
            if (!files || files.length === 0) {
                setNotification({ message: 'Vui lòng chọn ít nhất một hình ảnh', type: 'error' });
                setSubmitting(false);
                return;
            }

            // Hiển thị dữ liệu đang được gửi đi
            console.log('Submitting form with values:', values);
            console.log('Files to upload:', files);

            const formData = new FormData();

            // Thêm các trường cơ bản
            formData.append('name', values.title);
            formData.append('summary', values.summary);
            formData.append('child_nav_id', values.categoryId);
            formData.append('content', values.content);
            formData.append('type', 'dich-vu');
            formData.append('isFeatured', 'true');
            
            // Xử lý ảnh
            if (Array.isArray(files) && files.length > 0) {
                // Thêm từng tệp tin hợp lệ vào formData
                files.forEach((image, index) => {
                    // Sử dụng 'images[]' để backend biết đây là một mảng
                    formData.append('images[]', image);
                    console.log(`Appending file ${index}: ${image.name} (${image.size} bytes)`);
                });
            } else {
                console.error('files is not an array:', files);
                setNotification({ message: 'Lỗi khi xử lý hình ảnh, vui lòng thử lại.', type: 'error' });
                setSubmitting(false);
                return;
            }

            // Log FormData trước khi gửi
            console.log('FormData entries:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            // Thông báo đang xử lý
            setNotification({ message: 'Đang tạo dịch vụ...', type: 'info' });
            
            // Gửi dữ liệu
            console.log('Sending form data to server...');
            const response = await createService(formData);
            console.log('Service created successfully:', response);
            
            // Xử lý thành công
            setNotification({ message: 'Thêm dịch vụ thành công!', type: 'success' });
            resetForm();
            setFiles([]);
            
            // Chuyển hướng sau khi thành công
            setTimeout(() => {
                navigate(routes.serviceList);
            }, 1000);
        } catch (error) {
            console.error('Error submitting form:', error);
            setNotification({ 
                message: 'Lỗi khi thêm dịch vụ: ' + (error.response?.data?.error || error.message || 'Unknown error'), 
                type: 'error' 
            });
            console.error('Lỗi khi tạo dịch vụ:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
                console.error('Status:', error.response.status);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const removeFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.addService}>
            <Title text="Thêm mới dịch vụ" />
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
                            <ErrorMessage name="images" component="div" className={styles.error} />
                        </div>
                        
                        <div className={styles.imagePreview}>
                            {Array.isArray(files) && files.length > 0 ? (
                                files.map((img, index) => (
                                    <div key={index} className={styles.imageContainer}>
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`Service ${index}`}
                                            className={styles.productImage}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className={styles.removeButton}
                                        >
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noImages}>Chưa có hình ảnh nào được chọn</p>
                            )}
                        </div>
                        
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
                        
                        <button type="submit" disabled={isSubmitting || loading} className={styles.submitButton}>
                            {isSubmitting ? <Spin size="small" /> : 'Thêm Dịch Vụ'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddService;
