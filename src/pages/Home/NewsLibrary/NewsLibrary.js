import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NewsLibrary.module.scss';
import Title from '~/components/Title/Title';
import routes from '~/config/routes';
import { format } from 'date-fns';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import Library from './Library/Library';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function NewsLibrary() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("newest");

    // Function to correctly handle image paths
    const getCorrectImagePath = (imagePath) => {
        if (!imagePath) return "/images/default-news.jpg";
        
        // Handle array of images
        if (Array.isArray(imagePath)) {
            if (imagePath.length > 0) {
                return getCorrectImagePath(imagePath[0]); // Lấy ảnh đầu tiên nếu là mảng
            } else {
                return "/images/default-news.jpg";
            }
        }
        
        // Handle URLs that already have http:// or https://
        if (typeof imagePath === 'string') {
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                return imagePath;
            }
            
            // Handle relative paths from /images/uploads for admin uploads
            if (imagePath.includes('/uploads/')) {
                return `https://api.thontrangliennhat.com${imagePath}`; 
            }
            
            // Handle relative paths
            if (imagePath.startsWith('/')) {
                return imagePath;
            }
        }
        
        // Default fallback
        return imagePath;
    };

    useEffect(() => {
        const fetchNewsData = async () => {
            setLoading(true);
            try {
                // Sử dụng API thay vì đọc trực tiếp database.json
                const response = await fetch('https://api.thontrangliennhat.com/api/news');
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch news: ${response.status}`);
                }
                
                const result = await response.json();
                if (result.data && result.data.length > 0) {
                    console.log(`Found ${result.data.length} news items from API`);
                    processNewsData(result.data);
                } else {
                    setError("No news found in API response");
                    }
            } catch (err) {
                console.error("Error loading news from API:", err);
                // Fallback to direct database.json fetching if API fails
                try {
                const response = await fetch('/phunongbuondon-api/database.json');
                    
                if (!response.ok) {
                        throw new Error(`Failed to fetch database.json: ${response.status}`);
                    }
                    
                    const database = await response.json();
                    if (database.news && database.news.length > 0) {
                        console.log(`Fallback: Found ${database.news.length} news items in database`);
                        processNewsData(database.news);
                    } else {
                        setError("No news found in database fallback");
                    }
                } catch (fallbackErr) {
                    console.error("Fallback also failed:", fallbackErr);
                    setError("Failed to load news: " + err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        const processNewsData = (newsData) => {
            console.log("Processing news data:", newsData);
            let processedNews = newsData.map(item => {
                // Chuẩn hóa trường images
                let processedImages = item.images;
                
                // Đảm bảo images luôn là mảng hoặc chuỗi đúng định dạng
                if (!processedImages && item.image) {
                    // Nếu không có images nhưng có image
                    processedImages = item.image;
                } else if (!processedImages) {
                    // Nếu không có cả hai, dùng hình mặc định
                    processedImages = "/images/default-news.jpg";
                }
                
                // Chuẩn hóa images nếu là chuỗi
                if (typeof processedImages === 'string' && 
                    (processedImages.startsWith('/images/uploads/') || 
                     processedImages.includes('/uploads/'))) {
                    // Đây là đường dẫn upload từ admin
                    console.log("Found upload image:", processedImages);
                }
                
                return {
                    ...item,
                    images: processedImages,
                    views: item.views || 0,
                    createdAt: item.createdAt || new Date().toISOString()
                };
            });

            // Sort based on active tab
            if (activeTab === "newest") {
                processedNews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (activeTab === "featured") {
                processedNews.sort((a, b) => b.views - a.views);
            } else if (activeTab === "random") {
                processedNews.sort(() => Math.random() - 0.5);
            }
            
            console.log(`Setting ${processedNews.length} news items for display`);
            setNews(processedNews);
        };

        fetchNewsData();
    }, [activeTab]);

    // Function to format date
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy");
        } catch (error) {
            return "Invalid date";
        }
    };

    // Function to get news link
    const getNewsLink = (newsItem) => {
        return `${routes.news}/tin-tuc-id/${newsItem.id}`;
    };

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    if (error) {
        return <div className={cx('error-message')}>{error}</div>;
    }

    // Calculate slidesPerView based on the default value from the breakpoints
    const slidesPerView = Math.min(news.length, 3);
    // Check if we have enough items for loop mode (at least double the slidesPerView)
    const useLoopMode = news.length >= (slidesPerView * 2);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Title text="TIN TỨC" showSeeAll={true} slug={`${routes.news}`} />
                
                {news.length === 0 ? (
                    <div className={cx('no-news')}>Không có tin tức nào được tìm thấy</div>
                ) : (
                    <div className={cx('news-section')}>
                <div className={cx('news-tabs')}>
                    <button
                        className={classNames(cx('tab'), {
                            [cx('active')]: activeTab === "newest",
                        })}
                        onClick={() => setActiveTab("newest")}
                    >
                        MỚI NHẤT
                    </button>
                    <button
                        className={classNames(cx('tab'), {
                            [cx('active')]: activeTab === "featured",
                        })}
                        onClick={() => setActiveTab("featured")}
                    >
                        NỔI BẬT
                    </button>
                    <button
                        className={classNames(cx('tab'), {
                            [cx('active')]: activeTab === "random",
                        })}
                        onClick={() => setActiveTab("random")}
                    >
                        NGẪU NHIÊN
                    </button>
                </div>
                        
                        <div className={cx('news-slider-container')}>
                            <Swiper
                                spaceBetween={20}
                                slidesPerView={3}
                                breakpoints={{
                                    1280: { slidesPerView: 3 },
                                    1024: { slidesPerView: 2 },
                                    768: { slidesPerView: 2 },
                                    0: { slidesPerView: 1 },
                                }}
                                loop={useLoopMode}
                                modules={[Autoplay, Navigation, Pagination]}
                                autoplay={{
                                    delay: 3000,
                                    disableOnInteraction: false,
                                }}
                                navigation={{
                                    nextEl: `.${cx('swiper-button-next')}`,
                                    prevEl: `.${cx('swiper-button-prev')}`,
                                }}
                                className={cx('swiper')}
                            >
                                {news.map((newsItem) => (
                                    <SwiperSlide key={newsItem.id} className={cx('slide')}>
                                        <div className={cx('news-item')}>
                                            <Link to={getNewsLink(newsItem)} className={cx('news-link')}>
                                                <div className={cx('news-image-container')}>
                                                    <img 
                                                        src={getCorrectImagePath(newsItem.images)} 
                                                        alt={newsItem.title} 
                                                        className={cx('news-image')}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "/images/default-news.jpg";
                                                        }}
                                                    />
                                                </div>
                                                <div className={cx('news-content')}>
                                                    <h3 className={cx('news-title')}>{newsItem.title}</h3>
                                                    <p className={cx('news-summary')}>{newsItem.summary}</p>
                                                    <div className={cx('news-meta')}>
                                                        <span className={cx('news-views')}>
                                                            👁️ {newsItem.views}
                                                        </span>
                                                        <span className={cx('news-date')}>{formatDate(newsItem.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <div className={cx('swiper-button-prev')}>
                                <FontAwesomeIcon icon={faChevronLeft} className={cx('swiper-icon')} />
                            </div>
                            <div className={cx('swiper-button-next')}>
                                <FontAwesomeIcon icon={faChevronRight} className={cx('swiper-icon')} />
                            </div>
                        </div>
                    </div>
                )}
                
                <div className={cx('library-section')}>
                    <Library />
                </div>
            </div>
        </div>
    );
}

export default NewsLibrary;
