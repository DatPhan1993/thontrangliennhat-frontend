import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getProductsByCategory } from '~/services/productService';
import Title from '~/components/Title/Title';
import styles from './Products.module.scss';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import { getCategoriesBySlug } from '~/services/categoryService';
import routes from '~/config/routes';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Empty } from 'antd';
import Product from '~/components/Product/Product';
import { normalizeImageUrl } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

function ProductCategory() {
    const location = useLocation();
    const [product, setProduct] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [subcategoryId, setSubcategoryId] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const productPerPage = 6;

    const extractSlugFromPathname = (pathname) => {
        const parts = pathname.split('/');
        return parts.length > 2 ? parts[2] : null;
    };

    const slug = extractSlugFromPathname(location.pathname);

    useEffect(() => {
        async function fetchCategory() {
            try {
                const categories = await getCategoriesBySlug('san-pham');
                let category = categories.find((cat) => cat.slug === slug);

                if (!category) {
                    for (const cat of categories) {
                        const subcategory = cat.children.find((subcat) => subcat.slug === slug);
                        if (subcategory) {
                            setCategoryId(cat.id);
                            setSubcategoryId(subcategory.id);
                            setCategoryName(subcategory.title);
                            return;
                        }
                    }
                } else {
                    setCategoryId(category.id);
                    setSubcategoryId(null);
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
        async function fetchProductCategory() {
            try {
                let data = [];
                if (subcategoryId) {
                    data = await getProductsByCategory(subcategoryId);
                } else if (categoryId) {
                    data = await getProductsByCategory(categoryId);

                    if (!Array.isArray(data)) {
                        const categories = await getCategoriesBySlug('san-pham');
                        console.log(categories);
                        const parentCategory = categories.find((cat) => cat.id === categoryId);

                        if (parentCategory && parentCategory.children) {
                            const subcategoryProducts = await Promise.all(
                                parentCategory.children.map(async (subcat) => {
                                    const products = await getProductsByCategory(subcat.id);
                                    if (Array.isArray(products) && products.length > 0) {
                                        return products.filter((product) => product.id || product.name);
                                    } else {
                                        return null;
                                    }
                                }),
                            );

                            data = subcategoryProducts.filter(Boolean).flat();
                        }
                    }
                }
                setProduct(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        }

        if (categoryId || subcategoryId) {
            fetchProductCategory();
        }
    }, [categoryId, subcategoryId, slug]);

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    const indexOfLastProduct = currentPage * productPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productPerPage;
    const currentProductCategory = product.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = Math.ceil(product.length / productPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderProductCategory = () => {
        if (currentProductCategory.length === 0) {
            return (
                <>
                    <div />
                    <Empty className={cx('empty-element')} description="Đang cập nhật..." />
                    <div />
                </>
            );
        }

        return currentProductCategory.map((productItem) => {
            // Handle different image formats
            const productImage = normalizeImageUrl(
                Array.isArray(productItem.images) && productItem.images.length > 0 
                    ? productItem.images[0] 
                    : (typeof productItem.images === 'string' ? productItem.images : null)
            );
            
            console.log(`Processing product ${productItem.id} image: ${productImage}`);

            return (
            <Product
                key={productItem.id}
                    image={productImage}
                name={productItem.name}
                productId={productItem.id}
                category={slug}
                link={`${routes.products}/${slug}/${productItem.id}`}
            />
            );
        });
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
                <meta
                    name="keywords"
                    content="dịch vụ nông nghiệp du lịch, hợp tác xã, sản phẩm nông nghiệp, phunongbuondon"
                />
                <meta name="author" content="HTX Nông Nghiệp - Du Lịch Phú Nông Buôn" />
            </HelmetProvider>
            <Title text={categoryName} />
            <div className={cx('productGrid')}>{renderProductCategory()}</div>
            {renderPagination()}
        </div>
    );
}

export default ProductCategory;
