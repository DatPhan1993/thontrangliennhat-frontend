import classNames from 'classnames/bind';
import styles from './CardContent.module.scss';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DateTime from '~/components/DateTime/DateTime';
import { getImageUrl, DEFAULT_IMAGE } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

function Card({
    title = 'Default Title',
    summary = 'Default Summary',
    image = 'https://res.cloudinary.com/ddmzboxzu/image/upload/v1724202469/cer_3_ldetgd.png',
    createdAt = new Date().toISOString(),
    views = 0,
    isNew = false,
}) {
    const [imgError, setImgError] = useState(false);
    const imageUrl = imgError ? DEFAULT_IMAGE : getImageUrl(image);
    
    const handleImageError = () => {
        console.error('Image failed to load:', image);
        setImgError(true);
    };

    return (
        <div className={cx('card')}>
            {isNew && <span className={cx('new-label')}>NEW</span>}
            <div className={cx('card_image-wrapper')}>
                <img 
                    src={imageUrl} 
                    alt={title} 
                    className={cx('card_image')} 
                    onError={handleImageError}
                />
            </div>
            <div className={cx('card_content')}>
                <h3 className={cx('card_title')}>{title}</h3>
                <p className={cx('card_description')}>{summary}</p>
                <DateTime timestamp={createdAt} views={views} showDate={true} showTime={true} showViews={true} />
            </div>
        </div>
    );
}

Card.propTypes = {
    title: PropTypes.string,
    summary: PropTypes.string,
    image: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    views: PropTypes.number,
    isNew: PropTypes.bool
};

export default Card;
