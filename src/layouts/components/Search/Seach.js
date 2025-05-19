import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Modal, Input } from 'antd';
import styles from './Search.module.scss';
import { searchItems } from '~/services/searchService';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Search() {
    const [query, setQuery] = useState('');
    const [, setResults] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (query.trim()) {
            try {
                const searchResults = await searchItems(query);
                setResults(searchResults);
                navigate(`/search?q=${query.trim()}`);
                setIsModalVisible(false);
            } catch (error) {
                console.error('Error fetching search results:', error);
                navigate(`/search?q=${query.trim()}`);
                setIsModalVisible(false);
            }
        }
    };

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div className={cx('wrapper')}>
            <FontAwesomeIcon className={cx('icon')} icon={faSearch} onClick={showModal} />

            <Modal
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
                className={cx('search-modal')}
            >
                <div className={cx('search-container')}>
                    <FontAwesomeIcon className={cx('icon-input')} icon={faSearch} onClick={handleSearch} />
                    <Input
                        type="text"
                        className={cx('search-input')}
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Tìm kiếm..."
                        autoFocus
                    />
                </div>
            </Modal>
        </div>
    );
}

export default Search;
