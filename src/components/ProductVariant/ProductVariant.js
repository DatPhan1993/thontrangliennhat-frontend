import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './ProductVariant.module.scss';
import Button from '~/components/Button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { getImageUrl } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

function ProductVariant({ image, name, price, description }) {
    return (
        <div className={cx('variant-item')}>
            <img className={cx('variant-item-image')} src={getImageUrl(image)} alt={name} />
            <div className={cx('variant-item-details')}>
                <h3 className={cx('variant-item-name')}>{name}</h3>
                <p className={cx('variant-item-description')}>{description}</p>
                <div className={cx('variant-item-price')}>
                    <Button rounded outline rightIcon={<FontAwesomeIcon icon={faChevronRight}/>} className={cx('variant-item-button')}>
                        {price ? `${price.toLocaleString('vi-VN')} đ` : 'Liên hệ để báo giá'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

ProductVariant.propTypes = {
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number,
    description: PropTypes.string,
};

export default ProductVariant; 