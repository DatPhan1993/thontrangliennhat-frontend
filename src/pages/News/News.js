import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import Card from '~/components/CardContent/CardContent';
import SuggestCard from '~/components/SuggestCard/SuggestCard';
import { getNewsAll, getNewsByCategory } from '~/services/newsService';
import styles from './News.module.scss';
import Title from '~/components/Title/Title';
import ButtonGroup from '~/components/ButtonGroup/ButtonGroup';
import PushNotification from '~/components/PushNotification/PushNotification';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import routes from '~/config/routes';
import { getCategoriesBySlug } from '~/services/categoryService';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Helmet, HelmetProvider } from "react-helmet-async";
import dayjs from 'dayjs';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Empty } from 'antd';
import { getImageUrl } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

const News = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groupedNews, setGroupedNews] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSuggestion, setSelectedSuggestion] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const newsPerPage = 9;

    useEffect(() => {
        const fetchCategoriesAndNews = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const categoriesData = await getCategoriesBySlug('tin-tuc');
                setCategories(categoriesData);

                // Get all news items
                const allNewsData = await getNewsAll();
                console.log("All news data:", allNewsData);
                
                const processedNews = allNewsData.map((item) => ({
                    ...item,
                    isNew: dayjs().diff(dayjs(item.createdAt), 'day') <= 3,
                }));
                
                setNewsItems(processedNews);

                // Group news by category
                const groupedNewsMap = {};
                await Promise.all(
                    categoriesData.map(async (category) => {
                        const newsData = await getNewsByCategory(category.id);
                        groupedNewsMap[category.id] = newsData.map((item) => ({
                            ...item,
                            isNew: dayjs().diff(dayjs(item.createdAt), 'day') <= 3,
                        }));
                    }),
                );

                setGroupedNews(groupedNewsMap);
            } catch (error) {
                setError(error);
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoriesAndNews();
    }, []);

    const handleButtonClick = (index) => {
        setSelectedSuggestion(index);
    };

    const getCategorySlug = (categoryId) => {
        const category = categories.find((category) => categoryId === category.id);
        return category ? category.slug : '';
    };

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <PushNotification message={errorMessage} />;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    const filteredNewsItems = newsItems
        .filter((item) => {
            if (selectedSuggestion === 0) {
                return item.isFeatured;
            }
            if (selectedSuggestion === 1) {
                return item.views > 10;
            }
            return true;
        })
        .slice(0, 5);

    // Pagination logic
    const indexOfLastNews = currentPage * newsPerPage;
    const indexOfFirstNews = indexOfLastNews - newsPerPage;
    const currentNewsItems = newsItems.slice(indexOfFirstNews, indexOfLastNews);
    const totalPages = Math.ceil(newsItems.length / newsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderNews = () => {
        if (currentNewsItems.length === 0) {
            return (
                <>
                    <div />
                    <Empty className={cx('empty-element')} description="Đang cập nhật..." />
                    <div />
                </>
            );
        }

        return currentNewsItems.map((item, index) => (
            <Link key={index} to={`${routes.news}/tin-tuc-id/${item.id}`}>
                <Card
                    title={item.title}
                    summary={item.summary}
                    image={item.images}
                    createdAt={item.createdAt}
                    views={item.views}
                    isNew={item.isNew}
                />
            </Link>
        ));
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        
        return (
            <div className={cx('pagination')}>
                <div
                    className={cx('pageButton', { disabled: currentPage === 1 })}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </div>
                {Array.from({ length: totalPages }, (_, index) => (
                    <div
                        key={index}
                        className={cx('pageButton', { active: currentPage === index + 1 })}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </div>
                ))}
                <div
                    className={cx('pageButton', { disabled: currentPage === totalPages })}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    <FontAwesomeIcon icon={faArrowRight} />
                </div>
            </div>
        );
    };

    return (
        <article className={cx('wrapper')}>
            <HelmetProvider>
                <title>Tin Tức | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
                <meta
                    name="description"
                    content="HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật hoạt động đa ngành nghề, trong đó tiêu biểu có thể kể đến là nuôi cá lồng, cải tạo nâng cấp vườn cây quanh các hồ thủy điện, phát triển về du lịch sinh thái, du lịch nông nghiệp. Ngoài ra còn thực hiện sản xuất các loại thực phẩm như chả cá, trái cây thực phẩm sấy khô và sấy dẻo, các loại tinh dầu tự nhiên,…"
                />
                <meta name="keywords" content="tin tức, cập nhật, phunongbuondon" />
            </HelmetProvider>
            
            <div className={cx('news-section')}>
                <Title text="Tin Tức" />
                
                <div className={cx('news-grid')}>
                    {renderNews()}
                </div>
                
                {renderPagination()}

                <div className={cx('suggest')}>
                    <h2 className={cx('suggest-title')}>Có thể bạn quan tâm</h2>
                    <ButtonGroup buttons={['Nổi bật', 'Xem nhiều']} onButtonClick={handleButtonClick} />
                    <div className={cx('suggest-items')}>
                        {filteredNewsItems.map((item, index) => (
                            <Link key={index} to={`${routes.news}/tin-tuc-id/${item.id}`}>
                                <SuggestCard
                                    title={item.title}
                                    summary={item.summary}
                                    image={item.images}
                                    createdAt={item.createdAt}
                                    views={item.views}
                                    isNew={item.isNew}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
                
                {categories.map((category) => {
                    const slides = groupedNews[category.id]?.slice(0, 6) || [];
                    const shouldLoop = slides.length > 3;

                    return (
                        <div key={category.id} className={cx('news-category')}>
                            <Title
                                text={category.title || 'Loading...'}
                                showSeeAll={true}
                                slug={`${routes.news}/${category.slug}`}
                                categoryId={category.id}
                            />
                            <Swiper
                                spaceBetween={10}
                                slidesPerView={3}
                                breakpoints={{
                                    1280: { slidesPerView: 3 },
                                    1024: { slidesPerView: 3 },
                                    768: { slidesPerView: 2 },
                                    0: { slidesPerView: 1 },
                                }}
                                loop={shouldLoop}
                                modules={[Autoplay, Navigation, Pagination]}
                                autoplay={{
                                    delay: 2000,
                                    disableOnInteraction: false,
                                }}
                                navigation={{
                                    nextEl: '.swiper-button-next',
                                    prevEl: '.swiper-button-prev',
                                }}
                                pagination={{ clickable: true }}
                            >
                                {groupedNews[category.id]?.slice(0, 6).map((item, index) => (
                                    <SwiperSlide key={index} className={cx('slide')}>
                                        <Link to={`${routes.news}/tin-tuc-id/${item.id}`}>
                                            <Card
                                                title={item.title}
                                                summary={item.summary}
                                                image={item.images}
                                                createdAt={item.createdAt}
                                                views={item.views}
                                                isNew={item.isNew}
                                            />
                                        </Link>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    );
                })}
            </div>
        </article>
    );
};

export default News;
