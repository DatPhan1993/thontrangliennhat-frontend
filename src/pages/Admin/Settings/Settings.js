import React, { useEffect, useState } from 'react';
import { getConfiguration, updateConfiguration, getConfigurationMobile } from '~/services/configurationService';
import { Spin } from 'antd';
import PushNotification from '~/components/PushNotification/PushNotification';
import styles from './Settings.module.scss';
import Title from '~/components/Title/Title';

const Settings = () => {
    const [settings, setSettings] = useState({
        id: '',
        name: '',
        homepage_slider: [],
        contact_email: '',
        phone_number: '',
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [configurationType, setConfigurationType] = useState('desktop');

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                let data;
                if (configurationType === 'desktop') {
                    data = await getConfiguration();
                } else {
                    data = await getConfigurationMobile();
                }

                if (data) {
                    // Đảm bảo homepage_slider luôn là một mảng
                    const sliders = Array.isArray(data.homepage_slider) 
                        ? data.homepage_slider 
                        : (data.homepage_slider ? [data.homepage_slider] : []);
                    
                    setSettings({
                        id: data.id || 1,
                        name: data.name || '',
                        contact_email: data.contact_email || '',
                        phone_number: data.phone_number || '',
                        homepage_slider: sliders.map((slide) => ({
                            image_url: slide,
                            file: null,
                        })),
                    });
                } else {
                    // Tạo dữ liệu mặc định thay vì hiển thị lỗi
                    setSettings({
                        id: 1,
                        name: 'HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật',
                        contact_email: 'admin@thontrangliennhat.com',
                        phone_number: '0969866687',
                        homepage_slider: [],
                    });
                }
            } catch (error) {
                console.error('Error fetching configuration:', error);
                // Tạo dữ liệu mặc định thay vì hiển thị lỗi
                setSettings({
                    id: 1,
                    name: 'HTX Sản Xuất Nông Nghiệp - Dịch Vụ Tổng Hợp Liên Nhật',
                    contact_email: 'admin@thontrangliennhat.com',
                    phone_number: '0969866687',
                    homepage_slider: [],
                });
            }
            setLoading(false);
        };

        fetchSettings();
    }, [configurationType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prevSettings) => ({
            ...prevSettings,
            [name]: value,
        }));
    };

    const handleSliderChange = (index, e) => {
        const file = e.target.files[0];
        const updatedSlider = [...settings.homepage_slider];

        if (file) {
            const previewUrl = URL.createObjectURL(file); // Tạo URL tạm thời cho file
            updatedSlider[index] = { image_url: previewUrl, file }; // Cập nhật image_url với URL tạm thời
        }

        setSettings((prevSettings) => ({
            ...prevSettings,
            homepage_slider: updatedSlider,
        }));
    };

    const handleAddSlide = () => {
        setSettings((prevSettings) => ({
            ...prevSettings,
            homepage_slider: [...prevSettings.homepage_slider, { image_url: '', file: null }],
        }));
    };

    const handleRemoveSlide = (index) => {
        const updatedSlider = settings.homepage_slider.filter((_, i) => i !== index);
        setSettings((prevSettings) => ({
            ...prevSettings,
            homepage_slider: updatedSlider,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();

            formData.append('name', settings.name);
            formData.append('contact_email', settings.contact_email);
            formData.append('phone_number', settings.phone_number);

            settings.homepage_slider.forEach((slide, index) => {
                if (slide.file) {
                    formData.append(`homepage_slider[${index}]`, slide.file);
                }
            });

            await updateConfiguration(formData, settings.id);
            setNotification({ message: 'Cài đặt đã được cập nhật thành công!', type: 'success' });
        } catch (error) {
            console.error('Error updating settings:', error);
            setNotification({ message: 'Đã xảy ra lỗi khi cập nhật cài đặt.', type: 'error' });
        }
        setSaving(false);
    };

    const handleConfigurationTypeChange = (e) => {
        setConfigurationType(e.target.value);
    };

    if (loading) return <div className={styles.loadingContainer}><Spin size="large" /></div>;

    return (
        <div className={styles.settingsContainer}>
            <Title className={styles.pageTitle} text="Cài đặt chung" />
            {notification.message && <PushNotification message={notification.message} type={notification.type} />}
            <form onSubmit={handleSubmit} className={styles.settingsForm} encType="multipart/form-data">
                <div className={styles.formGroup}>
                    <label htmlFor="configurationType">Chọn loại cấu hình</label>
                    <select
                        id="configurationType"
                        value={configurationType}
                        onChange={handleConfigurationTypeChange}
                        className={styles.formControl}
                    >
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="name">Tên công ty</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={settings.name}
                        onChange={handleChange}
                        className={styles.formControl}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label style={{ display: 'block', marginBottom: '12px' }}>Slider Trang chủ</label>
                    {settings.homepage_slider.map((slide, index) => (
                        <div key={index} className={styles.slideItem}>
                            <div className={styles.formGroup}>
                                <label htmlFor={`image_url-${index}`}>Chọn hình ảnh</label>
                                {slide.image_url && (
                                    <img src={slide.image_url} alt={`Slide ${index}`} className={styles.previewImage} />
                                )}
                                <input
                                    type="file"
                                    id={`image_url-${index}`}
                                    name="homepage_slider"
                                    accept="image/*"
                                    onChange={(e) => handleSliderChange(index, e)}
                                    className={styles.formControl}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => handleRemoveSlide(index)}
                                className={styles.removeButton}
                            >
                                Xóa slide
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddSlide} className={styles.addButton}>
                        Thêm slide
                    </button>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="contact_email">Email liên hệ</label>
                    <input
                        type="email"
                        id="contact_email"
                        name="contact_email"
                        value={settings.contact_email}
                        onChange={handleChange}
                        className={styles.formControl}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="phone_number">Số điện thoại</label>
                    <input
                        type="text"
                        id="phone_number"
                        name="phone_number"
                        value={settings.phone_number}
                        onChange={handleChange}
                        className={styles.formControl}
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={saving}
                    style={{
                        backgroundColor: saving ? 'transparent' : '#097829',
                        color: saving ? '#097829' : '#fff',
                        border: saving ? '1px solid #097829' : 'none',
                    }}
                >
                    {saving ? <Spin /> : 'Lưu thay đổi'}
                </button>
            </form>
        </div>
    );
};

export default Settings;
