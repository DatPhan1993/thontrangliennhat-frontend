import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ExperienceDetail.module.scss';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import PushNotification from '~/components/PushNotification/PushNotification';
import DateTime from '~/components/DateTime/DateTime';
import Title from '~/components/Title/Title';
import { getExperienceById } from '~/services/experienceService';
import { Helmet, HelmetProvider } from "react-helmet-async";
import routes from '~/config/routes';
import { getImageUrl } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

const ExperienceDetail = () => {
    const { id, category } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [experienceDetail, setExperienceDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExperienceDetail = async () => {
            try {
                if (!id) {
                    throw new Error('Experience ID not provided');
                }
                
                // Try to get experience from API first
                try {
                    const data = await getExperienceById(id);
                    if (data) {
                        // Process the experience data if found
                        processExperienceData(data);
                        return;
                    }
                } catch (apiError) {
                    console.log('API error, falling back to direct fetch:', apiError);
                    // Continue to fallback solution
                }
                
                // Fallback: Direct fetch from database.json in the phunongbuondon-api directory
                const response = await fetch('/phunongbuondon-api/database.json');
                if (!response.ok) {
                    // Try alternate location if first attempt fails
                    const altResponse = await fetch('./phunongbuondon-api/database.json');
                    if (!altResponse.ok) {
                        throw new Error(`Failed to fetch database.json: ${response.status}`);
                    }
                    const database = await altResponse.json();
                    handleExperienceData(database);
                    return;
                }
                
                const database = await response.json();
                handleExperienceData(database);
                
            } catch (error) {
                console.error('Error fetching experience detail:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        
        const handleExperienceData = (database) => {
            // Find the experience with matching ID in the experiences array
            const experienceData = database.experiences.find(experience => {
                // Handle both string and number IDs by comparing as strings
                return String(experience.id) === String(id);
            });
            
            if (!experienceData) {
                throw new Error('Experience not found in database');
            }
            
            console.log('Experience data found in database:', experienceData);
            
            // Process the experience data
            processExperienceData(experienceData);
        };

        const processExperienceData = (data) => {
            // Format image path using the getImageUrl utility
            if (data.images) {
                // Use the getImageUrl utility to properly handle all image formats
                data.formattedImage = getImageUrl(data.images);
                
                // If the utility returns an array (for multiple images), use the first one
                if (Array.isArray(data.formattedImage) && data.formattedImage.length > 0) {
                    data.formattedImage = data.formattedImage[0];
                }
                
                // If no image is returned, use the default
                if (!data.formattedImage) {
                    data.formattedImage = 'https://res.cloudinary.com/ddmzboxzu/image/upload/v1724202469/cer_3_ldetgd.png';
                }
            } else {
                // Default image if no images exist
                data.formattedImage = 'https://res.cloudinary.com/ddmzboxzu/image/upload/v1724202469/cer_3_ldetgd.png';
            }
            
            // Ensure proper content field is available
            data.displayContent = data.description || data.content || '<p>Không có nội dung chi tiết</p>';
            
            // Format date for display
            data.displayDate = data.createdAt || data.created_at || new Date().toISOString();
            
            setExperienceDetail(data);
            console.log('Processed experience data:', data);
        };

        fetchExperienceDetail();
    }, [id, category, navigate]);

    // Handle loading state
    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    // Handle error state with informative details
    if (error) {
        const errorMessage = error.response 
            ? `${error.response.status}: ${error.response.data?.message || error.message}` 
            : error.message || 'Network Error';
            
        return (
            <div className={cx('wrapper')}>
                <div className={cx('experience-header')}>
                    <h1 className={cx('experience-title')}>Chi tiết trải nghiệm</h1>
                </div>
                
                <div className={cx('experience-container')}>
                    <div className={cx('error-container')}>
                        <h2>Có lỗi xảy ra</h2>
                        <p>Không tìm thấy thông tin trải nghiệm bạn yêu cầu. ID: {id}</p>
                        <p className={cx('error-detail')}>{errorMessage}</p>
                        <button className={cx('back-button')} onClick={() => navigate(routes.experiences)}>
                            Quay lại danh sách trải nghiệm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Handle case when no experience detail is found
    if (!experienceDetail) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('experience-header')}>
                    <h1 className={cx('experience-title')}>Chi tiết trải nghiệm</h1>
                </div>
                
                <div className={cx('experience-container')}>
                    <div className={cx('error-container')}>
                        <h2>Không tìm thấy trải nghiệm</h2>
                        <p>Trải nghiệm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. ID: {id}</p>
                        <button className={cx('back-button')} onClick={() => navigate(routes.experiences)}>
                            Quay lại danh sách trải nghiệm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <article className={cx('wrapper')}>
            <HelmetProvider>
                <title>{`${experienceDetail.name || experienceDetail.title || 'Chi tiết trải nghiệm'} | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật`}</title>
                <meta name="description" content={experienceDetail.summary} />
                <meta name="keywords" content={`trải nghiệm du lịch, ${experienceDetail.name || experienceDetail.title}, phunongbuondon`} />
                <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
            </HelmetProvider>
            
            <div className={cx('experience-header')}>
                <h1 className={cx('experience-title')}>{experienceDetail.name || experienceDetail.title}</h1>
            </div>
            
            <div className={cx('experience-container')}>
                <div className={cx('experience-image')}>
                    <img src={experienceDetail.formattedImage} alt={experienceDetail.name || experienceDetail.title} />
                </div>
                
                {experienceDetail.summary && (
                    <div className={cx('experience-summary')}>
                        {experienceDetail.summary}
                    </div>
                )}
                
                <div 
                    className={cx('experience-content')} 
                    dangerouslySetInnerHTML={{ 
                        __html: experienceDetail.displayContent
                    }} 
                />
                
                <div className={cx('experience-metadata')}>
                    <div className={cx('experience-date')}>
                        <DateTime 
                            timestamp={experienceDetail.displayDate} 
                            showDate={true} 
                            showTime={true} 
                            showViews={false} 
                        />
                    </div>
                    
                    <div className={cx('back-link')}>
                        <Link to={routes.experiences}>Quay lại danh sách trải nghiệm</Link>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ExperienceDetail;
