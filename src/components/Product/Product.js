import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './Product.module.scss';
import { Link } from 'react-router-dom';
import Button from '~/components/Button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faImage } from '@fortawesome/free-solid-svg-icons';
import { DEFAULT_IMAGE } from '~/utils/imageUtils';
import config from '~/config';

const cx = classNames.bind(styles);

function Product({ image, name, link }) {
    const [imageError, setImageError] = useState(false);
    const imgRef = useRef(null);
    
    // Try to load image with multiple fallback sources
    useEffect(() => {
        let attemptedUrls = [];
        let isComponentMounted = true;
        const apiBaseUrl = config.apiUrl || 'http://localhost:3001';

        // Reset error state on new image prop
        setImageError(false);
        
        // Function to attempt loading an image URL
        const tryLoadImage = (url) => {
            // Skip if already attempted this URL
            if (attemptedUrls.includes(url)) return false;
            
            console.log(`[Product] Trying image URL for "${name}":`, url);
            attemptedUrls.push(url);
            
            if (imgRef.current) {
                imgRef.current.src = url;
                return true;
            }
            return false;
        };
        
        // Function to try all possible paths
        const tryAllPaths = () => {
            if (!isComponentMounted) return;
            
            // 1. Original image prop if it's a full URL
            if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
                if (tryLoadImage(image)) return;
            }
            
            // 2. Extract filename if possible from the original path
            if (typeof image === 'string' && image.includes('/')) {
                const filename = image.split('/').pop();
                if (filename) {
                    // Try standard paths with this filename
                    tryLoadImage(`${apiBaseUrl}/images/uploads/${filename}`);
                    return;
                }
            }
            
            // 3. Try original image as a relative path
            if (typeof image === 'string' && image.trim() !== '') {
                // Try with API base URL if it's a relative path
                if (image.startsWith('/')) {
                    tryLoadImage(`${apiBaseUrl}${image}`);
                } else {
                    tryLoadImage(`${apiBaseUrl}/images/uploads/${image}`);
                }
                return;
            }
            
            // 4. If image is an array, try the first item
            if (Array.isArray(image) && image.length > 0) {
                const firstImage = image[0];
                if (typeof firstImage === 'string' && firstImage.trim() !== '') {
                    if (firstImage.startsWith('http')) {
                        tryLoadImage(firstImage);
                    } else if (firstImage.startsWith('/')) {
                        tryLoadImage(`${apiBaseUrl}${firstImage}`);
                    } else {
                        tryLoadImage(`${apiBaseUrl}/images/uploads/${firstImage}`);
                    }
                    return;
                }
            }
            
            // 5. Fallback to default image if nothing else works
            setImageError(true);
        };
        
        // Start trying all paths
        tryAllPaths();
        
        // Cleanup
        return () => {
            isComponentMounted = false;
        };
    }, [image, name]);
    
    // Error handler for image load failures
    const handleImageError = (e) => {
        console.error(`[Product] Image failed to load for "${name}"`);
        e.target.onerror = null; // Prevent infinite loop
        setImageError(true);
    };

    return (
        <Link to={link}>
            <div className={cx('product-item')}>
                {imageError ? (
                    <div className={cx('product-image-error')}>
                        <FontAwesomeIcon icon={faImage} className={cx('error-icon')} />
                        <span>Ảnh không hiển thị</span>
                    </div>
                ) : (
                    <img 
                        ref={imgRef}
                        className={cx('product-item-image')} 
                        src={DEFAULT_IMAGE} // Initial source, will be replaced in useEffect
                        alt={name} 
                        onError={handleImageError}
                    />
                )}
                <div className={cx('product-item-details')}>
                    <h2 className={cx('product-item-name')}>{name}</h2>

                    <Button rounded outline rightIcon={<FontAwesomeIcon icon={faChevronRight}/>} className={cx('product-item-button')}>
                        Xem chi tiết
                    </Button>
                </div>
            </div>
        </Link>
    );
}

Product.propTypes = {
    image: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
    ]),
    name: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
};

export default Product;
