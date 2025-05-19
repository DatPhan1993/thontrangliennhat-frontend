import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleLeft, faAngleRight, faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import { deleteImage, getImages } from '~/services/libraryService';
import styles from './ImageList.module.scss';
import Title from '~/components/Title/Title';
import { Link } from 'react-router-dom';
import routes from '~/config/routes';
import PushNotification from '~/components/PushNotification/PushNotification';

const ImageList = () => {
    const [images, setImages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [refreshCount, setRefreshCount] = useState(0);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('refresh') === 'true') {
            console.log('Force refresh requested via URL parameter');
            
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            
            setNotification({ message: 'Đang cập nhật danh sách ảnh...', type: 'info' });
            
            if (urlParams.get('hard') === 'true') {
                window.location.reload();
                return;
            }
            
            setLoading(true);
            
            setTimeout(() => {
                fetchImages(true);
            }, 500);
        }
    }, [window.location.search]);

    useEffect(() => {
        sessionStorage.removeItem('allImages');
        localStorage.removeItem('allImages');
        
        fetchImages(true);
        
        const refreshInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastRefresh = now - lastRefreshTime;
            
            if (timeSinceLastRefresh > 10000) {
                console.log('Periodic refresh of images');
                setLastRefreshTime(now);
                setRefreshCount(prev => prev + 1);
                fetchImages(true);
            }
        }, 15000);
        
        return () => {
            clearInterval(refreshInterval);
        };
    }, []);

    useEffect(() => {
        if (refreshCount > 0) {
            console.log('Refresh triggered by counter change:', refreshCount);
            fetchImages(true);
        }
    }, [refreshCount]);

    useEffect(() => {
        if (images.length > 0) {
            // No need to fetch again, just update pagination
        }
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        const pageReloadTimeout = setTimeout(() => {
            console.log('Auto page reload after 1 minute');
            window.location.reload();
        }, 60000);
        
        return () => {
            clearTimeout(pageReloadTimeout);
        };
    }, []);

    useEffect(() => {
        const uploadSuccess = localStorage.getItem('uploadSuccess');
        const uploadCount = localStorage.getItem('uploadCount');
        const uploadTime = localStorage.getItem('uploadTime');
        
        if (uploadSuccess === 'true' && uploadCount && uploadTime) {
            const now = Date.now();
            const timeSinceUpload = now - parseInt(uploadTime, 10);
            
            if (timeSinceUpload < 300000) {
                console.log(`Recent upload detected: ${uploadCount} images, ${Math.round(timeSinceUpload/1000)} seconds ago`);
                
                setNotification({
                    message: `Đã tải lên ${uploadCount} ảnh mới. Đang tải danh sách mới nhất...`,
                    type: 'success'
                });
                
                localStorage.removeItem('uploadSuccess');
                localStorage.removeItem('uploadCount');
                localStorage.removeItem('uploadTime');
                
                setTimeout(() => {
                    window.location.reload();
                }, 200);
            } else {
                localStorage.removeItem('uploadSuccess');
                localStorage.removeItem('uploadCount');
                localStorage.removeItem('uploadTime');
            }
        }
    }, []);

    const fetchImages = async (forceFresh = false) => {
        setLoading(true);
        try {
            if (forceFresh) {
                sessionStorage.removeItem('allImages');
                localStorage.removeItem('allImages');
                console.log('Forced fresh fetch of images');
            }
            
            console.log('Fetching images...');
            const data = await getImages();
            console.log('Images fetched:', data);
            
            if (data) {
                const currentIds = images.map(img => img.id).sort().join(',');
                const newIds = data.map(img => img.id).sort().join(',');
                
                if (currentIds !== newIds || images.length !== data.length) {
                    console.log('New image data detected, updating state');
                setImages(data);
                    
                    setLastRefreshTime(Date.now());
                } else {
                    console.log('Image data unchanged');
                }
                
                if (data.length === 0) {
                    setNotification({ message: 'Không tìm thấy hình ảnh nào trong thư viện.', type: 'info' });
                } else {
                    setNotification({ message: '', type: '' });
                }
            } else {
                setNotification({ message: 'Có lỗi khi tải thư viện ảnh!', type: 'error' });
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            setNotification({ message: 'Có lỗi khi tải thư viện ảnh: ' + error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này?')) {
            try {
                await deleteImage(id);
                setImages(images.filter((image) => image.id !== id));
                setNotification({ message: 'Hình ảnh đã được xóa thành công!', type: 'success' });
                
                setTimeout(() => {
                    fetchImages(true);
                }, 500);
            } catch (error) {
                console.error('Error deleting image:', error);
                setNotification({ message: 'Đã xảy ra lỗi khi xóa hình ảnh!', type: 'error' });
            }
        }
    };

    const refreshImages = () => {
        sessionStorage.removeItem('allImages');
        localStorage.removeItem('allImages');
        
        setNotification({ message: 'Đang làm mới dữ liệu...', type: 'info' });
        
        window.location.reload();
    };

    const filteredImages = images.filter((image) => 
        image && image.url && image.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
    const indexOfLastImage = currentPage * itemsPerPage;
    const indexOfFirstImage = indexOfLastImage - itemsPerPage;
    const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

    return (
        <div className={styles.imageContainer}>
            <Title className={styles.pageTitle} text="Danh sách hình ảnh" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <div className={styles.actionsContainer}>
                <input
                    type="text"
                    placeholder="Tìm kiếm hình ảnh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                <div className={styles.buttonGroup}>
                    <button onClick={refreshImages} className={styles.refreshButton} disabled={loading}>
                        <FontAwesomeIcon icon={faSync} spin={loading} /> Làm mới
                    </button>
                    <Link to={routes.addImage} className={styles.addButton}>
                        <FontAwesomeIcon icon={faPlus} /> Thêm mới hình ảnh
                    </Link>
                </div>
            </div>

            <div className={styles.imageList}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên</th>
                            <th>URL</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td>
                            </tr>
                        )}
                        {!loading && currentImages.length > 0 ? (
                            currentImages.map((image) => (
                                <tr key={image.id}>
                                    <td className={styles.thumbnailCell}>
                                        <a href={image.url} target="_blank" rel="noopener noreferrer">
                                            <img 
                                                src={image.url} 
                                                alt={image.name || 'Hình ảnh'} 
                                                className={styles.thumbnail}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder-image.svg';
                                                    console.log('Image failed to load:', image.url);
                                                }}
                                            />
                                        </a>
                                    </td>
                                    <td>{image.name || 'Không có tên'}</td>
                                    <td>
                                        <a href={image.url} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                                            {image.url}
                                        </a>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(image.id)} className={styles.deleteButton}>
                                            <FontAwesomeIcon icon={faTrash} /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            !loading && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>
                                        Không có dữ liệu
                                        {sessionStorage.getItem('allImages') && (
                                            <div>
                                                <small style={{ color: 'gray' }}>
                                                    (Có dữ liệu trong cache: {JSON.parse(sessionStorage.getItem('allImages')).length} ảnh)
                                                </small>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
            <div className={styles.itemsPerPage}>
                <label htmlFor="itemsPerPage">Hiển thị: </label>
                <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>
            </div>

            <div className={styles.pagination}>
                <span>
                    Hiển thị {filteredImages.length > 0 ? indexOfFirstImage + 1 : 0} đến {Math.min(indexOfLastImage, filteredImages.length)} của{' '}
                    {filteredImages.length}
                </span>
                <div className={styles.paginationControls}>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageList;
