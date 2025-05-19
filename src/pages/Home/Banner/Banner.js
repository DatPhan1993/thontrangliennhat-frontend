import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import styles from './Banner.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Nhập các ảnh từ assets 
import sliderImages from '~/assets/images/slider';

const cx = classNames.bind(styles);

const Banner = () => {
    // Mảng chứa các ảnh slider
    const slides = [
        { image: sliderImages.image1 },
        { image: sliderImages.image2 },
        { image: sliderImages.image3 },
        { image: sliderImages.image4 },
        { image: sliderImages.image5 },
        { image: sliderImages.image6 },
        { image: sliderImages.image7 },
        { image: sliderImages.image8 },
    ];

    // Ensure we have enough slides for loop mode
    const useLoopMode = slides.length >= 2;

    return (
        <div className={cx('banner')}>
            <div className={cx('container')}>
                <div className={cx('inner')}>
                    <Swiper
                        spaceBetween={0}
                        slidesPerView={1}
                        loop={useLoopMode}
                        modules={[Autoplay, Navigation, EffectFade]}
                        effect="fade"
                        fadeEffect={{ crossFade: true }}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        speed={1500}
                        navigation={{
                            nextEl: `.${cx('swiper-button-next')}`,
                            prevEl: `.${cx('swiper-button-prev')}`,
                        }}
                        observer={true}
                        observeParents={true}
                        className={cx('swiper')}
                        onResize={(swiper) => {
                            // Đảm bảo tỷ lệ khung hình đúng sau khi resize
                            swiper.update();
                        }}
                    >
                        {slides.map((slide, index) => (
                            <SwiperSlide key={index} className={cx('slide')}>
                                <div className={cx('image-card')}>
                                    <img 
                                        src={slide.image} 
                                        alt={`slider-${index + 1}`} 
                                        className={cx('image')} 
                                        width="1200" 
                                        height="450"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                        {useLoopMode && (
                            <>
                                <div className={cx('swiper-button-prev')}>
                                    <FontAwesomeIcon icon={faChevronLeft} className={cx('swiper-icon')} />
                                </div>
                                <div className={cx('swiper-button-next')}>
                                    <FontAwesomeIcon icon={faChevronRight} className={cx('swiper-icon')} />
                                </div>
                            </>
                        )}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default Banner;
