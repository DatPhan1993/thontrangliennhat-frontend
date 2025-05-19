import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getExperienceByCategory } from '~/services/experienceService';
import { getCategoriesBySlug } from '~/services/categoryService';
import Title from '~/components/Title/Title';
import styles from './ExperienceCategory.module.scss';
import { Link } from 'react-router-dom';
import CardExperience from '~/components/CardService/CardService';
import routes from '~/config/routes';
import { Helmet, HelmetProvider } from "react-helmet-async";
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import { Empty } from 'antd';
import { getImageUrl } from '~/utils/imageUtils';

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

function ExperienceCategory() {
    const location = useLocation();
    const [experience, setExperience] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const experiencePerPage = 12;

    const extractSlugFromPathname = (pathname) => {
        const parts = pathname.split('/');
        return parts.length > 2 ? parts[2] : null;
    };

    const slug = extractSlugFromPathname(location.pathname);

    useEffect(() => {
        async function fetchCategory() {
            try {
                const categories = await getCategoriesBySlug('trai-nghiem');
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
        async function fetchExperienceCategory() {
            if (categoryId) {
                setLoading(true);
                try {
                    const data = await getExperienceByCategory(categoryId);
                    // Process images in experience data
                    const processedData = data.map(item => ({
                        ...item,
                        processedImage: processImagePath(item.images)
                    }));
                    setExperience(processedData);
                } catch (error) {
                    console.error('Error fetching experience:', error);
                } finally {
                    setLoading(false);
                }
            }
        }

        fetchExperienceCategory();
    }, [categoryId]);

    const indexOfLastExperience = currentPage * experiencePerPage;
    const indexOfFirstExperience = indexOfLastExperience - experiencePerPage;
    const currentExperienceCategory = experience.slice(indexOfFirstExperience, indexOfLastExperience);

    const totalPages = Math.ceil(experience.length / experiencePerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderExperienceCategory = () => {
        if (currentExperienceCategory.length === 0) {
            return (
                <>
                    <div />
                    <Empty className={cx('empty-element')} description="Đang cập nhật..." />
                    <div />
                </>
            );
        }
        return currentExperienceCategory.map((experienceItem, index) => (
            <Link to={`${routes.experiences}/${slug}/${experienceItem.id}`} key={experienceItem.id}>
                <CardExperience
                    key={index}
                    title={experienceItem.name}
                    image={experienceItem.processedImage}
                    summary={experienceItem.summary}
                    createdAt={new Date(experienceItem.created_at).getTime()}
                />
            </Link>
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
                <meta name="keywords" content={`${categoryName}, dịch vụ du lịch, phunongbuondon`} />

                <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
            </HelmetProvider>
            {loading ? (
                <LoadingScreen isLoading={loading} />
            ) : (
                <>
                    <Title text={categoryName} />
                    <div className={cx('experienceGrid')}>{renderExperienceCategory()}</div>
                    {renderPagination()}
                </>
            )}
        </div>
    );
}

export default ExperienceCategory;
