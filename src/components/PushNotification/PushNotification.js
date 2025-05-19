import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './PushNotification.module.scss';

const cx = classNames.bind(styles);

const PushNotification = ({ message, type }) => {
    const [isVisible, setIsVisible] = useState(false);
    const progressRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const startTime = performance.now();
            
            // Set longer display time for warnings (5s) vs regular notifications (3s)
            const displayTime = type === 'warning' ? 5000 : 3000;

            const animate = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = 1 - elapsedTime / displayTime;

                if (progressRef.current) {
                    progressRef.current.style.width = `${progress * 100}%`;
                }

                if (progress > 0) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setIsVisible(false);
                }
            };

            animationRef.current = requestAnimationFrame(animate);

            const timer = setTimeout(() => {
                setIsVisible(false);
                cancelAnimationFrame(animationRef.current);
            }, displayTime);

            return () => {
                clearTimeout(timer);
                cancelAnimationFrame(animationRef.current);
            };
        }
    }, [message, type]);

    const handleClose = () => {
        setIsVisible(false);
        cancelAnimationFrame(animationRef.current);
    };

    return (
        <div
            className={cx(
                'pushNotification',
                { visible: isVisible },
                { 
                    success: type === 'success', 
                    error: type === 'error',
                    warning: type === 'warning'
                },
            )}
        >
            <span className={styles.message}>{message}</span>
            <div className={styles.progress}>
                <div className={styles['progress-bar']} ref={progressRef}></div>
            </div>
            <button className={styles.closeButton} onClick={handleClose}>
                &times;
            </button>
        </div>
    );
};

export default PushNotification;
