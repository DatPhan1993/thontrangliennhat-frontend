import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './NewsLibrary.module.scss';
import Title from '~/components/Title/Title';
import routes from '~/config/routes';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import { parseISO, format } from 'date-fns';
import { vi } from 'date-fns/locale';

const cx = classNames.bind(styles);
// Base URL cho hình ảnh
const API_URL = process.env.REACT_APP_BASE_URL || "https://api.thontrangliennhat.com";

function NewsLibrary() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/news`);
                console.log('News response:', response.data);
                setNews(response.data);
                setLoading(false);
            } catch (err) {
                setError(err);
                console.error('Error fetching news:', err);
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const formatDate = (dateString) => {
        try {
            const date = parseISO(dateString);
            return format(date, 'HH:mm | dd/MM/yyyy', { locale: vi });
        } catch (err) {
            console.error('Error formatting date:', err);
            return dateString;
        }
    };

    // Hàm xử lý URL hình ảnh
    const getImageUrl = (imagePath) => {
        if (!imagePath) return ''; // Trả về chuỗi rỗng nếu không có đường dẫn

        // Nếu đã là URL đầy đủ nhưng là localhost, thay bằng API URL
        if (imagePath.includes('localhost')) {
            // Trích xuất phần đường dẫn sau localhost:port
            const pathParts = imagePath.split('/');
            const extractedPath = pathParts.slice(3).join('/');
            return `${API_URL}/${extractedPath}`;
        }

        // Nếu đã là URL đầy đủ (https) hoặc base64, trả về nguyên bản
        if (imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            return imagePath;
        }

        // Nếu bắt đầu bằng http://, chuyển thành https://
        if (imagePath.startsWith('http://')) {
            return imagePath.replace('http://', 'https://');
        }

        // Loại bỏ dấu / đầu tiên nếu có
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        
        // Thêm URL API
        return `${API_URL}/${cleanPath}`;
    };

    // Xử lý click vào tin tức
    const handleNewsClick = (event, newsItem) => {
        // Nếu có external URL, mở tab mới và ngăn chặn hành vi mặc định
        if (newsItem.externalUrl) {
            event.preventDefault();
            window.open(newsItem.externalUrl, '_blank');
        }
    };

    // Trả về link dựa trên tin tức
    const getNewsLink = (newsItem) => {
        // Nếu có external URL, giữ nguyên link trong app
        // Hàm handleNewsClick sẽ xử lý việc mở link bên ngoài
        return `${routes.news}/${newsItem.slug}`;
    };

    if (error) {
        return <div>Error loading news: {error.message}</div>;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Title text="TIN TỨC" showSeeAll={true} slug={`${routes.news}`} />
                <div className={cx('news-container')}>
                    {news.map((newsItem) => (
                        <div key={newsItem.id} className={cx('news-item')}>
                            <Link 
                                to={getNewsLink(newsItem)} 
                                className={cx('news-link')}
                                onClick={(e) => handleNewsClick(e, newsItem)}
                            >
                                <div className={cx('news-image-container')}>
                                    <img 
                                        src={getImageUrl(newsItem.images)} 
                                        alt={newsItem.title} 
                                        className={cx('news-image')} 
                                    />
                                </div>
                                <div className={cx('news-content')}>
                                    <h3 className={cx('news-title')}>{newsItem.title}</h3>
                                    <p className={cx('news-summary')}>{newsItem.summary}</p>
                                    <div className={cx('news-meta')}>
                                        <span className={cx('news-date')}>{formatDate(newsItem.createdAt)}</span>
                                        <span className={cx('news-views')}>{newsItem.views} lượt xem</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NewsLibrary; 