import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { getMemberById, updateMember } from '~/services/teamService';
import { getImageUrl } from '~/utils/imageUtils';
import PushNotification from '~/components/PushNotification/PushNotification';
import styles from './UpdateMember.module.scss';
import routes from '~/config/routes';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import Title from '~/components/Title/Title';

const UpdateMember = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [initialValues, setInitialValues] = useState(null);

    const validationSchema = Yup.object({
        name: Yup.string().required('Tên thành viên là bắt buộc'),

        qualification: Yup.string().required('Vị trí là bắt buộc'),

        image: Yup.mixed(),
    });

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const member = await getMemberById(id);
                setInitialValues({
                    name: member.name,
                    qualification: member.position,
                    image: member.image || null,
                });
            } catch (error) {
                console.error('Lỗi khi tải thành viên:', error);
            }
        };

        fetchMember();
    }, [id]);

    const handleImageUpload = (event, setFieldValue) => {
        const file = event.target.files[0];
        setFieldValue('image', file);
    };

    const handleSubmit = async (values, { resetForm }) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('position', values.qualification);
        if (values.image) {
            formData.append('image', values.image);
        }

        try {
            await updateMember(id, formData);
            setNotification({ message: 'Cập nhật thành viên thành công!', type: 'success' });
            resetForm();
            setTimeout(() => {
                navigate(routes.memberList);
            }, 1000);
        } catch (error) {
            setNotification({ message: 'Lỗi khi cập nhật thành viên.', type: 'error' });
            console.error('Lỗi khi cập nhật thành viên:', error);
        }
    };

    if (!initialValues) return <LoadingScreen />;

    return (
        <div className={styles.updateMember}>
            <Title text="Cập nhật thành viên" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {({ isSubmitting, setFieldValue, values }) => (
                    <Form className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Tên Thành Viên</label>
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
                                        typeof values.image === 'string'
                                            ? getImageUrl(values.image)
                                            : URL.createObjectURL(values.image)
                                    }
                                    alt="Member"
                                    className={styles.memberImage}
                                    onError={(e) => {
                                        console.error('Image preview error:', values.image);
                                        e.target.src = '/placeholder-image.svg';
                                    }}
                                />
                            </div>
                        )}

                        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                            Cập Nhật Thành Viên
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default UpdateMember;
