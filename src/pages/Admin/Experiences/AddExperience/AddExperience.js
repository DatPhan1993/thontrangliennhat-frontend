import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createExperience } from '~/services/experienceService';
import { getCategoriesBySlug } from '~/services/categoryService';
import PushNotification from '~/components/PushNotification/PushNotification';
import styles from './AddExperience.module.scss';
import routes from '~/config/routes';
import { useNavigate } from 'react-router-dom';
import Title from '~/components/Title/Title';
import { useDropzone } from 'react-dropzone';
import { Spin } from 'antd';
import { compressImage } from '~/utils/fileUtils';
import useDataRefresh from '~/hooks/useDataRefresh';

const AddExperience = () => {
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formikRef = useRef(null);
    const navigate = useNavigate();
    const { clearExperienceCache, clearAllCache } = useDataRefresh();

    const initialValues = {
        title: '',
        summary: '',
        images: [],
        categoryId: '',
        content: '',
        isFeatured: false,
    };

    const validationSchema = Yup.object({
        title: Yup.string().required('Tiêu đề là bắt buộc'),
        summary: Yup.string().required('Tóm tắt là bắt buộc'),
        images: Yup.array().min(1, 'Hình ảnh là bắt buộc'),
        categoryId: Yup.string().required('Danh mục là bắt buộc'),
        content: Yup.string().required('Nội dung là bắt buộc'),
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategoriesBySlug('trai-nghiem');
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
            }
        };
        // Clear cache before fetching categories
        clearExperienceCache();
        fetchCategories();
    }, [clearExperienceCache]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: async (acceptedFiles) => {
            try {
                // Compress images before setting them
                const compressedFiles = await Promise.all(
                    acceptedFiles.map(file => compressImage(file, { maxWidth: 1200, quality: 0.8 }))
                );
                
                setFiles((prevFiles) => [...prevFiles, ...compressedFiles]);
                
                // Also set the field value for Formik validation
                if (compressedFiles.length > 0) {
                    formikRef.current?.setFieldValue('images', compressedFiles);
                }
            } catch (error) {
                console.error('Error compressing images:', error);
                // Fall back to original files if compression fails
                setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
                if (acceptedFiles.length > 0) {
                    formikRef.current?.setFieldValue('images', acceptedFiles);
                }
            }
        },
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        }
    });

    // Function to sync database
    const syncDatabase = async () => {
        try {
            console.log('Forcing database sync...');
            
            // Try multiple endpoints for database sync to ensure it works
            const endpoints = [
                '/run-sync-script',                           // Direct script execution endpoint
                '/api/admin/run-sync-script',                 // Admin script execution endpoint
                '/api/admin/sync-database',                   // Normal sync endpoint
                '/phunongbuondon-api/api/admin/sync-database' // Alternative path
            ];
            
            let syncSuccess = false;
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`Attempting sync via ${endpoint}...`);
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            force: true,
                            timestamp: new Date().getTime()
                        })
                    });
                    
                    if (response.ok) {
                        console.log(`Database synchronized successfully via ${endpoint}`);
                        syncSuccess = true;
                        break;
                    } else {
                        console.warn(`Sync failed via ${endpoint}:`, await response.text());
                    }
                } catch (endpointError) {
                    console.warn(`Error with endpoint ${endpoint}:`, endpointError);
                }
            }
            
            // If all endpoints fail, try direct fetch of database.json files to force browser cache refresh
            if (!syncSuccess) {
                try {
                    const cacheBreaker = new Date().getTime();
                    const cacheUrls = [
                        `/phunongbuondon-api/database.json?_=${cacheBreaker}`,
                        `/database.json?_=${cacheBreaker}`,
                        `/public/phunongbuondon-api/database.json?_=${cacheBreaker}`
                    ];
                    
                    await Promise.all(cacheUrls.map(url => fetch(url).catch(e => console.warn(`Cache refresh failed for ${url}:`, e))));
                    console.log('Forced database.json cache refresh');
                } catch (fetchError) {
                    console.warn('Failed to refresh database.json cache:', fetchError);
                }
            }
            
            return syncSuccess;
        } catch (error) {
            console.error('Error syncing database:', error);
            return false;
        }
    };

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        setIsSubmitting(true);
        
        try {
            // Clear cache before making the request
            clearExperienceCache();
            
            const formData = new FormData();

            // Verify that required data is present
            if (!values.title || !values.summary || !values.categoryId || !values.content) {
                setNotification({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc.', type: 'error' });
                return;
            }

            // Check if files are uploaded
            if (files.length === 0) {
                setNotification({ message: 'Vui lòng chọn ít nhất một hình ảnh.', type: 'error' });
                return;
            }

            // Add form fields
            formData.append('name', values.title);
            formData.append('title', values.title);
            formData.append('summary', values.summary);
            formData.append('child_nav_id', values.categoryId);
            formData.append('categoryId', values.categoryId);
            formData.append('content', values.content);
            formData.append('isFeatured', values.isFeatured);

            // Add images
            files.forEach((image) => {
                formData.append('images[]', image);
            });

            console.log('Submitting experience data...');
            
            // Log FormData contents for debugging
            console.log('FormData contents:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }
            
            // Call API to create experience
            const result = await createExperience(formData);
            
            // Clear ALL cache after successful creation
            clearAllCache();
            
            // Force sync with database.json
            await syncDatabase();
            
            // Try a second sync after a short delay to ensure data is saved
            setTimeout(async () => {
                await syncDatabase();
                console.log('Secondary database sync completed');
            }, 1000);
            
            // Check if there are any warnings
            if (result && result._warning) {
                // Success with warning
                setNotification({ 
                    message: `Thêm trải nghiệm thành công!`, 
                    type: 'success' 
                });
                console.warn('Warning from API:', result._warning);
            } else {
                // Complete success
                setNotification({ message: 'Thêm trải nghiệm thành công!', type: 'success' });
            }
            
            // Reset form
            resetForm();
            setFiles([]);
            
            // Clear all cache one more time before redirecting
            clearAllCache();
            
            // Force cache refresh for database.json
            const timestamp = new Date().getTime();
            try {
                await fetch(`/phunongbuondon-api/database.json?_=${timestamp}`);
                console.log('Forced client-side cache refresh for database.json');
            } catch (cacheError) {
                console.warn('Cache refresh error:', cacheError);
            }
            
            // Redirect after success
            setTimeout(() => {
                navigate(routes.experienceList);
            }, 2000);
        } catch (error) {
            console.error('Error creating experience:', error);
            
            // Show user-friendly error message
            const errorMessage = error.message || 'Lỗi khi thêm trải nghiệm. Vui lòng thử lại sau.';
            setNotification({ 
                message: errorMessage, 
                type: 'error' 
            });
            
            // Keep form values so user doesn't lose their input
        } finally {
            setSubmitting(false);
            setIsSubmitting(false);
        }
    };

    const removeFile = (index) => {
        setFiles((prevFiles) => {
            const newFiles = prevFiles.filter((_, i) => i !== index);
            formikRef.current?.setFieldValue('images', newFiles);
            return newFiles;
        });
    };

    const handleCancel = () => {
        navigate(routes.experienceList);
    };

    return (
        <div className={styles.addExperience}>
            <Title text="Thêm mới trải nghiệm" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <Formik 
                initialValues={initialValues} 
                validationSchema={validationSchema} 
                onSubmit={handleSubmit}
                innerRef={formikRef}
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
                            <div {...getRootProps()} className={styles.dropzone}>
                                <input {...getInputProps()} />
                                <p>Kéo thả file vào đây, hoặc nhấn để chọn file</p>
                            </div>
                            <ErrorMessage name="images" component="div" className={styles.error} />
                        </div>
                        <div className={styles.imagePreview}>
                            {files.map((img, index) => (
                                <div key={index} className={styles.imageContainer}>
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`Experience ${index}`}
                                        className={styles.experienceImage}
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
                        <div className={styles.formGroup + ' ' + styles.checkboxGroup}>
                            <label>
                                <Field type="checkbox" name="isFeatured" />
                                Hiển thị nổi bật
                            </label>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button 
                                type="submit" 
                                disabled={formSubmitting || isSubmitting} 
                                className={styles.submitButton}
                            >
                                {formSubmitting || isSubmitting ? <Spin size="small" /> : 'Thêm Trải nghiệm'}
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

export default AddExperience;
