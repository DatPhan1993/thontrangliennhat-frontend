import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { getMessages, deleteMessage } from '~/services/contactService';
import styles from './MessageList.module.scss';
import Title from '~/components/Title/Title';
import PushNotification from '~/components/PushNotification/PushNotification';

const MessageList = () => {
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await getMessages();
                setMessages(data || []);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                setNotificationMessage('Tải tin nhắn thất bại. Vui lòng thử lại!');
                setIsError(true);
            }
        };

        fetchMessages();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này không?')) {
            try {
                await deleteMessage(id);
                setMessages(messages.filter((message) => message.id !== id));
                setNotificationMessage('Xóa tin nhắn thành công!');
                setIsError(false);
            } catch (error) {
                console.error('Error deleting message:', error);
                setNotificationMessage('Có lỗi khi xóa tin nhắn.');
                setIsError(true);
            }
        }
    };

    const filteredMessages = messages.filter((message) =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
    const indexOfLastMessage = currentPage * itemsPerPage;
    const indexOfFirstMessage = indexOfLastMessage - itemsPerPage;
    const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);

    return (
        <div className={styles.messageContainer}>
            <Title className={styles.pageTitle} text="Danh sách Tin nhắn" />
            {notificationMessage && (
                <PushNotification message={notificationMessage} type={isError ? 'error' : 'success'} />
            )}
            <div className={styles.actionsContainer}>
                <input
                    type="text"
                    placeholder="Tìm kiếm Tin nhắn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.messageList}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Chủ đề</th>
                            <th>Nội dung</th>
                            <th>Ngày gửi</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentMessages.length > 0 ? (
                            currentMessages.map((message) => (
                                <tr key={message.id}>
                                    <td>{message.name}</td>
                                    <td>{message.email}</td>
                                    <td>{message.phone}</td>
                                    <td>{message.title}</td>
                                    <td>{message.content}</td>
                                    <td>{message.created_at ? new Date(message.created_at).toLocaleString() : 'Invalid Date'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(message.id)}
                                            className={styles.deleteButton}
                                        >
                                            <FontAwesomeIcon icon={faTrash} /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">Không có dữ liệu</td>
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
                    Hiện {indexOfFirstMessage + 1} đến {Math.min(indexOfLastMessage, filteredMessages.length)} của{' '}
                    {filteredMessages.length}
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

export default MessageList;
