import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Product from '~/components/Product/Product';
import { getProducts } from '~/services/productService';
import { getCategoriesBySlug } from '~/services/categoryService';
import styles from './Products.module.scss';
import Title from '~/components/Title/Title';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import PushNotification from '~/components/PushNotification/PushNotification';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import routes from '~/config/routes';
import { normalizeImageUrl, DEFAULT_IMAGE } from '~/utils/imageUtils';
import config from '~/config';

const cx = classNames.bind(styles);

function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to properly process image URLs
    const processImageUrl = (imageUrl) => {
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
            console.log('[Home/Products] Invalid image URL, using default');
            return DEFAULT_IMAGE;
        }
        
        // First try using the normalizeImageUrl function
        const normalized = normalizeImageUrl(imageUrl);
        console.log(`[Home/Products] Normalized image URL: ${normalized}`);
        
        // Add timestamp to prevent caching issues
        const finalUrl = `${normalized}?t=${Date.now()}`;
        return finalUrl;
    };

    useEffect(() => {
        const fetchProductsAndCategories = async () => {
            try {
                const [categoriesData, productsData] = await Promise.all([
                    getCategoriesBySlug('san-pham'),
                    getProducts(),
                ]);

                // Process products before setting state
                const processedProducts = productsData.map(product => {
                    // Log each product for debugging
                    console.log(`[Home/Products] Processing product: ${product.id} - ${product.name}`, product);
                    
                    // Ensure images is always an array
                    let processedImages = [];
                    
                    if (!product.images) {
                        console.log(`[Home/Products] Product ${product.id} has no images, setting empty array`);
                    } else if (typeof product.images === 'string') {
                        console.log(`[Home/Products] Product ${product.id} has string image, converting to array:`, product.images);
                        if (product.images.trim() !== '') {
                            processedImages = [processImageUrl(product.images)];
                        }
                    } else if (Array.isArray(product.images)) {
                        // Filter out empty image entries and process each valid URL
                        processedImages = product.images
                            .filter(img => img && typeof img === 'string' && img.trim() !== '')
                            .map(img => processImageUrl(img));
                        
                        console.log(`[Home/Products] Product ${product.id} has ${processedImages.length} valid processed images:`, processedImages);
                    } else {
                        console.log(`[Home/Products] Product ${product.id} has invalid images format:`, typeof product.images);
                    }
                    
                    // Return product with processed images
                    return {
                        ...product,
                        images: processedImages,
                        // Also save a pre-processed imageUrl ready to use
                        displayImageUrl: processedImages.length > 0 ? processedImages[0] : DEFAULT_IMAGE
                    };
                });

                setCategories(categoriesData);
                setProducts(processedProducts);
                console.log(`[Home/Products] Set ${processedProducts.length} products in state with processed images`);
            } catch (err) {
                setError(err);
                console.error('Error fetching data:', err);
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

    const handleViewAllProducts = () => {
        console.log('Navigating to products page:', routes.products);
        navigate(routes.products);
    };

    if (error) {
        return <PushNotification message={error.message} />;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Title 
                    text="Sản phẩm" 
                    showSeeAll={true} 
                    slug={routes.products} 
                    onClick={handleViewAllProducts}
                />
                <div className={cx('product-slider-container')}>
                <Swiper
                    spaceBetween={10}
                    slidesPerView={3}
                    breakpoints={{
                        1280: { slidesPerView: 3 },
                        1024: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        0: { slidesPerView: 1 },
                    }}
                    loop={products.length >= 6}
                    modules={[Autoplay]}
                    autoplay={{
                        delay: 2000,
                        disableOnInteraction: false,
                    }}
                >
                    {products.map((product) => {
                        // Log the final image URL we're passing to the Product component
                        console.log(`[Home/Products] Rendering product ${product.id} with final image URL:`, product.displayImageUrl);
                        
                        const categorySlug = getCategorySlug(product.child_nav_id);
                        console.log(`Product ${product.id} has category slug: ${categorySlug}`);
                        
                        return (
                            <SwiperSlide key={product.id} className={cx('slide')}>
                                <Product
                                    // Pass the already processed image URL directly
                                    image={product.displayImageUrl}
                                    name={product.name}
                                    link={`${routes.products}/${categorySlug}/${product.id}`}
                                />
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
                </div>
            </div>
        </div>
    );
}

export default Products;
