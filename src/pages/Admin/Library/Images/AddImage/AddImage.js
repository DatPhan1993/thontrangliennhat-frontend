import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { createImage } from '~/services/libraryService';
import PushNotification from '~/components/PushNotification/PushNotification';
import { useDropzone } from 'react-dropzone';
import styles from './AddImage.module.scss';
import routes from '~/config/routes';
import Title from '~/components/Title/Title';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faUpload, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const AddImage = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const initialValues = {
        image: [],
    };

    const validationSchema = Yup.object({
        image: Yup.array().required('Hình ảnh là bắt buộc'),
    });

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                console.log('Files dropped:', acceptedFiles);
                setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
            }
        },
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
    });

    const handleSubmit = async (values, { resetForm }) => {
        if (files.length === 0) {
            setNotification({ message: 'Vui lòng chọn ảnh!', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            console.log('Adding images, count:', files.length);
            
            // Clear all caches to ensure we get fresh data
            sessionStorage.removeItem('allImages');
            localStorage.removeItem('allImages');
            
            // Process each file with a delay between uploads to avoid overwhelming the server
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setUploadProgress(Math.round((i / files.length) * 100));
                
                const formData = new FormData();
                formData.append('image', file);
                formData.append('name', file.name || 'phunong_image');
                formData.append('description', `Hình ảnh tải lên: ${file.name}`);
                
                try {
                    console.log('Uploading image:', file.name);
                    await createImage(formData);
                    successCount++;
                    
                    // Update progress after each successful upload
                    setUploadProgress(Math.round(((i + 1) / files.length) * 100));
                    
                    // Clear all caches after each successful upload
                    sessionStorage.removeItem('allImages');
                    localStorage.removeItem('allImages');
                    
                    // Buộc xóa toàn bộ cache của trình duyệt
                    if (window.caches) {
                        try {
                            const keys = await window.caches.keys();
                            await Promise.all(keys.map(key => window.caches.delete(key)));
                            console.log('Browser cache cleared');
                        } catch (e) {
                            console.error('Error clearing browser cache:', e);
                        }
                    }
                } catch (error) {
                    console.error(`Error uploading image ${file.name}:`, error);
                    errorCount++;
                }
                
                // Add a small delay between uploads
                if (i < files.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            if (successCount > 0) {
                let message = `Đã tải lên thành công ${successCount} ảnh`;
                if (errorCount > 0) {
                    message += `, ${errorCount} ảnh bị lỗi`;
                }
                setNotification({ message, type: 'success' });
            } else {
                setNotification({ 
                    message: 'Tất cả các ảnh đều tải lên không thành công', 
                    type: 'error' 
                });
            }
            
            resetForm();
            setFiles([]);
            
            // Clear all caches again after adding images
            sessionStorage.removeItem('allImages');
            localStorage.removeItem('allImages');
            
            // Hiển thị thông báo thành công và yêu cầu người dùng đợi
            setNotification({ 
                message: `Đã tải lên thành công ${successCount} ảnh. Đang chuẩn bị hiển thị danh sách...`, 
                type: 'success' 
            });
            
            // Xử lý chuyển trang một cách đáng tin cậy:
            // 1. Lưu thông tin tải lên vào localStorage
            localStorage.setItem('uploadSuccess', 'true');
            localStorage.setItem('uploadCount', successCount.toString());
            localStorage.setItem('uploadTime', Date.now().toString());
            
            // 2. Chuyển hướng với force reload
            setTimeout(() => {
                try {
                    // Thử phương thức 1: window.location.replace
                    window.location.replace(`${routes.imagesList}?refresh=true&t=${Date.now()}`);
                    
                    // Đặt timeout dự phòng để đảm bảo trang được tải lại
                    setTimeout(() => {
                        if (document.location.href.indexOf(routes.imagesList) === -1) {
                            console.log('Fallback reload triggered');
                            window.location.href = `${routes.imagesList}?refresh=true&hard=true&t=${Date.now()}`;
                        }
                    }, 3000);
                } catch (error) {
                    console.error('Navigation error:', error);
                    // Phương thức dự phòng
                    window.open(`${routes.imagesList}?refresh=true&t=${Date.now()}`, '_self');
                }
            }, 1500);
        } catch (error) {
            console.error('Error adding images:', error);
            setNotification({ 
                message: `Lỗi khi thêm ảnh: ${error.message || 'Vui lòng thử lại'}`, 
                type: 'error' 
            });
        } finally {
            setIsSubmitting(false);
            setUploadProgress(100);
        }
    };

    const removeFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.addImage}>
            <Title text="Thêm hình ảnh" />
            {notification.message && (
                <PushNotification 
                    message={notification.message} 
                    type={notification.type} 
                />
            )}
            <Formik 
                initialValues={initialValues} 
                validationSchema={validationSchema} 
                onSubmit={handleSubmit}
            >
                {({ submitForm }) => (
                    <Form className={styles.form}>
                        <div {...getRootProps()} className={styles.dropzone}>
                            <input {...getInputProps()} />
                            <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
                            <p>Kéo thả file vào đây, hoặc nhấn để chọn file</p>
                            <small>Hỗ trợ: JPG, PNG, GIF, WEBP (tối đa 10MB)</small>
                        </div>
                        <ErrorMessage name="image" component="div" className={styles.error} />
                        
                        {files.length > 0 && (
                            <div className={styles.filesHeading}>
                                <h3>Hình ảnh đã chọn ({files.length})</h3>
                            </div>
                        )}
                        
                        <div className={styles.imagePreview}>
                            {files.map((img, index) => (
                                <div key={index} className={styles.imageContainer}>
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`Preview ${index}`}
                                        className={styles.imageLogo}
                                        onError={(e) => {
                                            console.error('Image preview error');
                                            e.target.src = '/placeholder-image.svg';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className={styles.removeButton}
                                    >
                                        <FontAwesomeIcon icon={faClose} />
                                    </button>
                                    <div className={styles.fileName}>
                                        {img.name}
                                        <span className={styles.fileSize}>
                                            {(img.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {isSubmitting && uploadProgress < 100 && (
                            <div className={styles.progressWrapper}>
                                <div 
                                    className={styles.progressBar} 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                                <span className={styles.progressText}>
                                    {uploadProgress}% Complete
                                </span>
                            </div>
                        )}
                        
                        <div className={styles.formActions}>
                            <button 
                                type="button" 
                                onClick={() => navigate(routes.imagesList)}
                                className={styles.cancelButton}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={submitForm} 
                                disabled={isSubmitting || files.length === 0} 
                                className={styles.submitButton}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className={styles.spinner}></div> 
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    `Tải lên ${files.length} ảnh`
                                )}
                            </button>
                        </div>
                        
                        {files.length > 10 && (
                            <div className={styles.warningMessage}>
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>Tải lên nhiều ảnh cùng lúc có thể mất thời gian. Vui lòng đợi.</span>
                            </div>
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddImage;
