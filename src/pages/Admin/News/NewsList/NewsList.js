import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faAngleRight, faAngleLeft, faSync } from '@fortawesome/free-solid-svg-icons';
import { deleteNews, getNews } from '~/services/newsService';
import styles from './NewsList.module.scss';
import Title from '~/components/Title/Title';
import routes from '~/config/routes';
import PushNotification from '~/components/PushNotification/PushNotification';
import { Spin } from 'antd';
import { getImageUrl } from '~/utils/imageUtils';

const NewsList = () => {
    const [news, setNews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const data = await getNews();
            if (data) {
                setNews(Array.isArray(data) ? data : []);
                setNotification({ message: 'Dữ liệu tin tức đã được cập nhật', type: 'success' });
            } else {
                setNews([]);
                setNotification({ message: 'Không có dữ liệu tin tức', type: 'warning' });
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            setNotification({ message: 'Lỗi khi tải tin tức: ' + error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
            try {
                await deleteNews(id);
                setNews(news.filter((article) => article.id !== id));
                setNotification({ message: 'Tin đã được xóa thành công!', type: 'success' });
            } catch (error) {
                console.error('Có lỗi khi xóa tin:', error);
                setNotification({ message: 'Đã xảy ra lỗi khi xóa tin tức!', type: 'error' });
            }
        }
    };

    const handleRefresh = () => {
        fetchNews();
    };

    const filteredNews = news.filter((article) => {
        if (!article || !article.title) return false;
        return article.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const indexOfLastNews = currentPage * itemsPerPage;
    const indexOfFirstNews = indexOfLastNews - itemsPerPage;
    const currentNews = filteredNews.slice(indexOfFirstNews, indexOfLastNews);

    // Function to get the appropriate image source for an article
    const getImageSource = (article) => {
        if (!article) return '/placeholder-image.svg';
        
        try {
            // Try to use the images array first
            if (article.images) {
                // If images is an array with content
                if (Array.isArray(article.images) && article.images.length > 0) {
                    return getImageUrl(article.images[0]);
                }
                // If images is a string
                else if (typeof article.images === 'string' && article.images.trim() !== '') {
                    return getImageUrl(article.images);
                }
            }
            
            // Try to use image property as fallback
            if (article.image) {
                return getImageUrl(article.image);
            }
        } catch (error) {
            console.error('Error getting image source:', error);
        }
        
        // Default placeholder if all else fails
        return '/placeholder-image.svg';
    };

    return (
        <div className={styles.newsContainer}>
            <Title className={styles.pageTitle} text="Danh sách Tin tức" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <div className={styles.actionsContainer}>
                <div className={styles.leftActions}>
                <input
                    type="text"
                    placeholder="Tìm kiếm Tin tức..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                    <button 
                        onClick={handleRefresh} 
                        className={styles.refreshButton}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faSync} spin={loading} /> Làm mới
                    </button>
                </div>
                <Link to={routes.addNews} className={styles.addButton}>
                    <FontAwesomeIcon icon={faPlus} /> Thêm mới Tin tức
                </Link>
            </div>

            <div className={styles.newsList}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tiêu đề</th>
                            <th>Tóm tắt</th>
                            <th>Nổi bật</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentNews.length > 0 ? (
                            currentNews.map((article) => (
                                <tr key={article.id}>
                                    <td>
                                        <img 
                                            src={getImageSource(article)} 
                                            alt={article.title || 'Tin tức'} 
                                            className={styles.newsImage}
                                            onError={(e) => {
                                                console.error(`Image failed to load for article ${article.id}:`, article.images);
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder-image.svg';
                                            }}
                                        />
                                    </td>
                                    <td>{article.title}</td>
                                    <td>{article.summary}</td>
                                    <td>{article.isFeatured ? 'Có' : 'Không'}</td>
                                    <td>
                                        <Link to={`/admin/update-news/${article.id}`} className={styles.editButton}>
                                            <FontAwesomeIcon icon={faEdit} /> Sửa
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(article.id)}
                                            className={styles.deleteButton}
                                        >
                                            <FontAwesomeIcon icon={faTrash} /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                    <td colSpan="6">Không có dữ liệu tin tức. Hãy thêm tin tức mới hoặc làm mới lại trang.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                )}
            </div>

            {filteredNews.length > 0 && (
                <>
            <div className={styles.itemsPerPageContainer}>
                <label htmlFor="itemsPerPage">Số mục mỗi trang:</label>
                <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className={styles.itemsPerPageSelect}
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>

            <div className={styles.pagination}>
                <span>
                    Hiện {indexOfFirstNews + 1} đến {Math.min(indexOfLastNews, filteredNews.length)} của{' '}
                    {filteredNews.length}
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
                </>
            )}
        </div>
    );
};

export default NewsList;
