import classNames from 'classnames/bind';
import styles from './CardService.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import { getImageUrl } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

function Card({
    title,
    summary = 'Default Summary',
    image = '/images/placeholder-image.jpg',
    createdAt = new Date().toISOString(),
    isNew = false,
}) {
    // Use a proper title from database or props
    const displayTitle = title || 'Trải nghiệm';
    
    // Process the image URL properly
    const processedImage = getImageUrl(image);
    
    return (
        <div className={cx('card')}>
            {isNew && <span className={cx('new-label')}>NEW</span>}
            <div className={cx('card_image-wrapper')}>
                <img 
                    src={processedImage} 
                    alt={displayTitle} 
                    className={cx('card_image')} 
                    onError={(e) => {
                        console.log('Image load error, using fallback:', e.target.src);
                        e.target.src = '/images/placeholder-image.jpg';
                    }}
                />
            </div>
            <div className={cx('card_content')}>
                <h3 className={cx('card_title')}>{displayTitle}</h3>
                <p className={cx('card_description')}>{summary}</p>
            </div>
        </div>
    );
}

Card.propTypes = {
    title: PropTypes.string,
    summary: PropTypes.string,
    image: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    isNew: PropTypes.bool
};

export default Card;
