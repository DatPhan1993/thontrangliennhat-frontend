import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getServiceByCategory } from '~/services/serviceService';
import Title from '~/components/Title/Title';
import styles from './ServiceCategory.module.scss';
import { Link } from 'react-router-dom';
import CardService from '~/components/CardService/CardService';
import { getCategoriesBySlug } from '~/services/categoryService';
import routes from '~/config/routes';
import { Helmet, HelmetProvider } from "react-helmet-async";
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import { Empty } from 'antd';

const cx = classNames.bind(styles);

function ServiceCategory() {
    const location = useLocation();
    const navigate = useNavigate();
    const [service, setService] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const servicePerPage = 12;

    const extractSlugFromPathname = (pathname) => {
        const parts = pathname.split('/');
        return parts.length > 2 ? parts[2] : null;
    };

    const slug = extractSlugFromPathname(location.pathname);

    useEffect(() => {
        async function fetchCategory() {
            try {
                const categories = await getCategoriesBySlug('dich-vu');
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
        async function fetchServiceCategory() {
            if (categoryId) {
                setLoading(true);
                try {
                    const data = await getServiceByCategory(categoryId);
                    setService(data);
                } catch (error) {
                    console.error('Error fetching service:', error);
                } finally {
                    setLoading(false);
                }
            }
        }

        fetchServiceCategory();
    }, [categoryId]);

    const indexOfLastService = currentPage * servicePerPage;
    const indexOfFirstService = indexOfLastService - servicePerPage;
    const currentServiceCategory = service.slice(indexOfFirstService, indexOfLastService);

    const totalPages = Math.ceil(service.length / servicePerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleServiceClick = (serviceId) => {
        console.log('Navigating to service with ID:', serviceId);
        console.log('Category slug:', slug);
        
        // Ensure we have a valid ID before navigating
        if (!serviceId) {
            console.error('Service ID is missing');
            return;
        }
        
        const url = `${routes.services}/${slug}/${serviceId}`;
        console.log('Navigation URL:', url);
        navigate(url);
    };

    const renderServiceCategory = () => {
        if (currentServiceCategory.length === 0) {
            return (
                <>
                    <div />
                    <Empty className={cx('empty-element')} description="Đang cập nhật..." />
                    <div />
                </>
            );
        }
        return currentServiceCategory.map((serviceItem, index) => (
            <div 
                key={serviceItem.id} 
                className={cx('service-item')}
                onClick={() => handleServiceClick(serviceItem.id)}
            >
                <CardService
                    key={index}
                    title={serviceItem.name}
                    image={serviceItem.images}
                    summary={serviceItem.summary}
                    createdAt={new Date(serviceItem.createdAt).getTime()}
                />
            </div>
        ));
    };

    const renderPagination = () => {
        return (
            <div className={cx('pagination')}>
                <div className={cx('pageButton')} onClick={() => handlePageChange(currentPage - 1)}>
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
                <div className={cx('pageButton')} onClick={() => handlePageChange(currentPage + 1)}>
                    <FontAwesomeIcon icon={faArrowRight} />
                </div>
            </div>
        );
    };

    return (
        <div className={cx('container')}>
            <HelmetProvider>
                <title>{categoryName} | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
                <meta
                    name="description"
                    content={`Xem các dịch vụ du lịch liên quan đến ${categoryName} trên HTX Nông Nghiệp - Du Lịch Phú Nông Buôn.`}
                />
                <meta name="keywords" content={`${categoryName}, dịch vụ, phunongbuondon`} />
                <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
            </HelmetProvider>
            {loading ? (
                <LoadingScreen isLoading={loading} />
            ) : (
                <>
                    <Title text={categoryName} />
                    <div className={cx('serviceGrid')}>{renderServiceCategory()}</div>
                    {renderPagination()}
                </>
            )}
        </div>
    );
}

export default ServiceCategory;
