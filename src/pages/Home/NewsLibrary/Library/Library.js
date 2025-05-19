import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { getImages, getVideos } from '~/services/libraryService';
import Title from '~/components/Title/Title';
import Modal from './ModalLibrary/ModalLibrary';
import Slider from 'react-slick';
import styles from './Library.module.scss';
import ButtonGroup from '~/components/ButtonGroup/ButtonGroup';
// import { motion } from 'framer-motion';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';

const cx = classNames.bind(styles);

function Library() {
    const [videos, setVideos] = useState([]);
    const [images, setImages] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [activeVideoUrl, setActiveVideoUrl] = useState('');
    const [activeVideoType, setActiveVideoType] = useState('youtube');
    const [activeImage, setActiveImage] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getVideoType = (url) => {
        if (!url) return 'unknown';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return 'youtube';
        } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
            return 'facebook';
        } else if (url.includes('vimeo.com')) {
            return 'vimeo';
        }
        
        return 'unknown';
    };

    const extractVideoId = (url) => {
        try {
            if (!url) return null;
            
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                // YouTube URL
                if (url.includes('watch?v=')) {
                    const urlObj = new URL(url);
                    return urlObj.searchParams.get('v');
                } else if (url.includes('youtu.be/')) {
                    const parts = url.split('youtu.be/');
                    return parts[1].split('?')[0].split('/')[0];
                }
            }
            // Return null for non-YouTube URLs
            return null;
        } catch (error) {
            console.error('Error extracting video ID:', error);
            return null;
        }
    };

    useEffect(() => {
        const loadLibrary = async () => {
            try {
                // Force refresh data by clearing the cache
                sessionStorage.removeItem('allVideos');
                sessionStorage.removeItem('allImages');
                sessionStorage.removeItem('videosPagination_page_1_limit_10');
                
                let videoData = [], imageData = [];
                
                console.log('Library: Fetching videos and images...');
                
                try {
                    [videoData, imageData] = await Promise.all([getVideos(), getImages()]);
                    console.log('Library: Fetched videos:', videoData);
                    console.log('Library: Fetched images:', imageData);
                } catch (fetchError) {
                    console.error('Error fetching library data:', fetchError);
                    // Use empty arrays if there's an error
                    videoData = [];
                    imageData = [];
                }
                
                // Make sure videoData is a valid array
                if (!videoData || !Array.isArray(videoData)) {
                    console.warn('Video data is not a valid array, using empty array instead');
                    videoData = [];
                }
                
                // Make sure imageData is a valid array
                if (!imageData || !Array.isArray(imageData)) {
                    console.warn('Image data is not a valid array, using empty array instead');
                    imageData = [];
                }
                
                // Filter out images with invalid URLs
                const validImages = imageData.filter(img => img && img.url && typeof img.url === 'string');
                if (validImages.length !== imageData.length) {
                    console.warn(`Filtered out ${imageData.length - validImages.length} invalid images`);
                }
                
                // Process video data
                const updatedVideos = videoData.map((item) => ({
                    ...item,
                    videoId: extractVideoId(item.url || ''),
                    videoType: getVideoType(item.url || '')
                }));
                
                setVideos(updatedVideos);
                
                if (updatedVideos.length > 0) {
                    const firstVideo = updatedVideos[0];
                    setActiveVideo(firstVideo.videoId);
                    setActiveVideoUrl(firstVideo.url || '');
                    setActiveVideoType(firstVideo.videoType);
                }
                
                // Save to sessionStorage for other pages to use
                sessionStorage.setItem('allVideos', JSON.stringify(videoData));
                
                // Process image data
                setImages(validImages);
                
                if (validImages.length > 0) {
                    setActiveImage(validImages[0].url);
                }
                
                // Save to sessionStorage
                sessionStorage.setItem('allImages', JSON.stringify(validImages));
                
            } catch (error) {
                console.error('Failed to load library data', error);
                // Set empty arrays in case of error
                setVideos([]);
                setImages([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadLibrary();
    }, []);

    const getThumbnailUrl = (videoId, videoType, videoUrl) => {
        if (videoType === 'youtube' && videoId) {
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        } else if (videoType === 'facebook') {
            return '/images/facebook-video-thumbnail.jpg';
        } else if (videoType === 'vimeo') {
            return '/images/vimeo-thumbnail.jpg';
        }
        
        // Use local placeholder instead of external service that may cause timeout
        return '/placeholder-image.svg';
    };

    const handleVideoClick = (videoId, videoUrl, videoType) => {
        setActiveVideo(videoId);
        setActiveVideoUrl(videoUrl);
        setActiveVideoType(videoType);
    };

    const handleImageClick = (imageSrc) => {
        setActiveImage(imageSrc);
    };

    const renderVideoEmbed = () => {
        if (activeVideoType === 'youtube' && activeVideo) {
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${activeVideo}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Video"
                />
            );
        } else if (activeVideoType === 'facebook') {
            return (
                <iframe
                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(activeVideoUrl)}&show_text=false`}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title="Facebook Video"
                />
            );
        } else {
            // Fallback for other video types or unknown types
            return (
                <div className={cx('video-fallback')}>
                    <a href={activeVideoUrl} target="_blank" rel="noopener noreferrer">
                        Mở video trong tab mới
                    </a>
                </div>
            );
        }
    };

    const videoSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1500,
        cssEase: 'ease-in-out',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    const imageSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1500,
        cssEase: 'ease-in-out',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    return (
        <div className={cx('wrapper')}>
            {isLoading ? (
                <LoadingScreen isLoading={isLoading} />
            ) : (
                <div className={cx('inner')}>
                    <Title text="Thư viện" />
                    <div className={cx('library-wrapper')}>
                        <div className={cx('library-videos')}>
                            <ButtonGroup buttons={['Video']} isStatic={true} />
                            <div className={cx('library')}>
                                {(activeVideo || activeVideoUrl) && (
                                    <div className={cx('main-video')}>
                                        {renderVideoEmbed()}
                                    </div>
                                )}
                                {videos.length > 0 ? (
                                    <Slider {...videoSettings}>
                                        {videos.map((item, index) => (
                                            <div
                                                key={index}
                                                className={cx('thumbnail')}
                                                onClick={() => handleVideoClick(item.videoId, item.url, item.videoType)}
                                            >
                                                <img
                                                    src={getThumbnailUrl(item.videoId, item.videoType, item.url)}
                                                    alt={item.name || 'Video Thumbnail'}
                                                    className={cx('thumbnail-image')}
                                                />
                                                <div className={cx('thumbnail-overlay')}>
                                                    <span className={cx('thumbnail-title')}>{item.name || 'Video'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </Slider>
                                ) : (
                                    <div className={cx('no-data')}>Không có video nào</div>
                                )}
                            </div>
                        </div>

                        <div className={cx('library-images')}>
                            <ButtonGroup buttons={['Hình ảnh']} isStatic={true} />
                            <div className={cx('library')}>
                                {activeImage && (
                                    <div className={cx('main-image')}>
                                        <img
                                            src={activeImage}
                                            alt="Main"
                                            className={cx('main-image-content')}
                                            onClick={() => {
                                                setModalOpen(true);
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/images/default-image.jpg";
                                            }}
                                        />
                                    </div>
                                )}
                                {images.length > 0 ? (
                                    <Slider {...imageSettings}>
                                        {images.map((image, index) => (
                                            <div
                                                key={index}
                                                className={cx('thumbnail')}
                                                onClick={() => handleImageClick(image.url)}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={image.name || `Thumbnail ${index + 1}`}
                                                    className={cx('thumbnail-image')}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/images/default-image.jpg";
                                                    }}
                                                />
                                                <div className={cx('thumbnail-overlay')}>
                                                    <span className={cx('thumbnail-title')}>{image.name || 'Hình ảnh'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </Slider>
                                ) : (
                                    <div className={cx('no-data')}>Không có hình ảnh nào</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <img 
                    src={activeImage} 
                    alt="Modal" 
                    className={cx('modal-image')} 
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/default-image.jpg";
                    }}
                />
            </Modal>
        </div>
    );
}

export default Library;
