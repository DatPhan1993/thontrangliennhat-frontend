import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ServiceDetail.module.scss';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import PushNotification from '~/components/PushNotification/PushNotification';
import DateTime from '~/components/DateTime/DateTime';
import Title from '~/components/Title/Title';
import { getServiceById } from '~/services/serviceService';
import { Helmet, HelmetProvider } from "react-helmet-async";
import routes from '~/config/routes';
import { getImageUrl } from '~/utils/imageUtils';
import config from '~/config';

const cx = classNames.bind(styles);

const ServiceDetail = () => {
    const { id, category } = useParams();
    const [serviceDetail, setServiceDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServiceDetail = async () => {
            try {
                if (!id) {
                    throw new Error('Service ID is required');
                }
                
                console.log('Fetching service with ID:', id, 'Category:', category);
                
                // Try to get service from API first
                try {
                    const data = await getServiceById(id);
                    if (data) {
                        // Process the service data if found
                        processServiceData(data);
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
                    handleServiceData(database);
                    return;
                }
                
                const database = await response.json();
                handleServiceData(database);
                
            } catch (error) {
                console.error('Error fetching service detail:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        
        const handleServiceData = (database) => {
            // Find the service with matching ID in the services array
            const serviceData = database.services.find(service => service.id === parseInt(id));
            
            if (!serviceData) {
                throw new Error('Service not found in database');
            }
            
            console.log('Service data found in database:', serviceData);
            
            // Process the service data
            processServiceData(serviceData);
        };

        const processServiceData = (data) => {
            // Format image path
            if (data.images) {
                if (typeof data.images === 'string') {
                    // If images is a string, check if it's a relative or full URL
                    if (data.images.startsWith('http://') || data.images.startsWith('https://')) {
                        data.formattedImage = data.images;
                    } else {
                        // Use image path from database as-is, but prepend with public URL if needed
                        data.formattedImage = data.images.startsWith('/') 
                            ? `${window.location.origin}${data.images}`
                            : `${window.location.origin}/${data.images}`;
                    }
                } else if (Array.isArray(data.images) && data.images.length > 0) {
                    // If images is an array, use the first image
                    const firstImage = data.images[0];
                    data.formattedImage = firstImage.startsWith('http://') || firstImage.startsWith('https://')
                        ? firstImage
                        : `${window.location.origin}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
                } else {
                    // Default image if no valid images exist
                    data.formattedImage = 'https://res.cloudinary.com/ddmzboxzu/image/upload/v1724202469/cer_3_ldetgd.png';
                }
            } else {
                // Default image if no images exist
                data.formattedImage = 'https://res.cloudinary.com/ddmzboxzu/image/upload/v1724202469/cer_3_ldetgd.png';
            }
            
            // Ensure proper content field is available
            data.displayContent = data.description || data.content || '<p>Không có nội dung chi tiết</p>';
            
            // Ensure price is a number
            data.price = parseFloat(data.price || 0);
            data.discountPrice = parseFloat(data.discountPrice || 0);
            
            // Format date for display
            data.displayDate = data.createdAt || data.created_at || new Date().toISOString();
            
            setServiceDetail(data);
            console.log('Processed service data:', data);
        };

        fetchServiceDetail();
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
                <div className={cx('service-header')}>
                    <h1 className={cx('service-title')}>Chi tiết dịch vụ</h1>
                </div>
                
                <div className={cx('service-container')}>
                    <div className={cx('error-container')}>
                        <h2>Có lỗi xảy ra</h2>
                        <p>Không tìm thấy thông tin dịch vụ bạn yêu cầu. ID: {id}</p>
                        <p className={cx('error-detail')}>{errorMessage}</p>
                        <button className={cx('back-button')} onClick={() => navigate(routes.services)}>
                            Quay lại danh sách dịch vụ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Handle case when no service detail is found
    if (!serviceDetail) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('service-header')}>
                    <h1 className={cx('service-title')}>Chi tiết dịch vụ</h1>
                </div>
                
                <div className={cx('service-container')}>
                    <div className={cx('error-container')}>
                        <h2>Không tìm thấy dịch vụ</h2>
                        <p>Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. ID: {id}</p>
                        <button className={cx('back-button')} onClick={() => navigate(routes.services)}>
                            Quay lại danh sách dịch vụ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <article className={cx('wrapper')}>
            <HelmetProvider>
                <title>{`${serviceDetail.name || 'Chi tiết dịch vụ'} | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật`}</title>
                <meta name="description" content={serviceDetail.summary} />
                <meta name="keywords" content={`dịch vụ du lịch, ${serviceDetail.name}, phunongbuondon`} />
                <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
            </HelmetProvider>
            
            <div className={cx('service-header')}>
                <h1 className={cx('service-title')}>{serviceDetail.name}</h1>
            </div>
            
            <div className={cx('service-container')}>
                <div className={cx('service-image')}>
                    <img src={serviceDetail.formattedImage} alt={serviceDetail.name} />
                </div>
                
                {serviceDetail.summary && (
                    <div className={cx('service-summary')}>
                        {serviceDetail.summary}
                    </div>
                )}
                
                <div 
                    className={cx('service-content')} 
                    dangerouslySetInnerHTML={{ 
                        __html: serviceDetail.displayContent
                    }} 
                />
                
                {serviceDetail.price > 0 && (
                    <div className={cx('service-price')}>
                        <p>
                            Giá: <span>{serviceDetail.price.toLocaleString()} VNĐ</span>
                            {serviceDetail.discountPrice > 0 && (
                                <span className={cx('original-price')}>
                                    {serviceDetail.discountPrice.toLocaleString()} VNĐ
                                </span>
                            )}
                        </p>
                    </div>
                )}
                
                <div className={cx('service-metadata')}>
                    <div className={cx('service-date')}>
                        <DateTime 
                            timestamp={serviceDetail.displayDate} 
                            showDate={true} 
                            showTime={true} 
                            showViews={false} 
                        />
                    </div>
                    
                    <div className={cx('back-link')}>
                        <Link to={routes.services}>Quay lại danh sách dịch vụ</Link>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ServiceDetail;
