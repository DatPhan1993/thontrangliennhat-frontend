import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { getServices } from '~/services/serviceService';
import { getCategoriesBySlug } from '~/services/categoryService';
import CardService from '~/components/CardService/CardService';
import Title from '~/components/Title/Title';
import PushNotification from '~/components/PushNotification/PushNotification';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import { Link, useNavigate } from 'react-router-dom';
import routes from '~/config/routes';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './Services.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { normalizeImageUrl } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

// Map service names to image files
const serviceImageMap = {
    'Tour du lịch sinh thái rừng Liên Nhật': 'thon-trang-lien-nhat.jpg',
    'Trải nghiệm làng nghề thủ công': 'mo-hinh-sinh-ke.jpg',
    'Học văn hóa dân tộc': 'service1.jpg',
    'Tour cắm trại ven hồ': 'service2.jpg',
    'Chơi đùa với voi': 'service3.jpg',
    'Trải nghiệm bắt cá cùng trẻ em vùng quê': 'service4.jpg',
    'Chợ phiên nông sản sạch': 'service5.jpg',
    'Sinh hoạt cùng đồng bào dân tộc': 'service6.jpg',
    'Khám phá vườn trái cây': 'service7.jpg'
};

function Services() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Function to refresh service data
    const refreshServices = async () => {
        try {
            setLoading(true);
            // Clear any cache in sessionStorage for services
            sessionStorage.removeItem('allServices');
            
            const [servicesData, categoriesData] = await Promise.all([
                getServices(),
                getCategoriesBySlug('dich-vu'),
            ]);
            
            // Process service images with proper URLs
            const processedServices = servicesData.map((service) => {
                // Use normalizeImageUrl for consistent image handling
                const imageUrl = service.images ? 
                    (Array.isArray(service.images) && service.images.length > 0 
                        ? normalizeImageUrl(service.images[0]) 
                        : normalizeImageUrl(service.images))
                    : (service.image ? normalizeImageUrl(service.image) : null);
                
                console.log(`Service "${service.name}" image path:`, imageUrl);
                
                return {
                    ...service,
                    directImageUrl: imageUrl
                };
            });
            
            console.log('Processed services:', processedServices);
            setServices(processedServices);
            setCategories(categoriesData);
            setError(null);
        } catch (error) {
            console.error('Error loading services:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    // Load services on component mount
    useEffect(() => {
        refreshServices();
        
        // Also set up a refresh interval
        const intervalId = setInterval(() => {
            console.log('Auto-refreshing services data');
            refreshServices();
        }, 60000); // Refresh every minute
        
        return () => clearInterval(intervalId);
    }, []);

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
        if (!categoryId) return 'dich-vu'; // Default category if none exists
        
        // Convert to string for comparison if needed
        const categoryIdStr = String(categoryId);
        const category = categories.find((cat) => String(cat.id) === categoryIdStr);
        return category ? category.slug : 'dich-vu'; // Fallback to default if category not found
    };

    const handleViewAllServices = () => {
        console.log('Navigating to services page:', routes.services);
        navigate(routes.services);
    };

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <PushNotification message={errorMessage} />;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    // Check if we have enough items for loop mode - need at least 2x slidesPerView for proper loop
    const slidesPerView = Math.min(services.length, 3);
    const useLoopMode = services.length >= (slidesPerView * 2);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Title 
                    text="Dịch vụ du lịch" 
                    showSeeAll={true} 
                    slug={routes.services} 
                    onClick={handleViewAllServices}
                />
                <div className={cx('service-slider-container')}>
                    <Swiper
                        spaceBetween={20}
                        slidesPerView={slidesPerView}
                        breakpoints={{
                            1280: { slidesPerView: Math.min(services.length, 3) },
                            1024: { slidesPerView: Math.min(services.length, 2) },
                            768: { slidesPerView: Math.min(services.length, 2) },
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
                        {services.map((service, index) => {
                            const categorySlug = getCategorySlug(service.child_nav_id);
                            return (
                                <SwiperSlide key={index} className={cx('slide')}>
                                    <div 
                                        className={cx('service-item')}
                                        onClick={() => handleServiceClick(service, categorySlug)}
                                    >
                                        <CardService
                                            title={service.name}
                                            summary={service.summary}
                                            image={service.directImageUrl}
                                            createdAt={service.created_at}
                                        />
                                    </div>
                                </SwiperSlide>
                            )
                        })}
                    </Swiper>
                    {services.length > 1 && (
                        <>
                            <div className={cx('swiper-button-prev')}>
                                <FontAwesomeIcon icon={faChevronLeft} className={cx('swiper-icon')} />
                            </div>
                            <div className={cx('swiper-button-next')}>
                                <FontAwesomeIcon icon={faChevronRight} className={cx('swiper-icon')} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Services;