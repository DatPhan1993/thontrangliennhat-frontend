import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { getProducts, deleteProduct } from '~/services/productService';
import styles from './ProductList.module.scss';
import Title from '~/components/Title/Title';
import routes from '~/config/routes';
import PushNotification from '~/components/PushNotification/PushNotification';
import { normalizeImageUrl, DEFAULT_SMALL_IMAGE } from '~/utils/imageUtils';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [notification, setNotification] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                if (data) {
                    setProducts(data);
                } else {
                    setNotification({ message: 'Có lỗi khi tải dữ liệu sản phẩm!', type: 'error' });
                }
            } catch (error) {
                setNotification({ message: 'Lỗi khi tải dữ liệu sản phẩm!.', type: 'error' });
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắn chắn sẽ muốn xóa sản phẩm này không?')) {
            try {
                await deleteProduct(id);
                setProducts(products.filter((prod) => prod.id !== id));
                setNotification({ message: 'Xóa sản phẩm thành công!', type: 'success' });
            } catch (error) {
                console.error('Error deleting product:', error);
                setNotification({ message: 'Xảy ra lỗi khi xóa sản phẩm.', type: 'error' });
            }
        }
    };

    const filteredProducts = products.filter((prod) => prod.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastProd = currentPage * itemsPerPage;
    const indexOfFirstProd = indexOfLastProd - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProd, indexOfLastProd);

    return (
        <div className={styles.productContainer}>
            <Title className={styles.pageTitle} text="Danh sách Sản phẩm" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <div className={styles.actionsContainer}>
                <input
                    type="text"
                    placeholder="Tìm kiếm Sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                <Link to={routes.addProduct} className={styles.addButton}>
                    <FontAwesomeIcon icon={faPlus} /> Thêm mới Sản phẩm
                </Link>
            </div>

            <div className={styles.productList}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Tóm tắt</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.length > 0 ? (
                            currentProducts.map((prod) => {
                                // Handle different image formats safely
                                let productImage = normalizeImageUrl(
                                    Array.isArray(prod.images) && prod.images.length > 0 
                                        ? prod.images[0] 
                                        : (typeof prod.images === 'string' ? prod.images : null),
                                    DEFAULT_SMALL_IMAGE
                                );
                                
                                console.log(`Processing image for product ${prod.id}: ${productImage}`);

                                return (
                                <tr key={prod.id}>
                                    <td className={styles.imageCell}>
                                        {productImage ? (
                                            <img 
                                                src={productImage} 
                                                alt={prod.name} 
                                                className={styles.productImage} 
                                                onError={(e) => {
                                                    console.error('Failed to load image:', productImage);
                                                    e.target.onerror = null; // Prevent infinite loop
                                                    e.target.src = DEFAULT_SMALL_IMAGE;
                                                }}
                                            />
                                        ) : (
                                            <div className={styles.imagePlaceholder}>
                                                <span>?</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>{prod.name}</td>
                                    <td>{prod.summary}</td>
                                    <td>{new Date(prod.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Link to={`/admin/edit-product/${prod.id}`} className={styles.editButton}>
                                            <FontAwesomeIcon icon={faEdit} /> Sửa
                                        </Link>
                                        <button onClick={() => handleDelete(prod.id)} className={styles.deleteButton}>
                                            <FontAwesomeIcon icon={faTrash} /> Xóa
                                        </button>
                                    </td>
                                </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5">Không có dữ liệu</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Items per page selection */}
            <div className={styles.itemsPerPageContainer}>
                <label htmlFor="itemsPerPage">Số mục mỗi trang:</label>
                <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className={styles.itemsPerPageSelect}
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <span>
                    Hiện {indexOfFirstProd + 1} đến {Math.min(indexOfLastProd, filteredProducts.length)} của{' '}
                    {filteredProducts.length}
                </span>
                <div className={styles.paginationControls}>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
