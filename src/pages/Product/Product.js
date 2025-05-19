import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { getProducts } from '~/services/productService';
import styles from './Product.module.scss';
import Title from '~/components/Title/Title';
import PushNotification from '~/components/PushNotification/PushNotification';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import routes from '~/config/routes';
import { getCategoriesBySlug } from '~/services/categoryService';
import Product from '~/components/Product/Product';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { normalizeImageUrl, DEFAULT_IMAGE } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

const Products = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    useEffect(() => {
        const fetchProductsAndCategories = async () => {
            try {
                const [categoriesData, productsData] = await Promise.all([
                    getCategoriesBySlug('san-pham'),
                    getProducts(),
                ]);
                
                // Process products
                const processedProducts = productsData.map(product => {
                    console.log(`[Product] Processing product: ${product.id} - ${product.name}`);
                    
                    // Ensure image is properly formatted
                    let productImage;
                    if (Array.isArray(product.images) && product.images.length > 0) {
                        productImage = normalizeImageUrl(product.images[0]);
                    } else if (typeof product.images === 'string' && product.images.trim() !== '') {
                        productImage = normalizeImageUrl(product.images);
                    } else {
                        productImage = DEFAULT_IMAGE;
                    }
                    
                    return {
                        ...product,
                        displayImageUrl: productImage
                    };
                });
                
                setCategories(categoriesData);
                setAllProducts(processedProducts);
                console.log(`[Product] Loaded ${processedProducts.length} products`);
            } catch (error) {
                setError(error);
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsAndCategories();
    }, []);

    const getCategorySlug = (categoryId) => {
        if (!categoryId) return 'san-pham';
        
        // Convert to string for comparison if needed
        const categoryIdStr = String(categoryId);
        console.log(`Looking for category with ID: ${categoryIdStr}`, categories);
        
        // First, try to find a direct match
        const category = categories.find((cat) => String(cat.id) === categoryIdStr);
        
        // If found, return the slug
        if (category) {
            console.log(`Found category for product: ${category.slug}`);
            return category.slug;
        }
        
        // If not found directly, check each category's children
        for (const parentCategory of categories) {
            if (parentCategory.children && Array.isArray(parentCategory.children)) {
                const childCategory = parentCategory.children.find(
                    (child) => String(child.id) === categoryIdStr
                );
                
                if (childCategory) {
                    console.log(`Found child category for product: ${childCategory.slug}`);
                    return childCategory.slug;
                }
            }
        }
        
        // If no category is found, use the parent category slug 'san-pham'
        console.log(`No category found for ID: ${categoryIdStr}, using default 'san-pham'`);
        return 'san-pham';
    };

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <PushNotification message={errorMessage} />;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    // Pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(allProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <article className={cx('wrapper')}>
            <HelmetProvider>
                <title>Sản Phẩm | HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật</title>
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
            
            <div className={cx('products-section')}>
                <div className={cx('products-header')}>
                    <h2 className={cx('products-title')}>Tất cả sản phẩm</h2>
                </div>
                
                <div className={cx('products-grid')}>
                    {currentProducts.map((product) => {
                        const categorySlug = getCategorySlug(product.child_nav_id);
                        console.log(`Product ${product.id} (${product.name}) category slug: ${categorySlug}`);
                        
                        return (
                            <Product
                                key={product.id}
                                image={product.displayImageUrl}
                                name={product.name}
                                link={`${routes.products}/${categorySlug}/${product.id}`}
                            />
                        );
                    })}
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

export default Products;
