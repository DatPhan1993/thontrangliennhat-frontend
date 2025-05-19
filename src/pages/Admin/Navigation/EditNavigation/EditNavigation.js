import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import {
    getMainNavigationById,
    getSubNavigationById,
    getChildNavigationById,
    updateMainNavigationLink,
    updateSubNavigationLink,
    updateChildNavigationLink,
    getNavigationLinks,
} from '~/services/navigationService';
import styles from './EditNavigation.module.scss';
import Title from '~/components/Title/Title';
import routes from '~/config/routes';
import PushNotification from '~/components/PushNotification/PushNotification';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';

const EditNavigation = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [, setNavigations] = useState([]);
    const navigate = useNavigate();
    const [navigation, setNavigation] = useState(null);
    const [title, setTitle] = useState('');
    const [position, setPosition] = useState(0);
    const [loading, setLoading] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const type = searchParams.get('type');

    const fetchNavigation = async () => {
        setLoading(true);
        try {
            let data;
            if (type === 'main') {
                data = await getMainNavigationById(id);
            } else if (type === 'sub') {
                data = await getSubNavigationById(id);
            } else if (type === 'child') {
                data = await getChildNavigationById(id);
            } else {
                throw new Error('Invalid navigation type');
            }

            setNavigation(data);
            setTitle(data.title);
            setPosition(data.position);
        } catch (error) {
            setIsError(true);
            setNotificationMessage('Có lỗi xảy ra khi tải dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNavigation();
    }, [id, type]);

    useEffect(() => {
        const fetchNavigations = async () => {
            setLoading(true);
            try {
                const data = await getNavigationLinks();
                setNavigations(data);
            } catch (error) {
                setIsError(true);
                setNotificationMessage('Có lỗi khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };

        fetchNavigations();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gọi hàm cập nhật tương ứng dựa vào type
            if (type === 'main') {
                await updateMainNavigationLink(id, { title, position });
            } else if (type === 'sub') {
                await updateSubNavigationLink(id, { title, position });
            } else if (type === 'child') {
                await updateChildNavigationLink(id, { title, position });
            } else {
                throw new Error('Invalid navigation type');
            }

            setIsError(false);
            setNotificationMessage('Navigation đã được cập nhật!');

            setTimeout(() => {
                navigate(routes.navigationList);
            }, 1000);
        } catch (error) {
            console.error('Error updating navigation:', error);
            setIsError(true);
            setNotificationMessage('Có lỗi xảy ra khi cập nhật!');
        } finally {
            setLoading(false);
        }
    };

    if (!navigation) return <LoadingScreen />;

    return (
        <div className={styles.navigationContainer}>
            <Title className={styles.pageTitle} text="Chỉnh sửa Navigation" />
            <form onSubmit={handleSave}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">Tiêu đề</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className={styles.inputField}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="position">Vị trí</label>
                    <input
                        type="number"
                        id="position"
                        value={position}
                        onChange={(e) => setPosition(parseInt(e.target.value, 10))}
                        required
                        className={styles.inputField}
                    />
                </div>
                <div className={styles.actionsContainer}>
                    <button type="submit" className={styles.saveButton}>
                        <FontAwesomeIcon icon={faSave} /> Lưu
                    </button>
                    <Link to={routes.navigationList} className={styles.backButton}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
                    </Link>
                </div>
            </form>
            {loading && <LoadingScreen />}
            <PushNotification message={notificationMessage} type={isError ? 'error' : 'success'} />
        </div>
    );
};

export default EditNavigation;
