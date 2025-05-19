import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import DateTime from '~/components/DateTime/DateTime';
import styles from './SuggestCard.module.scss';
import { getImageUrl, DEFAULT_IMAGE } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

function SuggestCard({
    title = 'Default Title',
    image = 'default.jpg',
    summary = 'Mô tả gợi ý',
    createdAt = Date.now(),
}) {
    const [imgError, setImgError] = useState(false);
    const imageUrl = imgError ? DEFAULT_IMAGE : getImageUrl(image);
    
    const handleImageError = () => {
        console.error('SuggestCard image failed to load:', image);
        setImgError(true);
    };
    
    return (
        <div className={cx('suggest-card')}>
            <div className={cx('image-wrapper')}>
                <img 
                    src={imageUrl} 
                    alt={title} 
                    className={cx('image')} 
                    onError={handleImageError}
                />
            </div>
            <div className={cx('content')}>
                <div className={cx('title-link')}>
                    <h3 className={cx('title')}>{title}</h3>
                </div>
                <p className={cx('card-description')}>{summary}</p>
                <DateTime timestamp={createdAt} showDate={true} showTime={true} showViews={false} />
            </div>
        </div>
    );
}

SuggestCard.propTypes = {
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
};

export default SuggestCard;
