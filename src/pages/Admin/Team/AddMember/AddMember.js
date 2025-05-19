import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { addMember } from '~/services/teamService';
import PushNotification from '~/components/PushNotification/PushNotification';
import styles from './AddMember.module.scss';
import routes from '~/config/routes';
import Title from '~/components/Title/Title';
import { useDropzone } from 'react-dropzone';

const AddMember = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues = {
        name: '',
        qualification: '',
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Tên thành viên là bắt buộc'),
        qualification: Yup.string().required('Vị trí là bắt buộc'),
    });

    const handleImageUpload = (acceptedFiles) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    };

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        setIsSubmitting(true);
        const formData = new FormData();

        formData.append('name', values.name);
        formData.append('position', values.qualification);

        if (files.length > 0) {
            formData.append('image', files[0]);
        }

        try {
            const response = await addMember(formData);
            console.log('Member added successfully:', response);
            
            resetForm();
            setFiles([]);
            setNotification({ message: 'Thêm thành viên thành công!', type: 'success' });

            // Wait a moment before redirecting
            setTimeout(() => {
                // Navigate to the member list with a query parameter to indicate a refresh is needed
                navigate(`${routes.memberList}?refresh=true&timestamp=${Date.now()}`);
            }, 1500);
        } catch (error) {
            console.error('Lỗi khi tạo thành viên:', error);
            setNotification({ 
                message: `Lỗi khi thêm thành viên: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`, 
                type: 'error' 
            });
            setSubmitting(false);
            setIsSubmitting(false);
        }
    };

    const removeFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: handleImageUpload,
        accept: 'image/*',
    });

    return (
        <div className={styles.addMember}>
            <Title text="Thêm thành viên" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {({ isSubmitting: formikSubmitting }) => (
                    <Form className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Tên Thành viên</label>
                            <Field name="name" type="text" className={styles.input} />
                            <ErrorMessage name="name" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="qualification">Vị trí</label>
                            <Field name="qualification" type="text" className={styles.input} />
                            <ErrorMessage name="qualification" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Chọn Hình Ảnh</label>
                            <div {...getRootProps()} className={styles.dropzone}>
                                <input {...getInputProps()} />
                                <p>Kéo thả file vào đây, hoặc nhấn để chọn file</p>
                            </div>
                            <ErrorMessage name="image" component="div" className={styles.error} />
                        </div>
                        <div className={styles.imagePreview}>
                            {files.map((file, index) => (
                                <div key={index} className={styles.imageContainer}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Member ${index}`}
                                        className={styles.memberImage}
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
                        <button 
                            type="submit" 
                            disabled={formikSubmitting || isSubmitting} 
                            className={styles.submitButton}
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Thêm Thành viên'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddMember;
