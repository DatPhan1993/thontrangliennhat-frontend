import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import { getFeaturedExperiences } from '~/services/experienceService';
import { getCategoriesBySlug } from '~/services/categoryService';
import CardExperience from '~/components/CardService/CardService';
import Title from '~/components/Title/Title';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import { Link, useNavigate } from 'react-router-dom';
import routes from '~/config/routes';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import styles from './Experiences.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { getImageUrl } from '~/utils/imageUtils';
import { Button } from 'antd';

const cx = classNames.bind(styles);

function Experiences() {
    const navigate = useNavigate();
    const [experiences, setExperiences] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchExperiences = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Clear sessionStorage manually to ensure we get fresh data
            sessionStorage.removeItem('allExperiences');
            for (let i = 1; i <= 50; i++) {
                sessionStorage.removeItem(`experience_${i}`);
            }
            
            // Get featured experiences (limit to 6)
            let featuredData = [];
            
            try {
                // Try to fetch from API experiences endpoint
                const timestamp = new Date().getTime();
                const response = await fetch(`/api/experiences?_=${timestamp}`);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.data && Array.isArray(data.data)) {
                        // Get featured experiences
                        featuredData = data.data
                            .filter(exp => exp.isFeatured)  // Get featured first
                            .slice(0, 6);  // Limit to 6
                        
                        if (featuredData.length === 0) {
                            // If no featured, just get the latest 6
                            featuredData = data.data
                                .sort((a, b) => {
                                    const dateA = new Date(a.createdAt || a.created_at || 0);
                                    const dateB = new Date(b.createdAt || b.created_at || 0);
                                    return dateB - dateA;
                                })
                                .slice(0, 6);
                        }
                    }
                } else {
                    console.warn('API response was not OK:', response.status);
                    throw new Error(`API returned ${response.status}`);
                }
            } catch (apiError) {
                console.error('Error fetching from API experiences endpoint:', apiError);
                
                // Try content endpoint as fallback
                try {
                    const timestamp = new Date().getTime();
                    const contentResponse = await fetch(`/api/content?_=${timestamp}`);
                    
                    if (contentResponse.ok) {
                        const contentData = await contentResponse.json();
                        if (contentData && contentData.data && Array.isArray(contentData.data)) {
                            featuredData = contentData.data
                                .filter(exp => exp.isFeatured)
                                .slice(0, 6);
                                
                            if (featuredData.length === 0) {
                                featuredData = contentData.data
                                    .sort((a, b) => {
                                        const dateA = new Date(a.createdAt || a.created_at || 0);
                                        const dateB = new Date(b.createdAt || b.created_at || 0);
                                        return dateB - dateA;
                                    })
                                    .slice(0, 6);
                            }
                        }
                    }
                } catch (contentError) {
                    console.error('Error fetching from content API:', contentError);
                }
            }
            
            // If we didn't get data from either endpoint, try our service function
            if (featuredData.length === 0) {
                featuredData = await getFeaturedExperiences(6);
            }
            
            // Process the experiences data
            if (featuredData && featuredData.length > 0) {
                const processedExperiences = featuredData.map(exp => {
                    return {
                        ...exp,
                        id: exp.id,
                        title: exp.title || exp.name,
                        name: exp.name || exp.title,
                        directImageUrl: getImageUrl(exp.images),
                        categoryId: exp.categoryId || exp.child_nav_id || 10
                    };
                });
                
                setExperiences(processedExperiences);
            } else {
                // Use static data if all else fails
                setExperiences([
                    {
                        id: 1,
                        title: 'Câu cá - Bắt cá ao đầm',
                        name: 'Câu cá - Bắt cá ao đầm',
                        slug: 'cau-ca-bat-ca',
                        summary: 'Trải nghiệm thú vị về câu cá và bắt cá dành cho trẻ em và người lớn',
                        directImageUrl: '/images/experiences/cau-ca.jpg',
                        categoryId: 1
                    },
                    {
                        id: 2,
                        title: 'Chợ quê 3 trong 1',
                        name: 'Chợ quê 3 trong 1',
                        slug: 'cho-que',
                        summary: 'Trải nghiệm mua sắm tại chợ quê với đa dạng sản phẩm nông nghiệp sạch',
                        directImageUrl: '/images/experiences/cho-que.jpg',
                        categoryId: 1
                    },
                    {
                        id: 3,
                        title: 'Mô hình sinh kế',
                        name: 'Mô hình sinh kế',
                        slug: 'mo-hinh-sinh-ke',
                        summary: 'Tìm hiểu mô hình sinh kế theo quy trình khép kín cho phát triển kinh tế bền vững',
                        directImageUrl: '/images/experiences/mo-hinh-sinh-ke.jpg',
                        categoryId: 2
                    }
                ]);
            }
            
            // Also fetch categories
            try {
                const categoriesData = await getCategoriesBySlug('trai-nghiem');
                setCategories(categoriesData || []);
            } catch (catError) {
                console.error('Error fetching categories:', catError);
            }
        } catch (err) {
            console.error('Error in fetchExperiences:', err);
            setError(err);
            // Use empty array instead of null for better error handling in UI
            setExperiences([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExperiences();
    }, [fetchExperiences]);

    // Set fixed slides per view to 3 for default display
    const slidesPerView = 3;
    const useLoopMode = experiences.length >= (slidesPerView * 2);

    const handleRetry = () => {
        console.log('Retrying to load experiences...');
        fetchExperiences();
    };

    const handleViewAllExperiences = () => {
        console.log('Navigating to experiences page:', routes.experiences);
        navigate(routes.experiences);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Title 
                    text="KHU VỰC TRẢI NGHIỆM" 
                    showSeeAll={true} 
                    slug={routes.experiences}
                    onClick={handleViewAllExperiences}
                />
                <div className={cx('experience-slider-container')}>
                    {loading ? (
                        <LoadingScreen isLoading={loading} />
                    ) : error ? (
                        <div className={cx('error-container')}>
                            <div className={cx('error-message')}>
                                <p>Không thể tải dữ liệu trải nghiệm. Vui lòng thử lại.</p>
                                <Button 
                                    onClick={handleRetry} 
                                    className={cx('retry-button')}
                                    icon={<FontAwesomeIcon icon={faSyncAlt} />}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        </div>
                    ) : experiences.length === 0 ? (
                        <div className={cx('error-container')}>
                            <div className={cx('empty-message')}>
                                <p>Khu vực trải nghiệm đang được cập nhật. Vui lòng quay lại sau.</p>
                                <Button 
                                    onClick={handleRetry} 
                                    className={cx('retry-button')}
                                    icon={<FontAwesomeIcon icon={faSyncAlt} />}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Swiper
                                spaceBetween={20}
                                slidesPerView={3}
                                breakpoints={{
                                    1280: { slidesPerView: 3 },
                                    1024: { slidesPerView: 3 },
                                    768: { slidesPerView: 2 },
                                    0: { slidesPerView: 1 },
                                }}
                                loop={useLoopMode}
                                modules={[Autoplay, Navigation, Pagination]}
                                autoplay={{
                                    delay: 5000, // 5 seconds between transitions
                                    disableOnInteraction: false,
                                }}
                                navigation={{
                                    nextEl: `.${cx('swiper-button-next')}`,
                                    prevEl: `.${cx('swiper-button-prev')}`,
                                }}
                                pagination={{
                                    clickable: true,
                                    dynamicBullets: true
                                }}
                                className={cx('swiper')}
                            >
                                {experiences.map((experience, index) => (
                                    <SwiperSlide key={index} className={cx('slide')}>
                                        <Link to={`/trai-nghiem/trai-nghiem/${experience.id}`} style={{ height: '100%', display: 'block', width: '100%' }}>
                                            <CardExperience
                                                title={experience.title || experience.name}
                                                summary={experience.summary}
                                                image={experience.directImageUrl}
                                                createdAt={experience.created_at || experience.createdAt}
                                            />
                                        </Link>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            {experiences.length > 1 && (
                                <>
                                    <div className={cx('swiper-button-prev')}>
                                        <FontAwesomeIcon icon={faChevronLeft} className={cx('swiper-icon')} />
                                    </div>
                                    <div className={cx('swiper-button-next')}>
                                        <FontAwesomeIcon icon={faChevronRight} className={cx('swiper-icon')} />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Experiences;