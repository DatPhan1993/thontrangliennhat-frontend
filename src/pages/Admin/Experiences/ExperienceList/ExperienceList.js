import React, { useState, useEffect } from 'react';
import styles from './ExperienceList.module.scss';
import { Table, Button, Space, Popconfirm, message, Spin } from 'antd';
import { Link } from 'react-router-dom';
import routes from '~/config/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import Title from '~/components/Title/Title';
import { getExperiences, deleteExperience } from '~/services/experienceService';
import { getImageUrl } from '~/utils/imageUtils';

const ExperienceList = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExperiences();
    }, []);

    const fetchExperiences = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Pass forceRefresh=true to ensure we get the newest data
            const result = await getExperiences(true);
            
            if (Array.isArray(result) && result.length > 0) {
                // Process experiences to ensure they have necessary fields
                const processedExperiences = result.map(exp => ({
                    ...exp,
                    id: exp.id || Date.now(),
                    name: exp.name || exp.title || 'Trải nghiệm không có tên',
                    title: exp.title || exp.name || 'Trải nghiệm không có tên',
                    created_at: exp.createdAt || exp.created_at || new Date().toISOString(),
                    updated_at: exp.updatedAt || exp.updated_at || new Date().toISOString()
                }));
                
                setExperiences(processedExperiences);
                setError(null);
            } else if (Array.isArray(result) && result.length === 0) {
                // No experiences found
                setExperiences([]);
                setError("Chưa có trải nghiệm nào được thêm vào. Hãy thêm trải nghiệm mới.");
            } else {
                // Unexpected response format
                setExperiences([]);
                setError("Không thể tải dữ liệu trải nghiệm. Định dạng dữ liệu không hợp lệ.");
            }
        } catch (error) {
            console.error('Error fetching experiences:', error);
            setExperiences([]);
            setError("Không thể tải dữ liệu trải nghiệm. Vui lòng kiểm tra kết nối và thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteExperience(id);
            message.success('Xóa trải nghiệm thành công');
            fetchExperiences();
        } catch (error) {
            console.error('Error deleting experience:', error);
            message.error('Lỗi khi xóa trải nghiệm');
        }
    };

    // Helper function to format date safely
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            return 'N/A';
        }
    };

    const columns = [
        {
            title: 'Tên Trải Nghiệm',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => {
                // First try to get title or name, ensuring they are strings
                const title = record.title ? String(record.title) : '';
                const nameValue = record.name ? String(record.name) : '';
                
                // If we have both and they differ, prefer title
                if (title && nameValue && title !== nameValue) {
                    return title;
                }
                
                // Return whichever one is available, or a default message
                return title || nameValue || 'Không có tên';
            },
        },
        {
            title: 'Ảnh',
            dataIndex: 'images',
            key: 'images',
            render: (images, record) => {
                // Handle various image formats
                if (!images && !record.image) return 'Không có ảnh';
                
                let imageUrl;
                
                // Try different image properties
                if (Array.isArray(images)) {
                    // If images is an array, use the first image
                    imageUrl = images.length > 0 ? getImageUrl(images[0]) : '';
                } else if (typeof images === 'string') {
                    // If images is a string, use it directly
                    imageUrl = getImageUrl(images);
                } else if (record.image) {
                    // Fallback to record.image if it exists
                    imageUrl = getImageUrl(record.image);
                } else {
                    imageUrl = '';
                }
                
                return imageUrl ? 
                    <img 
                        src={imageUrl} 
                        alt="Experience" 
                        style={{ width: '80px', height: '50px', objectFit: 'cover' }} 
                        onError={(e) => {
                            console.log('Image error, falling back to placeholder');
                            e.target.src = '/images/placeholder-image.jpg';
                        }}
                    /> : 'Không có ảnh';
            },
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (created_at, record) => formatDate(created_at || record.createdAt),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/admin/update-experience/${record.id}`}>
                        <Button type="primary">
                            <FontAwesomeIcon icon={faEdit} /> Sửa
                        </Button>
                    </Link>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa trải nghiệm này không?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger>
                            <FontAwesomeIcon icon={faTrash} /> Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.experienceListContainer}>
            <div className={styles.header}>
                <Title text="Danh Sách Trải Nghiệm" />
                <div className={styles.headerButtons}>
                    <Button 
                        type="default"
                        icon={<FontAwesomeIcon icon={faSync} />}
                        onClick={fetchExperiences}
                        className={styles.refreshButton}
                    >
                        Làm mới
                    </Button>
                    <Link to={routes.addExperience}>
                        <Button type="primary" size="large">
                            <FontAwesomeIcon icon={faPlus} /> Thêm Mới
                        </Button>
                    </Link>
                </div>
            </div>
            
            {error && (
                <div className={styles.errorMessage}>
                    {error}
                    <Button 
                        type="link" 
                        onClick={fetchExperiences}
                        className={styles.retryButton}
                    >
                        Thử lại
                    </Button>
                </div>
            )}
            
            {loading ? (
                <div className={styles.spinner}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {experiences.length === 0 && !error ? (
                        <div className={styles.emptyState}>
                            <p>Chưa có trải nghiệm nào được thêm vào.</p>
                            <Link to={routes.addExperience}>
                                <Button type="primary">
                                    <FontAwesomeIcon icon={faPlus} /> Thêm Trải Nghiệm Mới
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table 
                            columns={columns} 
                            dataSource={experiences} 
                            rowKey="id" 
                            locale={{
                                emptyText: 'Không có dữ liệu'
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ExperienceList; 