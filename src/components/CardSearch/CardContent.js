import classNames from 'classnames/bind';
import styles from './CardContent.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import DateTime from '~/components/DateTime/DateTime';

const cx = classNames.bind(styles);

function Card({
    title = 'Default Title',
    summary = 'Default Summary',
    image = 'https://res.cloudinary.com/ddmzboxzu/image/upload/v1724202469/cer_3_ldetgd.png',
    createdAt = new Date().toISOString(),
    isNew = false,
}) {
    return (
        <div className={cx('card')}>
            {isNew && <span className={cx('new-label')}>NEW</span>}
            <div className={cx('card_image-wrapper')}>
                <img src={image} alt={title} className={cx('card_image')} />
            </div>
            <div className={cx('card_content')}>
                <h3 className={cx('card_title')}>{title}</h3>
                <p className={cx('card_description')}>{summary}</p>
                <DateTime timestamp={createdAt} showDate={true} showTime={true} showViews={false} />
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
