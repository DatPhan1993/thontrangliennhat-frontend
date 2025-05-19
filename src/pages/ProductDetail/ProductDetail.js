import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductDetail.module.scss';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import { getProductById } from '~/services/productService';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faChevronUp,
    faCircleDot,
    faPhone,
    faImage,
} from '@fortawesome/free-solid-svg-icons';
import Button from '~/components/Button/Button';
import { getImageUrl, normalizeImageUrl, DEFAULT_IMAGE } from '~/utils/imageUtils';
import config from '~/config';

const cx = classNames.bind(styles);

const ProductDetail = () => {
    const { id, category } = useParams();
    const navigate = useNavigate();
    const [productDetail, setProductDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
    const [processedImages, setProcessedImages] = useState([]);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const data = await getProductById(id);
                
                // Process images for consistent display
                let images = [];
                
                if (data.images) {
                    // Convert string to array if needed
                    if (typeof data.images === 'string') {
                        if (data.images.trim() !== '') {
                            images = [data.images];
                        }
                    } 
                    // Use existing array
                    else if (Array.isArray(data.images)) {
                        images = [...data.images];
                    }
                }
                
                // Ensure we have at least an empty array
                if (!images || images.length === 0) {
                    images = [];
                }
                
                // Process each image URL
                const processedImgs = images.map(img => {
                    if (!img) return DEFAULT_IMAGE;
                    
                    // If it's already a full URL
                    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
                        return img;
                    }
                    
                    // If it's a path starting with /
                    if (typeof img === 'string' && img.startsWith('/')) {
                        if (img.includes('/images/uploads/') || img.includes('/uploads/')) {
                            return `${config.apiUrl}${img}`;
                        } else {
                            return `${config.apiUrl}${img}`;
                        }
                    }
                    
                    // If it's just a filename
                    return `${config.apiUrl}/images/uploads/${img}`;
                });
                
                // Store the processed images
                setProcessedImages(processedImgs.length > 0 ? processedImgs : [DEFAULT_IMAGE]);
                
                // Update the product data with processed images
                setProductDetail({
                    ...data,
                    images: processedImgs.length > 0 ? processedImgs : [DEFAULT_IMAGE]
                });
                
                console.log('Product detail with processed images:', {
                    ...data,
                    processedImages: processedImgs
                });
            } catch (error) {
                setError(error);
                console.error('Error fetching product detail:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id]);

    const handleThumbnailClick = (index) => {
        setCurrentImageIndex(index);
    };

    const handlePrevClick = () => {
        if (!productDetail || !productDetail.images || productDetail.images.length <= 1) return;
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? productDetail.images.length - 1 : prevIndex - 1));
    };

    const handleNextClick = () => {
        if (!productDetail || !productDetail.images || productDetail.images.length <= 1) return;
        setCurrentImageIndex((prevIndex) => (prevIndex === productDetail.images.length - 1 ? 0 : prevIndex + 1));
    };

    const handleThumbnailPrevClick = () => {
        setThumbnailStartIndex((prevIndex) => Math.max(0, prevIndex - 1));
    };

    const handleThumbnailNextClick = () => {
        if (!productDetail || !productDetail.images) return;
        
        const totalImages = productDetail.images.length;
        const remainingImages = totalImages - (thumbnailStartIndex + 1);
        if (remainingImages > 0) {
            setThumbnailStartIndex((prevIndex) => prevIndex + 1);
        } else {
            setThumbnailStartIndex((prevIndex) => prevIndex + remainingImages);
        }
    };

    const handleImageError = (e) => {
        console.error(`Image failed to load:`, e.target.src);
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = DEFAULT_IMAGE;
    };

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <div className={cx('error-message')}>Error: {errorMessage}</div>;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    // Safely parse features, defaulting to empty array if invalid JSON or not a string
    let features = [];
    if (productDetail.features) {
        try {
            if (typeof productDetail.features === 'string') {
                features = JSON.parse(productDetail.features);
            } else if (Array.isArray(productDetail.features)) {
                features = productDetail.features;
            }
        } catch (e) {
            console.error('Error parsing product features:', e);
            features = [];
        }
    }

    // Ensure features is an array
    if (!Array.isArray(features)) {
        features = [];
    }

    return (
        <article className={cx('wrapper')}>
            <HelmetProvider>
                <title>{productDetail.name} | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
                <meta name="description" content={`Chi tiết về sản phẩm: ${productDetail.name}.`} />
                <meta name="keywords" content={`sản phẩm, ${productDetail.name}, phunongbuondon`} />
            </HelmetProvider>

            <div className={cx('product-section')}>
                {processedImages.length > 0 && (
                    <>
                        <div className={cx('thumbnails')}>
                            {thumbnailStartIndex > 0 && (
                                <button
                                    className={cx('thumbnail-button', 'thumbnail-prev-button')}
                                    onClick={handleThumbnailPrevClick}
                                >
                                    <FontAwesomeIcon icon={faChevronUp} />
                                </button>
                            )}
                            <div
                                className={cx('thumbnail-list')}
                                style={{ transform: `translateY(-${thumbnailStartIndex * 155}px)` }}
                            >
                                {processedImages
                                    .slice(thumbnailStartIndex, thumbnailStartIndex + 4)
                                    .map((image, index) => (
                                        <div key={thumbnailStartIndex + index} className={cx('thumbnail-item')}>
                                            <img
                                                className={cx('thumbnail-image')}
                                                src={image}
                                                alt={`${productDetail.name} thumbnail ${thumbnailStartIndex + index + 1}`}
                                                onClick={() => handleThumbnailClick(thumbnailStartIndex + index)}
                                                onError={handleImageError}
                                            />
                                        </div>
                                    ))}
                            </div>
                            {thumbnailStartIndex + 4 < processedImages.length && (
                                <button
                                    className={cx('thumbnail-button', 'thumbnail-next-button')}
                                    onClick={handleThumbnailNextClick}
                                >
                                    <FontAwesomeIcon icon={faChevronDown} />
                                </button>
                            )}
                        </div>

                        <div className={cx('product-image')}>
                            <button className={cx('prev-button')} onClick={handlePrevClick}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <div
                                className={cx('main-image-wrapper')}
                                style={{ transform: `translateX(-${currentImageIndex * 600}px)` }}
                            >
                                {processedImages.map((image, index) => (
                                    <img
                                        key={index}
                                        className={cx('main-image')}
                                        src={image}
                                        alt={`${productDetail.name} main ${index + 1}`}
                                        onError={handleImageError}
                                    />
                                ))}
                            </div>
                            <button className={cx('next-button')} onClick={handleNextClick}>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </>
                )}
                {processedImages.length === 0 && (
                    <div className={cx('no-images')}>
                        <FontAwesomeIcon icon={faImage} className={cx('no-image-icon')} />
                        <p>No images available</p>
                    </div>
                )}
                
                <div className={cx('product-details')}>
                    <h2 className={cx('product-name')}>{productDetail.name}</h2>
                    
                    {productDetail.summary && (
                        <div className={cx('product-summary')}>
                            <p>{productDetail.summary}</p>
                        </div>
                    )}
                    
                    {features.length > 0 && (
                        <ul className={cx('detail-function')}>
                            {features.map((feature, index) => (
                                <li key={index} className={cx('txt-function')}>
                                    <FontAwesomeIcon className={cx('icon-function')} icon={faCircleDot} /> {feature}
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    {productDetail.phone_number && (
                        <Button className={cx('contact-button')} primary>
                            <FontAwesomeIcon icon={faPhone} className={cx('icon')} />
                            <a href={`tel:${productDetail.phone_number}`}>Liên hệ ngay ({productDetail.phone_number})</a>
                        </Button>
                    )}
                </div>
            </div>

            <div className={cx('info-section')}>
                <h2 className={cx('section-title')}>Chi tiết sản phẩm</h2>
                {productDetail.description && (
                    <div className={cx('description-content')}>
                        {productDetail.description}
                    </div>
                )}
                {productDetail.content && (
                    <div className={cx('info-content')} dangerouslySetInnerHTML={{ __html: productDetail.content }} />
                )}
                {!productDetail.content && !productDetail.description && (
                    <div className={cx('no-content')}>
                        <p>Hiện chưa có thông tin chi tiết cho sản phẩm này.</p>
                    </div>
                )}
            </div>
        </article>
    );
};

export default ProductDetail;
