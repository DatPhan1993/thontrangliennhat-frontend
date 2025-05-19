/* eslint-disable jsx-a11y/iframe-has-title */
import classNames from 'classnames/bind';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faMapMarkerAlt,
    faPhone,
    // faMobileAlt,
    // faWrench,
    // faCogs,
    // faChartLine,
    // faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import Button from '~/components/Button/Button';
import { createMessage } from '~/services/contactService';
import PushNotification from '~/components/PushNotification/PushNotification';
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from './Contact.module.scss';
import {
    faFacebook,
    faInstagram,
    faSkype,
    faTelegram,
    faTwitter,
    faViber,
    faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const ContactPage = () => {
    const [notification, setNotification] = useState({ message: '', type: '' });

    const initialValues = {
        fullName: '',
        email: '',
        phoneNumber: '',
        subject: '',
        message: '',
    };

    const validationSchema = Yup.object({
        fullName: Yup.string().required('Vui lòng nhập Họ và Tên của bạn!'),
        email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập Email!'),
        phoneNumber: Yup.string().required('Vui lòng nhập số điện thoại'),
        subject: Yup.string().required('Vui lòng chọn chủ đề!'),
        message: Yup.string().required('Vui lòng nhập nội dung tin nhắn!'),
    });

    const handleSubmit = async (values, { resetForm }) => {
        try {
            await createMessage(values);
            setNotification({ message: 'Gửi tin nhắn thành công!', type: 'success' });
            resetForm();
        } catch (error) {
            console.error('Error sending message:', error);
            setNotification({ message: 'Lỗi khi gửi tin nhắn.', type: 'error' });
        }
    };

    return (
        <div className={cx('contactPage')}>
            <HelmetProvider>
                <title>Liên Hệ | HTX Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
                <meta name="description" content="Hãy gửi tin nhắn cho chúng tôi nếu bạn có bất kỳ câu hỏi nào." />
                <meta name="keywords" content="liên hệ, phunongbuondon, gửi tin nhắn" />
                <meta name="author" content="HTX Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật" />
            </HelmetProvider>
            <div className={cx('mapContainer')}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3835.6384664993598!2d105.897143!3d18.3774982!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31384f2435e39f2b%3A0x900bdf89bb6fe1d6!2zVEjDlE4gVFJBTkcgTEnDik4gTkjhuqxU!5e1!3m2!1svi!2s!4v1744729590476!5m2!1svi!2s"
                    width="100%"
                    height="600"
                    style={{ border: 0 }}
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
            <div className={cx('inner')}>
                <div className={cx('formWrapper')}>
                    <div className={cx('contactInfo')}>
                        <div className={cx('infoTitle')}>
                            <h2 className={cx('title')}>Thông tin liên hệ</h2>
                            <p className={cx('subTitle')}>Hãy liên hệ với chúng tôi!</p>
                        </div>
                        <div className={cx('infoDetails')}>
                            <div className={cx('infoItem')}>
                                <FontAwesomeIcon icon={faPhone} className={cx('icon')} />
                                <a href="tel:0943768858">
                                    Mobile/Zalo: <span>0943 768 858</span>
                                </a>
                            </div>
                            <div className={cx('infoItem')}>
                                <FontAwesomeIcon icon={faEnvelope} className={cx('icon')} />
                                <a href="mailto:thontrangliennhat@gmail.com">
                                    Email: <span>thontrangliennhat@gmail.com</span>
                                </a>
                            </div>
                            <div className={cx('infoItem')}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} className={cx('icon')} />
                                <span>Địa chỉ: TDP Liên Nhật , Phường Thạch Hạ , Thành Phố Hà Tĩnh , Hà Tĩnh</span>
                            </div>
                        </div>

                        <div className={cx('socialLinks')}>
                            <Link to="https://www.facebook.com/profile.php?id=100091055392835">
                                <FontAwesomeIcon icon={faFacebook} className={cx('socialIcon')} />
                            </Link>
                            <Link to="https://www.instagram.com/datphan93/">
                                <FontAwesomeIcon icon={faInstagram} className={cx('socialIcon')} />
                            </Link>
                            <Link to="https://www.facebook.com/profile.php?id=100091055392835">
                                <FontAwesomeIcon icon={faTwitter} className={cx('socialIcon')} />
                            </Link>
                        </div>
                    </div>
                    <div className={cx('contactForm')}>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div className={cx('formGroup')}>
                                        <label htmlFor="fullName">Họ và Tên</label>
                                        <Field type="text" id="fullName" name="fullName" className={cx('input')} />
                                        <ErrorMessage name="fullName" component="div" className={cx('error')} />
                                    </div>
                                    <div className={cx('formGroup', 'formRow')}>
                                        <div className={cx('formHalf')}>
                                            <label htmlFor="email">Email</label>
                                            <Field type="email" id="email" name="email" className={cx('input')} />
                                            <ErrorMessage name="email" component="div" className={cx('error')} />
                                        </div>
                                        <div className={cx('formHalf')}>
                                            <label htmlFor="phoneNumber">Số điện thoại</label>
                                            <Field
                                                type="text"
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                className={cx('input')}
                                            />
                                            <ErrorMessage name="phoneNumber" component="div" className={cx('error')} />
                                        </div>
                                    </div>
                                    <div className={cx('formGroup')}>
                                        <label>Chủ đề</label>
                                        <div className={cx('subject')}>
                                            <Field
                                                type="radio"
                                                name="subject"
                                                id="subject1"
                                                value="Dịch vụ"
                                                className={cx('customRadio')}
                                            />
                                            <label htmlFor="subject1" className={cx('radioLabel')}>
                                                Dịch vụ
                                            </label>
                                            <Field
                                                type="radio"
                                                name="subject"
                                                id="subject2"
                                                value="Sản phẩm"
                                                className={cx('customRadio')}
                                            />
                                            <label htmlFor="subject2" className={cx('radioLabel')}>
                                                Sản phẩm
                                            </label>
                                            <Field
                                                type="radio"
                                                name="subject"
                                                id="subject3"
                                                value="Trải nghiệm"
                                                className={cx('customRadio')}
                                            />
                                            <label htmlFor="subject3" className={cx('radioLabel')}>
                                                Trải nghiệm
                                            </label>
                                            <Field
                                                type="radio"
                                                name="subject"
                                                id="subject4"
                                                value="Khác"
                                                className={cx('customRadio')}
                                            />
                                            <label htmlFor="subject3" className={cx('radioLabel')}>
                                                Khác
                                            </label>
                                        </div>
                                        <ErrorMessage name="subject" component="div" className={cx('error')} />
                                    </div>
                                    <div className={cx('formGroup')}>
                                        <label htmlFor="message">Nội dung</label>
                                        <Field
                                            as="textarea"
                                            id="message"
                                            name="message"
                                            className={cx('input', 'textarea')}
                                        />
                                        <ErrorMessage name="message" component="div" className={cx('error')} />
                                    </div>
                                    <div className={cx('formActions')}>
                                        <Button type="submit" disabled={isSubmitting}>
                                            Gửi
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
            <PushNotification message={notification.message} type={notification.type} />
        </div>
    );
};

export default ContactPage;
