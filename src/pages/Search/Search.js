import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import Card from '~/components/CardSearch/CardContent';
import { searchItems } from '~/services/searchService';
import styles from './Search.module.scss';
import PushNotification from '~/components/PushNotification/PushNotification';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import routes from '~/config/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Empty } from 'antd';
import Title from '~/components/Title/Title';

const cx = classNames.bind(styles);

const Search = () => {
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [experiences, setExperiences] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tạo các trạng thái riêng cho phân trang từng mục
    const [productPage, setProductPage] = useState(1);
    const [productTotalPages, setProductTotalPages] = useState(1);
    const [servicePage, setServicePage] = useState(1);
    const [serviceTotalPages, setServiceTotalPages] = useState(1);
    const [experiencePage, setExperiencePage] = useState(1);
    const [experienceTotalPages, setExperienceTotalPages] = useState(1);

    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');
    const resultsPerPage = 6;

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                const searchData = await searchItems(query, resultsPerPage, productPage, servicePage, experiencePage);

                setProducts(searchData.products.data);
                setServices(searchData.services.data);
                setExperiences(searchData.experiences.data);

                // Cập nhật số trang cho từng mục
                setProductPage(searchData.products.current_page);
                setProductTotalPages(searchData.products.last_page);

                setServicePage(searchData.services.current_page);
                setServiceTotalPages(searchData.services.last_page);

                setExperiencePage(searchData.experiences.current_page);
                setExperienceTotalPages(searchData.experiences.last_page);
            } catch (error) {
                setError(error);
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchSearchResults();
        }
    }, [query, productPage, servicePage, experiencePage]);

    const handlePageChange = (category, pageNumber) => {
        if (category === 'products' && pageNumber >= 1 && pageNumber <= productTotalPages) {
            setProductPage(pageNumber);
        } else if (category === 'services' && pageNumber >= 1 && pageNumber <= serviceTotalPages) {
            setServicePage(pageNumber);
        } else if (category === 'experiences' && pageNumber >= 1 && pageNumber <= experienceTotalPages) {
            setExperiencePage(pageNumber);
        }
    };

    const getLinkByType = (item, type) => {
        switch (type) {
            case 'products':
                return `${routes.products}/${item.slug}/${item.id}`;
            case 'services':
                return `${routes.services}/${item.slug}/${item.id}`;
            case 'experiences':
                return `${routes.experiences}/${item.slug}/${item.id}`;
            default:
                return '#';
        }
    };

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <PushNotification message={errorMessage} />;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    const renderCategoryResults = (title, items, type, currentPage, totalPages) => {
        if (items.length === 0) return null;
        return (
            <>
                <Title text={title} />
                <div className={cx('search-items')}>
                    {items.map((item, index) => (
                        <Link key={index} to={getLinkByType(item, type)}>
                            <Card
                                title={item.name}
                                summary={item.summary}
                                image={item.images[0]}
                                createdAt={new Date(item.created_at).getTime()}
                                showViews={false}
                            />
                        </Link>
                    ))}
                </div>
                {renderPagination(type, currentPage, totalPages)}
            </>
        );
    };

    const renderPagination = (category, currentPage, totalPages) => {
        if (totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <div
                    key={i}
                    className={cx('pageButton', { active: currentPage === i })}
                    onClick={() => handlePageChange(category, i)}
                >
                    {i}
                </div>,
            );
        }

        return (
            <div className={cx('pagination')}>
                <div
                    className={cx('pageButton', { disabled: currentPage === 1 })}
                    onClick={() => handlePageChange(category, currentPage - 1)}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </div>
                {pages}
                <div
                    className={cx('pageButton', { disabled: currentPage === totalPages })}
                    onClick={() => handlePageChange(category, currentPage + 1)}
                >
                    <FontAwesomeIcon icon={faArrowRight} />
                </div>
            </div>
        );
    };

    const renderSearchResults = () => {
        if (products.length === 0 && services.length === 0 && experiences.length === 0) {
            return (
                <Empty
                    description={
                        <span>
                            Không tìm thấy dữ liệu với từ khóa <strong>"{query}"</strong>
                        </span>
                    }
                />
            );
        }

        return (
            <>
                {renderCategoryResults('Sản phẩm', products, 'products', productPage, productTotalPages)}
                {renderCategoryResults('Dịch vụ du lịch', services, 'services', servicePage, serviceTotalPages)}
                {renderCategoryResults(
                    'Khu vực trải nghiệm',
                    experiences,
                    'experiences',
                    experiencePage,
                    experienceTotalPages,
                )}
            </>
        );
    };

    return (
        <article className={cx('wrapper')}>
            <div className={cx('search-section')}>
                <div className={cx('search-column')}>
                    <h2 className={cx('search-title')}>Kết Quả Tìm Kiếm</h2>
                    {renderSearchResults()}
                </div>
            </div>
        </article>
    );
};

export default Search;
