import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './AddNavigation.module.scss';
import Title from '~/components/Title/Title';
import {
    getSubNavigation,
    getMainNavigation,
    createMainNavigationLink,
    createSubNavigationLink,
    createChildNavigationLink,
} from '~/services/navigationService';
import routes from '~/config/routes';
import { Link, useNavigate } from 'react-router-dom';
import PushNotification from '~/components/PushNotification/PushNotification';
import { Spin } from 'antd';

const AddNavigation = () => {
    const [isError, setIsError] = useState(false);
    const [navigations, setNavigations] = useState([]);
    const [notificationMessage, setNotificationMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNavigations = async () => {
            const data = await getSubNavigation(); // Fetch initial data for sub-navigation
            setNavigations(data);
        };

        fetchNavigations();
    }, []);

    const initialValues = {
        title: '',
        type: '',
        parent_nav_id: '',
        position: '',
    };

    const validationSchema = Yup.object({
        title: Yup.string().required('Vui lòng nhập tiêu đề!'),
        type: Yup.string()
            .required('Vui lòng chọn loại Navigation!')
            .oneOf(['main', 'sub', 'child'], 'Chọn loại không hợp lệ!'),
        parent_nav_id: Yup.number(),
        position: Yup.number().required('Vui lòng nhập vị trí!').integer().min(0, 'Vị trí không hợp lệ!'),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const { type, ...dataToSend } = values;

            if (dataToSend.parent_nav_id) {
                dataToSend.parent_nav_id = parseInt(dataToSend.parent_nav_id, 10);
            }

            let createFunction;

            switch (type) {
                case 'main':
                    createFunction = createMainNavigationLink;
                    dataToSend.created_by = 'admin';
                    dataToSend.updated_by = 'admin';
                    delete dataToSend.parent_nav_id;
                    break;
                case 'sub':
                    createFunction = createSubNavigationLink;
                    dataToSend.createdBy = 'admin';
                    dataToSend.updatedBy = 'admin';
                    break;
                case 'child':
                    createFunction = createChildNavigationLink;
                    dataToSend.createdBy = 'admin';
                    dataToSend.updatedBy = 'admin';
                    break;
                default:
                    throw new Error('Loại navigation không hợp lệ');
            }

            await createFunction(dataToSend);
            resetForm();
            setTimeout(() => {
                navigate(routes.navigationList);
            }, 1000);

            setIsError(false);
            setNotificationMessage('Thêm Navigation thành công');
        } catch (error) {
            setIsError(true);
            setNotificationMessage('Có lỗi khi thêm Navigation.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderNavigationOptions = (navItems, prefix = '') => {
        return navItems.map((nav) => (
            <React.Fragment key={nav.id}>
                <option value={nav.id}>{`${prefix}${nav.title}`}</option>
                {nav.children && renderNavigationOptions(nav.children, `${prefix}--`)}
            </React.Fragment>
        ));
    };

    return (
        <div className={styles.navigationContainer}>
            <div className={styles.formContainer}>
                <Title className={styles.pageTitle} text="Thêm mới Navigation" />
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className={styles.form}>
                            <div className={styles.formItem}>
                                <label htmlFor="title">Tiêu đề</label>
                                <Field name="title" type="text" />
                                <ErrorMessage name="title" component="div" className={styles.errorMessage} />
                            </div>

                            <div className={styles.formItem}>
                                <label htmlFor="type">Loại Navigation</label>
                                <Field
                                    as="select"
                                    name="type"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFieldValue('type', value);
                                        if (value === 'main') {
                                            // Fetch main navigation or clear parent_nav_id
                                            setNavigations([]); // Clear current navigation options
                                            // Optionally fetch main navigation links here
                                        } else if (value === 'sub') {
                                            // Fetch sub navigation links
                                            const fetchMainNavigations = async () => {
                                                const data = await getMainNavigation();
                                                setNavigations(data);
                                            };
                                            fetchMainNavigations();
                                        } else if (value === 'child') {
                                            // Fetch child navigation links
                                            const fetchSubNavigations = async () => {
                                                const data = await getSubNavigation();
                                                setNavigations(data);
                                            };
                                            fetchSubNavigations();
                                        }
                                    }}
                                >
                                    <option value="">Chọn loại</option>
                                    <option value="main">Navigation chính</option>
                                    <option value="sub">Navigation cấp 1</option>
                                    <option value="child">Navigation cấp 2</option>
                                </Field>

                                <ErrorMessage name="type" component="div" className={styles.errorMessage} />
                            </div>

                            {(values.type === 'sub' || values.type === 'child') && (
                                <div className={styles.formItem}>
                                    <label htmlFor="parent_nav_id">Navigation Cha</label>
                                    <Field as="select" name="parent_nav_id">
                                        <option value="">Chọn Navigation Cha</option>
                                        {renderNavigationOptions(navigations)}
                                    </Field>
                                    <ErrorMessage
                                        name="parent_nav_id"
                                        component="div"
                                        className={styles.errorMessage}
                                    />
                                </div>
                            )}

                            <div className={styles.formItem}>
                                <label htmlFor="position">Vị trí</label>
                                <Field name="position" type="number" placeholder="Nhập vị trí ( Ví dụ: 2 )" />
                                <ErrorMessage name="position" component="div" className={styles.errorMessage} />
                            </div>

                            <div className={styles.buttonContainer}>
                                <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                                    {isSubmitting ? <Spin size="small" /> : 'Thêm Navigation'}
                                </button>
                                <Link to={routes.navigationList} className={styles.backButton}>
                                    <button type="button" className={styles.cancelButton}>
                                        Hủy
                                    </button>
                                </Link>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            <PushNotification message={notificationMessage} type={isError ? 'error' : 'success'} />
        </div>
    );
};

export default AddNavigation;
