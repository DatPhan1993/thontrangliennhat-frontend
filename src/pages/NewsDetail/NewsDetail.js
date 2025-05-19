import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './NewsDetail.module.scss';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import PushNotification from '~/components/PushNotification/PushNotification';
import DateTime from '~/components/DateTime/DateTime';
import Title from '~/components/Title/Title';
import { getNewsById } from '~/services/newsService';
import { Helmet, HelmetProvider } from "react-helmet-async";

const cx = classNames.bind(styles);

const NewsDetail = () => {
    // Updated parameter handling to work with the new URL pattern /tin-tuc/tin-tuc-id/:id
    const { id } = useParams();
    const [newsDetail, setNewsDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNewsDetail = async (id) => {
        try {
            setLoading(true);
            const data = await getNewsById(id);
            // Chuyển đổi images thành mảng nếu nó là một chuỗi
            if (data && typeof data.images === 'string') {
                data.images = [data.images]; // Chuyển đổi thành mảng có một phần tử
            } else if (!data.images) {
                data.images = []; // Nếu không có images, tạo một mảng rỗng
            }
            setNewsDetail(data);
            console.log('News detail with processed images:', data);
            setError(null);
        } catch (error) {
            setError(error);
            console.error('Error fetching news detail:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchNewsDetail(id);
        } else {
            setError(new Error('Invalid news ID'));
        }
    }, [id]);

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <PushNotification message={errorMessage} />;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    return (
        <article className={cx('wrapper')}>
            <HelmetProvider>
                <title>{newsDetail.title} | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
                <meta name="description" content={newsDetail.summary} />
                <meta name="keywords" content="tin tức, phunongbuondon, chi tiết tin tức" />
                <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
            </HelmetProvider>
            <div className={cx('header')}>
                <Title text={newsDetail.title} className={cx('title')} />
            </div>
            <div className={cx('content')} dangerouslySetInnerHTML={{ __html: newsDetail.content }} />
            <DateTime
                timestamp={newsDetail.created_at}
                views={newsDetail.views}
                showDate={true}
                showTime={true}
                showViews={true}
            />
        </article>
    );
};

export default NewsDetail;
