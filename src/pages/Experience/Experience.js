import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import CardExperience from '~/components/CardService/CardService';
import { getExperiences } from '~/services/experienceService';
import styles from './Experience.module.scss';
import Title from '~/components/Title/Title';
import PushNotification from '~/components/PushNotification/PushNotification';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import routes from '~/config/routes';
import { getCategoriesBySlug } from '~/services/categoryService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { getImageUrl } from '~/utils/imageUtils';
import { Button } from 'antd';

const cx = classNames.bind(styles);

// Helper function to process image paths
const processImagePath = (images) => {
    // Handle array of images
    if (Array.isArray(images)) {
        return images.length > 0 ? getImageUrl(images[0]) : '';
    }
    // Handle single image string
    return getImageUrl(images);
};

const Experience = () => {
    const [allExperiences, setAllExperiences] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const experiencesPerPage = 9;
    
    const fetchExperiences = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Fetch categories and experiences
            const [categoriesData, experiencesData] = await Promise.all([
                getCategoriesBySlug('trai-nghiem'),
                getExperiences()
            ]);
            
            if (categoriesData && Array.isArray(categoriesData)) {
                setCategories(categoriesData);
            }
            
            if (experiencesData && Array.isArray(experiencesData)) {
                console.log(`Found ${experiencesData.length} total experiences`);
                
                // Process experiences for display
                const processedExperiences = experiencesData.map(exp => ({
                    ...exp,
                    id: exp.id,
                    name: exp.name || exp.title,
                    title: exp.title || exp.name,
                    summary: exp.summary,
                    createdAt: exp.createdAt || exp.created_at || new Date().toISOString(),
                    views: exp.views || 0,
                    image: processImagePath(exp.images),
                }));
                
                setAllExperiences(processedExperiences);
                setError(null);
            } else {
                setError("Không tìm thấy trải nghiệm nào. Vui lòng thử lại sau.");
            }
        } catch (err) {
            console.error("Error fetching experiences:", err);
            setError("Lỗi khi tải dữ liệu trải nghiệm. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    // Pagination
    const indexOfLastExperience = currentPage * experiencesPerPage;
    const indexOfFirstExperience = indexOfLastExperience - experiencesPerPage;
    const currentExperiences = allExperiences.slice(indexOfFirstExperience, indexOfLastExperience);
    const totalPages = Math.ceil(allExperiences.length / experiencesPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    return (
        <article className={cx('wrapper')}>
            <HelmetProvider>
                <title>Trải Nghiệm - Thôn Trang Liên Nhật</title>
                <meta
                    name="description"
                    content="Khám phá các trải nghiệm đặc sắc tại Thôn Trang Liên Nhật - từ mô hình sinh kế đến các hoạt động vui chơi, tham quan"
                />
            </HelmetProvider>
            
            {error ? (
                <div className={cx('error-container')}>
                    <div className={cx('error-message')}>
                        <h3>Thông báo</h3>
                        <p>{error}</p>
                        <Button 
                            className={cx('retry-button')}
                            onClick={fetchExperiences}
                            icon={<FontAwesomeIcon icon={faSyncAlt} />}
                        >
                            Thử lại
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={cx('experiences-section')}>
                    <div className={cx('experiences-header')}>
                        <h2 className={cx('experiences-title')}>Khu Vực Trải Nghiệm</h2>
                    </div>
                    
                    <div className={cx('experiences-grid')}>
                        {currentExperiences.map((experience, index) => (
                            <Link 
                                key={index} 
                                to={`${routes.experiences}/trai-nghiem/${experience.id}`}
                                className={cx('experience-item')}
                            >
                                <CardExperience
                                    title={experience.title}
                                    summary={experience.summary}
                                    image={experience.image}
                                    createdAt={experience.createdAt}
                                    views={experience.views}
                                />
                            </Link>
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
            )}
        </article>
    );
};

export default Experience;
