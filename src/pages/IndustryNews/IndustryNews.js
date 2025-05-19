import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getNewsByCategory } from '~/services/newsService';
import Title from '~/components/Title/Title';
import styles from './IndustryNews.module.scss';
import { Link } from 'react-router-dom';
import Card from '~/components/CardContent/CardContent';
import { getCategoriesBySlug } from '~/services/categoryService';
import routes from '~/config/routes';
import { Helmet, HelmetProvider } from "react-helmet-async";
import dayjs from 'dayjs';
import { DatePicker, Space, Button, Empty } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import 'moment/locale/vi';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';

const { RangePicker } = DatePicker;

const cx = classNames.bind(styles);

function NewsCategory() {
    const location = useLocation();
    const [news, setNews] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterDates, setFilterDates] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const newsPerPage = 6;
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [loading, setLoading] = useState(true);

    const extractSlugFromPathname = (pathname) => {
        const parts = pathname.split('/');
        return parts.length > 2 ? parts[2] : null;
    };

    const slug = extractSlugFromPathname(location.pathname);

    useEffect(() => {
        async function fetchCategory() {
            try {
                setLoading(true);
                const categories = await getCategoriesBySlug('tin-tuc');
                const category = categories.find((cat) => cat.slug === slug);
                if (category) {
                    setCategoryId(category.id);
                    setCategoryName(category.title);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }

        if (slug) {
            fetchCategory();
        }
    }, [slug]);

    useEffect(() => {
        async function fetchNewsCategory() {
            if (categoryId) {
                try {
                    setLoading(true);
                    const startDate = filterDates && filterDates[0] ? dayjs(filterDates[0]).format('YYYY-MM-DD') : '';
                    const endDate = filterDates && filterDates[1] ? dayjs(filterDates[1]).format('YYYY-MM-DD') : '';

                    const data = await getNewsByCategory(categoryId, startDate, endDate, currentPage, newsPerPage);

                    setNews(
                        data.map((newsItem) => ({
                            ...newsItem,
                            isNew: dayjs().diff(dayjs(newsItem.createdAt), 'day') <= 3,
                        })),
                    );
                    setTotalPages(data.totalPages);
                } catch (error) {
                    console.error('Error fetching news:', error);
                } finally {
                    setLoading(false);
                }
            }
        }

        fetchNewsCategory();
    }, [categoryId, filterDates, currentPage]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // const handleRangeChange = (dates) => {
    //     setFilterDates(dates);
    //     setCurrentPage(1);
    // };

    const renderNewsCategory = () => {
        if (news.length === 0) {
            return (
                <>
                    <div />
                    <Empty description="Không có tin tức để hiển thị" />
                    <div />
                </>
            );
        }

        return news.map((newsItem) => (
            <Link to={`${routes.news}/${slug}/${newsItem.id}`} key={newsItem.id}>
                <Card
                    title={newsItem.title}
                    image={newsItem.images[0]}
                    summary={newsItem.summary}
                    createdAt={newsItem.created_at}
                    views={newsItem.views}
                    isNew={newsItem.isNew}
                />
            </Link>
        ));
    };

    const renderPagination = () => {
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

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    return (
        <div className={cx('container')}>
            <HelmetProvider>
                <title>{categoryName} | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
                <meta
                    name="description"
                    content={`Xem các tin tức liên quan đến ${categoryName} trên HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật.`}
                />
                <meta
                    name="keywords"
                    content={`${categoryName}, tin hợp tác xã, tin nông nghiệp - du lịch, tin tức, phunongbuondon`}
                />
                <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
            </HelmetProvider>

            <Title text={categoryName} />

            {/* <div className={cx('filter')}>
                <Space direction="vertical" size={12}>
                    <RangePicker
                        value={filterDates}
                        onChange={handleRangeChange}
                        locale="vi"
                        popupStyle={{
                            width: windowWidth < 992 ? '100%' : 'auto',
                            maxWidth: windowWidth < 992 ? '300px' : 'none',
                            minWidth: '250px',
                            overflow: 'hidden',
                        }}
                    />
                </Space>
                <Button
                    className={cx('filter-button')}
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={() => setCurrentPage(1)}
                >
                    Lọc
                </Button>
            </div> */}

            <div className={cx('newsGrid')}>{renderNewsCategory()}</div>
            {renderPagination()}
        </div>
    );
}

export default NewsCategory;
