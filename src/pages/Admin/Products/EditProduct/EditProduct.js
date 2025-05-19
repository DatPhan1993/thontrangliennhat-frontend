import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoriesBySlug } from '~/services/categoryService';
import { getProductById, updateProduct } from '~/services/productService';
import PushNotification from '~/components/PushNotification/PushNotification';
import { useDropzone } from 'react-dropzone';
import styles from './EditProduct.module.scss';
import routes from '~/config/routes';
import Title from '~/components/Title/Title';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { Spin } from 'antd';
import Button from '~/components/Button/Button';
import config from '~/config';
import { normalizeImageUrl, normalizeImageArray, DEFAULT_IMAGE } from '~/utils/imageUtils';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([
        { id: 'khai-vi', title: 'Khai vị' },
        { id: 'mon-nhe', title: 'Món nhẹ' },
        { id: 'mang-truc-ban-thai', title: 'Măng trúc bản thái' },
        { id: 'mon-chinh', title: 'Món chính' },
        { id: 'mon-an-nhanh', title: 'Món ăn nhanh' },
        { id: 'mon-an-com', title: 'Món ăn cơm' },
        { id: 'mon-ve-sen', title: 'Món về sen' },
        { id: 'do-uong', title: 'Đồ uống' }
    ]);
    const [product, setProduct] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [featureInput, setFeatureInput] = useState('');
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fileList, setFileList] = useState([]);
    
    // Form values
    const [formValues, setFormValues] = useState({
        name: '',
        content: '',
        child_nav_id: '',
        summary: '',
        phone_number: '',
    });
    
    // Create a memoized fetchCategories function
    const fetchCategories = useCallback(async () => {
        try {
            const fetchedCategories = await getCategoriesBySlug('san-pham');
            if (fetchedCategories && fetchedCategories.length > 0) {
                setCategories(prevCategories => {
                    const existingIds = prevCategories.map(cat => cat.id);
                    const newCategories = fetchedCategories.filter(cat => !existingIds.includes(cat.id));
                    return [...prevCategories, ...newCategories];
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }, []);
    
    // Create a memoized fetchProduct function
    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const productData = await getProductById(id);
            
            if (productData) {
                setProduct(productData);
                
                // Parse features if they exist
                try {
                    const parsedFeatures = productData.features ? 
                        (typeof productData.features === 'string' ? 
                            JSON.parse(productData.features) : 
                            productData.features) : 
                        [];
                    setFeatures(parsedFeatures);
                } catch (parseError) {
                    console.error('Error parsing features:', parseError);
                    setFeatures([]);
                }
                
                // Set form values
                setFormValues({
                    name: productData.name || '',
                    content: productData.content || '',
                    child_nav_id: productData.child_nav_id || '',
                    summary: productData.summary || '',
                    phone_number: productData.phone_number || '',
                });
                
                // Set existing images
                if (productData.images) {
                    // Sử dụng utility để chuẩn hóa mảng hình ảnh
                    const processedImages = normalizeImageArray(productData.images);
                    console.log('Processed images:', processedImages);
                    setFileList(processedImages);
                }
            } else {
                setNotification({ 
                    message: 'Không tìm thấy thông tin sản phẩm', 
                    type: 'error' 
                });
                setTimeout(() => navigate(routes.productList), 2000);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            setNotification({ 
                message: `Error loading product: ${error.message}`, 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);
    
    useEffect(() => {
        fetchCategories();
        fetchProduct();
    }, [fetchCategories, fetchProduct]);
    
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            const maxImages = 10;
            if (fileList.length + acceptedFiles.length > maxImages) {
                setNotification({ 
                    message: `You can only upload up to ${maxImages} images`, 
                    type: 'error'
                });
                return;
            }
            
            setFileList(prev => [...prev, ...acceptedFiles]);
        },
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxSize: 5242880,
    });
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        
        try {
            setSubmitting(true);
            
            // Create a FormData instance
            const formData = new FormData();
            
            // Add basic form fields
            formData.append('name', formValues.name);
            formData.append('content', formValues.content);
            formData.append('summary', formValues.summary);
            formData.append('phone_number', formValues.phone_number);
            formData.append('child_nav_id', formValues.child_nav_id);
            
            // Add features as JSON string
            formData.append('features', JSON.stringify(features));
            
            // Add files
            fileList.forEach(file => {
                if (file instanceof File) {
                    formData.append('images[]', file);
                } else if (typeof file === 'string') {
                    formData.append('images[]', file);
                }
            });
            
            // Log form data for debugging
            console.log('Submitting update for product ID:', id);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
            }
            
            // Use the updateProduct service instead of XMLHttpRequest
            const updatedProduct = await updateProduct(id, formData);
            
            setNotification({ 
                message: 'Cập nhật sản phẩm thành công!', 
                type: 'success' 
            });
            
            setTimeout(() => {
                navigate(routes.productList);
            }, 1500);
            
        } catch (error) {
            console.error('Error updating product:', error);
            setNotification({
                message: `Lỗi khi cập nhật sản phẩm: ${error.message || 'Lỗi không xác định'}`,
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };
    
    const removeFile = (index) => {
        setFileList(prev => prev.filter((_, i) => i !== index));
    };
    
    const addFeature = () => {
        if (featureInput.trim()) {
            setFeatures(prev => {
                if (!prev.includes(featureInput.trim())) {
                    return [...prev, featureInput.trim()];
                }
                return prev;
            });
            setFeatureInput('');
        }
    };
    
    const removeFeature = (index) => {
        setFeatures(prev => prev.filter((_, i) => i !== index));
    };
    
    return (
        <div className={styles.editProduct}>
            <Title text="Cập nhật sản phẩm" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            
            {loading ? (
                <div className={styles.loadingContainer}>
                    <Spin size="large" />
                    <p>Đang tải thông tin sản phẩm...</p>
                </div>
            ) : product ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Tên Sản Phẩm</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className={styles.input}
                            value={formValues.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="phone_number">Số Điện Thoại</label>
                        <input
                            id="phone_number"
                            name="phone_number"
                            type="text"
                            className={styles.input}
                            value={formValues.phone_number}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label>Chọn Hình Ảnh</label>
                        <div {...getRootProps()} className={styles.dropzone}>
                            <input {...getInputProps()} />
                            <p>Kéo thả file vào đây, hoặc nhấn để chọn file</p>
                        </div>
                    </div>
                    
                    <div className={styles.imagesPreview}>
                        {fileList.map((img, index) => {
                            // Determine the correct image source
                            let imgSrc;
                            if (img instanceof File) {
                                imgSrc = URL.createObjectURL(img);
                            } else if (typeof img === 'string') {
                                // Ensure all URLs use the correct format
                                let normalizedUrl = img;
                                
                                // Add /images prefix if path starts with /uploads
                                if (img.startsWith('/uploads/')) {
                                    normalizedUrl = img.replace('/uploads/', '/images/uploads/');
                                }
                                
                                // Add leading slash if missing
                                if (img.startsWith('images/')) {
                                    normalizedUrl = `/${img}`;
                                }
                                
                                imgSrc = normalizeImageUrl(normalizedUrl);
                            } else {
                                imgSrc = DEFAULT_IMAGE;
                            }
                            
                            return (
                                <div key={index} className={styles.imageContainer}>
                                    <img
                                        src={imgSrc}
                                        alt={`Product ${index + 1}`}
                                        className={styles.productImage}
                                        onError={(e) => {
                                            console.error('Failed to load image:', imgSrc);
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = DEFAULT_IMAGE;
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className={styles.removeButton}
                                        title="Remove image"
                                    >
                                        <FontAwesomeIcon icon={faClose} />
                                    </button>
                                </div>
                            );
                        })}
                        {fileList.length === 0 && (
                            <div className={styles.noImagesMessage}>
                                Chưa có hình ảnh nào được tải lên
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="child_nav_id">Danh Mục</label>
                        <select
                            id="child_nav_id"
                            name="child_nav_id"
                            className={styles.input}
                            value={formValues.child_nav_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="summary">Tóm Tắt</label>
                        <input
                            id="summary"
                            name="summary"
                            type="text"
                            className={styles.input}
                            value={formValues.summary}
                            onChange={handleInputChange}
                            required
                        />
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
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addFeature();
                                    }
                                }}
                            />
                            <Button type="button" primary onClick={addFeature} className={styles.addButton}>
                                Thêm
                            </Button>
                        </div>
                        <div className={styles.featuresList}>
                            {features.length > 0 ? (
                                features.map((feature, index) => (
                                    <div key={index} className={styles.featureItem}>
                                        <span className={styles.featureTitle}>
                                            {index + 1}. {feature}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className={styles.removeButtonFeat}
                                        >
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noFeaturesMessage}>
                                    Chưa có thông tin nào được thêm
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="content">Nội Dung</label>
                        <textarea
                            id="content"
                            name="content"
                            className={styles.textarea}
                            rows="10"
                            value={formValues.content}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className={styles.submitButton}
                        >
                            {submitting ? <Spin size="small" /> : 'Cập Nhật'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.errorContainer}>
                    <p>Không tìm thấy thông tin sản phẩm.</p>
                </div>
            )}
        </div>
    );
};

export default EditProduct;
