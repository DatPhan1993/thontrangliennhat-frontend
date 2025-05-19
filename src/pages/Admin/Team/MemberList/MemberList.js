import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faAngleRight, faAngleLeft, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { getMembers, deleteMember } from '~/services/teamService';
import { getImageUrl } from '~/utils/imageUtils';
import styles from './MemberList.module.scss';
import Title from '~/components/Title/Title';
import routes from '~/config/routes';
import PushNotification from '~/components/PushNotification/PushNotification';

const MemberList = () => {
    const location = useLocation();
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);

    const fetchMembers = async (showNotification = false) => {
        setLoading(true);
        try {
            // Always force refresh to get the latest data
            console.log('Fetching fresh member data...');
            const allMembers = await getMembers(true);
            
            if (allMembers && allMembers.length > 0) {
                setMembers(allMembers);
                if (showNotification) {
                    setNotification({ message: 'Dữ liệu đội ngũ đã được cập nhật.', type: 'success' });
                }
            } else {
                setMembers([]);
                setNotification({ message: 'Không có dữ liệu đội ngũ.', type: 'info' });
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            setNotification({ message: 'Lỗi khi tải dữ liệu đội ngũ.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check for refresh parameter in URL
        const urlParams = new URLSearchParams(location.search);
        const shouldRefresh = urlParams.get('refresh') === 'true';
        
        if (shouldRefresh) {
            // Show a notification when refreshing from navigation
            fetchMembers(true);
        } else {
            fetchMembers(false);
        }
    }, [location.search]);

    const handleRefresh = () => {
        fetchMembers(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này không?')) {
            try {
                await deleteMember(id);
                
                // Refresh the data after deletion
                await fetchMembers();
                
                setNotification({ message: 'Xóa thành viên thành công!', type: 'success' });
            } catch (error) {
                console.error('Error deleting member:', error);
                setNotification({ message: 'Có lỗi xảy ra khi xóa thành viên.', type: 'error' });
            }
        }
    };

    const filteredMembers = members.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const indexOfLastMember = currentPage * itemsPerPage;
    const indexOfFirstMember = indexOfLastMember - itemsPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);

    return (
        <div className={styles.memberContainer}>
            <Title className={styles.pageTitle} text="Danh sách Đội ngũ" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <div className={styles.actionsContainer}>
                <div className={styles.leftActions}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm Đội ngũ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <button 
                        className={styles.refreshButton} 
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faSyncAlt} spin={loading} /> Làm mới
                    </button>
                </div>
                <Link to={routes.addMember} className={styles.addButton}>
                    <FontAwesomeIcon icon={faPlus} /> Thêm mới Đội ngũ
                </Link>
            </div>

            <div className={styles.memberList}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên</th>
                            <th>Vị trí</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentMembers.length > 0 ? (
                            currentMembers.map((member) => (
                                <tr key={member.id}>
                                    <td>
                                        <img 
                                            src={getImageUrl(member.image)} 
                                            alt={member.name} 
                                            className={styles.memberImage} 
                                            onError={(e) => {
                                                console.error('Image loading error:', member.image);
                                                e.target.src = '/placeholder-image.svg';
                                            }}
                                        />
                                    </td>
                                    <td>{member.name}</td>
                                    <td>{member.position}</td>
                                    <td>
                                        <Link to={`/admin/update-member/${member.id}`} className={styles.editButton}>
                                            <FontAwesomeIcon icon={faEdit} /> Sửa
                                        </Link>
                                        <button onClick={() => handleDelete(member.id)} className={styles.deleteButton}>
                                            <FontAwesomeIcon icon={faTrash} /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">Không có dữ liệu</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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

            <div className={styles.pagination}>
                <span>
                    Hiện {indexOfFirstMember + 1} đến {Math.min(indexOfLastMember, filteredMembers.length)} của{' '}
                    {filteredMembers.length}
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

export default MemberList;
