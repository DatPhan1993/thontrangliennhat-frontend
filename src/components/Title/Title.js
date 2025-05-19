import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './Title.module.scss';
import { Link, useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Title({ text, showSeeAll = false, slug, categoryId, onClick }) {
    const navigate = useNavigate();
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (slug) {
            navigate(slug);
        }
    };

    return (
        <div className={cx('header')}>
            <span className={cx('title')}>{text}</span>
            {showSeeAll && (
                <button className={cx('see-all')} onClick={handleClick}>
                    Xem thêm
                </button>
            )}
            <div className={cx('line')} />
        </div>
    );
}

Title.propTypes = {
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    showSeeAll: PropTypes.bool,
    slug: PropTypes.string,
    categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onClick: PropTypes.func,
};

export default Title;
