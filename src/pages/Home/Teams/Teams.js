import React, { useState, useEffect } from 'react';
import styles from './Teams.module.scss';
import classNames from 'classnames/bind';
import Title from '~/components/Title/Title';
import PushNotification from '~/components/PushNotification/PushNotification';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import TeamModal from '~/components/TeamModal/TeamModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import { getMembers } from '~/services/teamService';
import { getImageUrl } from '~/utils/imageUtils';

const cx = classNames.bind(styles);

function Teams() {
    const [teamsArr, setTeams] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [slidesPerView, setSlidesPerView] = useState(4);

    useEffect(() => {
        const loadTeams = async () => {
            setLoading(true);
            try {
                // Always force refresh to get latest data
                console.log('Fetching fresh team data...');
                const members = await getMembers(true);
                members.sort((a, b) => b.name.localeCompare(a.name));
                setTeams(members);
                console.log('Team data refreshed successfully');
            } catch (error) {
                console.error('Error loading team data:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        loadTeams();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1280) {
                setSlidesPerView(4);
            } else if (window.innerWidth >= 1024) {
                setSlidesPerView(3);
            } else if (window.innerWidth >= 768) {
                setSlidesPerView(2);
            } else {
                setSlidesPerView(1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <PushNotification message={errorMessage} />;
    }

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    }

    const handleOpenDetail = (team) => {
        setSelectedTeam(team);
    };

    const handleCloseDetail = () => {
        setSelectedTeam(null);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Title text="Thành Viên Hợp Tác Xã" />
                <div className={cx('slide-wrapper')}>
                    <Swiper
                        spaceBetween={20}
                        slidesPerView={slidesPerView}
                        breakpoints={{
                            1280: { slidesPerView: 4 },
                            1024: { slidesPerView: 3 },
                            768: { slidesPerView: 2 },
                            0: { slidesPerView: 1 },
                        }}
                        loop={teamsArr.length >= (slidesPerView * 2)}
                        modules={[Autoplay]}
                        autoplay={{
                            delay: 2000,
                            disableOnInteraction: false,
                        }}
                    >
                        {teamsArr?.map((team, index) => (
                            <SwiperSlide key={index} className={cx('slide')} onClick={() => handleOpenDetail(team)}>
                                <div className={cx('team-card')}>
                                    <img 
                                        src={getImageUrl(team.image)} 
                                        alt={team.name} 
                                        className={cx('team-image')}
                                        onError={(e) => {
                                            console.error('Error loading team image:', team.image);
                                            e.target.src = '/placeholder-image.svg';
                                        }} 
                                    />
                                    <div className={cx('team-info')}>
                                        <h3 className={cx('team-name')}>{team.name}</h3>
                                        <p className={cx('team-position')}>{team.position}</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
            <TeamModal open={!!selectedTeam} onClose={handleCloseDetail} team={selectedTeam} />
        </div>
    );
}

export default Teams;