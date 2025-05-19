import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet, HelmetProvider } from "react-helmet-async";
import Title from '~/components/Title';
import styles from './Introduction.module.scss';
import PushNotification from '~/components/PushNotification';
import LoadingScreen from '~/components/LoadingScreen';
import { getPageBySlug } from '~/services/pageService';

const cx = classNames.bind(styles);

const Introduction = () => {
    const { slug } = useParams();
    console.log(slug);
    const [pageContent, setPageContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPageContent = async () => {
            try {
                if (slug) {
                    const data = await getPageBySlug(slug);
                    setPageContent(data);
                } else {
                    setError(new Error('No slug provided'));
                }
            } catch (error) {
                setError(error);
                console.error('Error fetching page content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageContent();
    }, [slug]);

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <PushNotification message={errorMessage} />;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    if (!pageContent) {
        return <PushNotification message="No content available" />;
    }

    return (
        <article className={cx('wrapper')}>
            <HelmetProvider>
                <title>{pageContent.name} | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
                <meta
                    name="description"
                    content={
                        pageContent.description ||
                        'HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật hoạt động đa ngành nghề, trong đó tiêu biểu có thể kể đến là nuôi cá lồng, cải tạo nâng cấp vườn cây quanh các hồ thủy điện, phát triển về du lịch sinh thái, du lịch nông nghiệp. Ngoài ra còn thực hiện sản xuất các loại thực phẩm như chả cá, trái cây thực phẩm sấy khô và sấy dẻo, các loại tinh dầu tự nhiên,…'
                    }
                />
                <meta name="keywords" content="giới thiệu, phunongbuondon, thông tin hợp tác xã" />
                <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
            </HelmetProvider>
            <div className={cx('inner')}>
                <Title text={pageContent.name} />
                <div className={cx('content')} dangerouslySetInnerHTML={{ __html: pageContent.content }} />
            </div>
        </article>
    );
};

export default Introduction;
