import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import CardService from '~/components/CardService/CardService';
// import SuggestCard from '~/components/SuggestCard';
import { getServices } from '~/services/serviceService';
import styles from './Service.module.scss';
import Title from '~/components/Title/Title';
// import ButtonGroup from '~/components/ButtonGroup';
import PushNotification from '~/components/PushNotification/PushNotification';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import routes from '~/config/routes';
import { getCategoriesBySlug } from '~/services/categoryService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Helmet, HelmetProvider } from "react-helmet-async";

const cx = classNames.bind(styles);

const Service = () => {
    const [allServices, setAllServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const servicesPerPage = 9;
    const navigate = useNavigate();
    // const [selectedSuggestion, setSelectedSuggestion] = useState(0);

    useEffect(() => {
        const fetchServicesAndCategories = async () => {
            try {
                const [categoriesData, servicesData] = await Promise.all([
                    getCategoriesBySlug('dich-vu'),
                    getServices(),
                ]);
                
                // Process services
                const processedServices = servicesData.map(service => {
                    console.log(`[Service] Processing service: ${service.id} - ${service.name}`);
                    
                    return {
                        ...service,
                        image: service.images
                    };
                });
                
                setCategories(categoriesData);
                setAllServices(processedServices);
                console.log(`[Service] Loaded ${processedServices.length} services`);
            } catch (error) {
                setError(error);
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServicesAndCategories();
    }, []);

    // const handleButtonClick = (index) => {
    //     setSelectedSuggestion(index);
    // };

    const handleServiceClick = (service, categorySlug) => {
        console.log('Navigating to service:', service);
        console.log('Category slug:', categorySlug);
        console.log('Service ID:', service.id);
        
        // Ensure we have a valid ID before navigating
        if (!service.id) {
            console.error('Service ID is missing:', service);
            return;
        }
        
        const url = `${routes.services}/${categorySlug}/${service.id}`;
        console.log('Navigation URL:', url);
        navigate(url);
    };

    const getCategorySlug = (categoryId) => {
        if (!categoryId) return 'dich-vu';
        
        // Convert to string for comparison if needed
        const categoryIdStr = String(categoryId);
        const category = categories.find((cat) => String(cat.id) === categoryIdStr);
        return category ? category.slug : 'dich-vu';
    };

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <PushNotification message={errorMessage} />;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    // Pagination
    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = allServices.slice(indexOfFirstService, indexOfLastService);
    const totalPages = Math.ceil(allServices.length / servicesPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // const filteredServiceItems = serviceItems
    //     .filter((item) => {
    //         if (selectedSuggestion === 0) {
    //             return item.isFeatured;
    //         }
    //         if (selectedSuggestion === 1) {
    //             return item.views > 10;
    //         }
    //         return true;
    //     })
    //     .slice(0, 5);

    return (
        <article className={cx('wrapper')}>
            <HelmetProvider>
                <title>Dịch Vụ Du Lịch | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
                <meta
                    name="description"
                    content="HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật hoạt động đa ngành nghề, trong đó tiêu biểu có thể kể đến là nuôi cá lồng, cải tạo nâng cấp vườn cây quanh các hồ thủy điện, phát triển về du lịch sinh thái, du lịch nông nghiệp. Ngoài ra còn thực hiện sản xuất các loại thực phẩm như chả cá, trái cây thực phẩm sấy khô và sấy dẻo, các loại tinh dầu tự nhiên,…"
                />
                <meta
                    name="keywords"
                    content="dịch vụ nông nghiệp du lịch, hợp tác xã, sản phẩm nông nghiệp, phunongbuondon"
                />
                <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
            </HelmetProvider>
            
            <div className={cx('services-section')}>
                <div className={cx('services-header')}>
                    <h2 className={cx('services-title')}>Dịch Vụ Du Lịch</h2>
                </div>
                
                <div className={cx('services-grid')}>
                    {currentServices.map((service) => (
                        <div 
                            key={service.id}
                            className={cx('service-item')}
                            onClick={() => handleServiceClick(service, getCategorySlug(service.child_nav_id))}
                        >
                            <CardService
                                title={service.name}
                                summary={service.summary}
                                image={service.images}
                                createdAt={service.created_at || service.createdAt}
                            />
                        </div>
                    ))}
                </div>
                
                {totalPages > 1 && (
                    <div className={cx('pagination')}>
                        <div 
                            className={cx('pagination-button')} 
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </div>
                        
                        {Array.from({ length: totalPages }, (_, index) => (
                            <div
                                key={index}
                                className={cx('pagination-button', { active: currentPage === index + 1 })}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </div>
                        ))}
                        
                        <div 
                            className={cx('pagination-button')} 
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
};

export default Service;
