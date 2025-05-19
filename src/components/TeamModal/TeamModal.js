import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './TeamModal.module.scss';
import classNames from 'classnames/bind';
import { getImageUrl } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

const TeamModal = ({ open, onClose, team }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('modal')} ref={modalRef}>
                <button className={cx('modal-close')} onClick={onClose}>
                    &times;
                </button>
                {team && (
                    <div className={cx('team-detail')}>
                        <div className={cx('team-image-container')}>
                            <img src={getImageUrl(team.image)} alt={team.name} className={cx('team-image')} />
                        </div>
                        <div className={cx('team-info')}>
                            <h2 className={cx('team-name')}>{team.name}</h2>
                            <p className={cx('team-position')}>{team.position}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

TeamModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    team: PropTypes.object,
};

export default TeamModal;
