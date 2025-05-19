import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { getServices, deleteService } from '~/services/serviceService';
import styles from './ServiceList.module.scss';
import Title from '~/components/Title/Title';
import routes from '~/config/routes';
import PushNotification from '~/components/PushNotification/PushNotification';
import { normalizeImageUrl, DEFAULT_SMALL_IMAGE } from '~/utils/imageUtils';

const ServiceList = () => {
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [notification, setNotification] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await getServices();
                if (data) {
                    setServices(data);
                } else {
                    setNotification({ message: 'Lỗi khi tải dữ liệu dịch vụ!', type: 'error' });
                }
            } catch (error) {
                setNotification({ message: 'Lỗi khi tải dữ liệu dịch vụ!', type: 'error' });
                console.error('Error fetching services:', error);
            }
        };

        fetchServices();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
            try {
                await deleteService(id);
                setServices(services.filter((service) => service.id !== id));
                setNotification({ message: 'Dịch vụ đã được xóa thành công!', type: 'success' });
            } catch (error) {
                console.error('Error deleting service:', error);
                setNotification({ message: 'Đã xảy ra lỗi khi xóa dịch vụ!', type: 'error' });
            }
        }
    };

    const filteredServices = services.filter(
        (service) => service.name && service.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const indexOfLastService = currentPage * itemsPerPage;
    const indexOfFirstService = indexOfLastService - itemsPerPage;
    const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

    return (
        <div className={styles.serviceContainer}>
            <Title className={styles.pageTitle} text="Danh sách Dịch vụ" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}{' '}
            <div className={styles.actionsContainer}>
                <input
                    type="text"
                    placeholder="Tìm kiếm Dịch vụ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                <Link to={routes.addService} className={styles.addButton}>
                    <FontAwesomeIcon icon={faPlus} /> Thêm mới Dịch vụ
                </Link>
            </div>
            <div className={styles.serviceList}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên dịch vụ</th>
                            <th>Tóm tắt</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentServices.length > 0 ? (
                            currentServices.map((service) => {
                                // Handle different image formats safely
                                let serviceImage = normalizeImageUrl(
                                    Array.isArray(service.images) && service.images.length > 0 
                                        ? service.images[0] 
                                        : (typeof service.images === 'string' ? service.images : 
                                           (service.image || null)),
                                    DEFAULT_SMALL_IMAGE
                                );
                                
                                console.log(`Processing image for service ${service.id}: ${serviceImage}`);

                                return (
                                    <tr key={service.id}>
                                        <td>
                                            {serviceImage ? (
                                                <img 
                                                    src={serviceImage} 
                                                    alt={service.name} 
                                                    className={styles.serviceImage} 
                                                    onError={(e) => {
                                                        console.error('Failed to load image:', serviceImage);
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
                                        <td>{service.name}</td>
                                        <td>{service.summary}</td>
                                        <td>
                                            <Link 
                                                to={`/admin/update-service/${service.id}`} 
                                                className={styles.editButton}
                                                title={`Sửa dịch vụ ID: ${service.id}`}
                                            >
                                                <FontAwesomeIcon icon={faEdit} /> Sửa
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className={styles.deleteButton}
                                                title={`Xóa dịch vụ ID: ${service.id}`}
                                            >
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
                    Hiện {indexOfFirstService + 1} đến {Math.min(indexOfLastService, filteredServices.length)} của{' '}
                    {filteredServices.length}
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

export default ServiceList;
