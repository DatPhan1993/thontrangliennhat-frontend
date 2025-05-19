import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Header.module.scss';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import routes from '~/config/routes';

const Dropdown = ({ isVisible, notifications, isUserDropdown }) => {
    return (
        <div className={`${styles.dropdown} ${isVisible ? styles.visible : ''}`}>
            {isUserDropdown ? (
                notifications.map((item, index) => (
                    <div key={item.id || index} className={styles.dropdownItem} onClick={item.action}>
                        <FontAwesomeIcon icon={item.icon} className={styles.icon} />
                        {item.text}
                    </div>
                ))
            ) : notifications.length > 0 ? (
                <>
                    {notifications.map((notification) => (
                        <Link to={routes.messagesList} key={notification.id}>
                            <div className={styles.dropdownItem}>
                                <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
                                <div className={styles.notificationContent}>
                                    <div className={styles.notificationTitle}>Chủ đề: {notification.title}</div>
                                    <div className={styles.notificationMessage}>Người gửi: {notification.name}</div>
                                    <p className={styles.notificationMessage}>Nội dung: {notification.content}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                    <div className={styles.viewAll}>
                        <Link to={routes.messagesList}>Xem tất cả</Link>
                    </div>
                </>
            ) : (
                <div className={styles.noNotifications}>No new messages</div>
            )}
        </div>
    );
};

export default Dropdown;
