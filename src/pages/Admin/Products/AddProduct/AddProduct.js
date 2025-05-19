import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createProduct } from '~/services/productService';
import { getCategoriesBySlug } from '~/services/categoryService';
import PushNotification from '~/components/PushNotification/PushNotification';
import { useDropzone } from 'react-dropzone';
import styles from './AddProduct.module.scss';
import { useNavigate } from 'react-router-dom';
import routes from '~/config/routes';
import Title from '~/components/Title/Title';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { Spin } from 'antd';
import Button from '~/components/Button/Button';
import config from '~/config';

const AddProduct = () => {
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [files, setFiles] = useState([]);
    const [featureInput, setFeatureInput] = useState('');
    const [features, setFeatures] = useState([]);
    const navigate = useNavigate();

    // Danh sách các danh mục đặc biệt cho sản phẩm
    const foodCategories = [
        { id: 'khai-vi', title: 'Khai vị' },
        { id: 'mon-nhe', title: 'Món nhẹ' },
        { id: 'mang-truc-ban-thai', title: 'Măng trúc bản thái' },
        { id: 'mon-chinh', title: 'Món chính' },
        { id: 'mon-an-nhanh', title: 'Món ăn nhanh' },
        { id: 'mon-an-com', title: 'Món ăn cơm' },
        { id: 'mon-ve-sen', title: 'Món về sen' },
        { id: 'do-uong', title: 'Đồ uống' },
    ];

    const initialValues = {
        name: '',
        images: [],
        content: '',
        summary: '',
        child_nav_id: '',
        features: [],
        phone_number: '', // Added phone number field
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Tên sản phẩm là bắt buộc'),
        content: Yup.string().required('Nội dung là bắt buộc'),
        summary: Yup.string().required('Tóm tắt là bắt buộc'),
        child_nav_id: Yup.string().required('Danh mục là bắt buộc'),
        features: Yup.array().of(Yup.string()),
        phone_number: Yup.string().required('Số điện thoại là bắt buộc'),
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategoriesBySlug('san-pham');
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
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

    const handleSubmit = async (values, { resetForm }) => {
        if (!files || files.length === 0) {
            setNotification({ message: 'Vui lòng chọn ít nhất một hình ảnh', type: 'error' });
            return;
        }

        const formData = new FormData();

        formData.append('name', values.name);
        if (Array.isArray(files)) {
            files.forEach((image) => {
                formData.append('images[]', image);
            });
        } else {
            console.error('files is not an array:', files);
            setNotification({ message: 'Lỗi khi xử lý hình ảnh, vui lòng thử lại.', type: 'error' });
            return;
        }
        formData.append('content', values.content);
        formData.append('summary', values.summary);
        formData.append('child_nav_id', values.child_nav_id);
        formData.append('features', JSON.stringify(features));
        formData.append('phone_number', values.phone_number);
        formData.append('type', 'san-pham');
        formData.append('isFeatured', 'true');
        
        console.log('Đang tạo sản phẩm mới...');
        console.log('Chi tiết dữ liệu:');
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].size} bytes)` : pair[1]}`);
        }

        try {
            setNotification({ message: 'Đang tạo sản phẩm...', type: 'info' });
            const createdProduct = await createProduct(formData);
            console.log('Sản phẩm đã được tạo:', createdProduct);
            
            // Ensure created product has correct image paths
            if (createdProduct && createdProduct.images) {
                // Normalize image paths in returned product data
                if (Array.isArray(createdProduct.images)) {
                    createdProduct.images = createdProduct.images.map(img => {
                        if (typeof img === 'string') {
                            // If image path starts with /uploads, change to /images/uploads
                            if (img.startsWith('/uploads/')) {
                                return img.replace('/uploads/', '/images/uploads/');
                            }
                            // If image path starts without a slash, add one
                            if (img.startsWith('images/')) {
                                return `/${img}`;
                            }
                        }
                        return img;
                    });
                }
            }
            
            setNotification({ message: 'Thêm sản phẩm thành công!', type: 'success' });
            resetForm();
            setFiles([]);
            setFeatures([]);
            setTimeout(() => {
                navigate(routes.productList);
            }, 1000);
        } catch (error) {
            setNotification({ message: 'Lỗi khi thêm sản phẩm: ' + (error.message || 'Lỗi không xác định'), type: 'error' });
            console.error('Lỗi khi tạo sản phẩm:', error);
        }
    };

    const removeFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setFeatures([...features, featureInput.trim()]);
            setFeatureInput('');
        }
    };

    const removeFeature = (index) => {
        setFeatures((prevFeatures) => prevFeatures.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.addProduct}>
            <Title text="Thêm sản phẩm mới" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {({ isSubmitting, setFieldValue, values }) => (
                    <Form className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Tên Sản Phẩm</label>
                            <Field name="name" type="text" className={styles.input} />
                            <ErrorMessage name="name" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Chọn Hình Ảnh</label>
                            <div {...getRootProps()} className={styles.dropzone}>
                                <input {...getInputProps()} />
                                <p>Kéo thả file vào đây, hoặc nhấn để chọn file</p>
                            </div>
                            <ErrorMessage name="images" component="div" className={styles.error} />
                        </div>
                        <div className={styles.imagesPreview}>
                            {Array.isArray(files) && files.length > 0 ? (
                                files.map((img, index) => (
                                    <div key={index} className={styles.imageContainer}>
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`Product ${index}`}
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
                            <label htmlFor="child_nav_id">Danh Mục</label>
                            <Field as="select" name="child_nav_id" className={styles.input}>
                                <option value="">Chọn danh mục</option>
                                {/* Danh mục đặc biệt cho món ăn */}
                                {foodCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.title}
                                    </option>
                                ))}
                                {/* Các danh mục từ database */}
                                {categories.length > 0 && <option disabled>──────────</option>}
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.title}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="child_nav_id" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="summary">Tóm Tắt</label>
                            <Field name="summary" type="text" className={styles.input} />
                            <ErrorMessage name="summary" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone_number">Số Điện Thoại</label>
                            <Field name="phone_number" type="text" className={styles.input} />
                            <ErrorMessage name="phone_number" component="div" className={styles.error} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Thông tin tổng quan</label>
                            <div className={styles.featuresInput}>
                                <input
                                    type="text"
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    className={styles.input}
                                    placeholder="Nhập thông tin và nhấn nút thêm"
                                />
                                <Button type="button" primary onClick={addFeature} className={styles.addButton}>
                                    Thêm
                                </Button>
                            </div>
                            <div className={styles.featuresList}>
                                {features.map((feature, index) => (
                                    <div key={index} className={styles.featureItem}>
                                        <span className={styles.featureTitle}>
                                            {index + 1}. {feature}
                                        </span>
                                        <button
                                            primary
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className={styles.removeButtonFeat}
                                        >
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="content">Nội Dung</label>
                            <Field
                                as="textarea"
                                name="content"
                                className={`${styles.input} ${styles.textarea}`}
                                rows="8"
                                placeholder="Nhập nội dung chi tiết về sản phẩm..."
                            />
                            <ErrorMessage name="content" component="div" className={styles.error} />
                        </div>
                        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                            {isSubmitting ? <Spin /> : 'Thêm sản phẩm'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddProduct;
