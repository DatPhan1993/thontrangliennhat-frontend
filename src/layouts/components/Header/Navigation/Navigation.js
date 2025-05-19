import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Link, NavLink } from 'react-router-dom';
import { getNavigationLinks } from '~/services/navigationService';
import styles from './Navigation.module.scss';
import Search from '~/layouts/components/Search/Seach';
import PushNotification from '~/components/PushNotification/PushNotification';
import LoadingScreen from '~/components/LoadingScreen/LoadingScreen';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faTimes,
    faChevronRight,
    faChevronDown,
    // faHome,
    // faInfoCircle,
    // faBox,
    // faLayerGroup,
    // faProjectDiagram,
    // faNewspaper,
    // faUsers,
    // faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import images from '~/assets/images';

// const iconsData = [
//     { position: 1, icon: faInfoCircle },
//     { position: 2, icon: faBox },
//     { position: 3, icon: faLayerGroup },
//     { position: 4, icon: faProjectDiagram },
//     { position: 5, icon: faNewspaper },
//     { position: 6, icon: faUsers },
//     { position: 7, icon: faEnvelope },
// ];

const cx = classNames.bind(styles);

function Navigation({ isFixed }) {
    const [navigationLinks, setNavigationLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState({});
    const [openSubSubMenus, setOpenSubSubMenus] = useState({});

    useEffect(() => {
        const fetchNavigationLinks = async () => {
            try {
                const links = await getNavigationLinks();
                const sortedLinks = links.sort((a, b) => a.position - b.position);
                setNavigationLinks(sortedLinks);
            } catch (error) {
                setError(error);
                console.error('Error fetching navigation links:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNavigationLinks();
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = () => {
        if (isMenuOpen) {
            toggleMenu();
        }
    };

    const toggleSubMenu = (id, fromChild = false) => {
        if (!fromChild) {
            setOpenSubMenus((prevState) => ({
                ...prevState,
                [id]: !prevState[id],
            }));
        }
    };

    const toggleSubSubMenu = (parentId, childId) => {
        setOpenSubSubMenus((prevState) => ({
            ...prevState,
            [`${parentId}-${childId}`]: !prevState[`${parentId}-${childId}`],
        }));
    };

    const handleMouseEnter = (id) => {
        if (window.innerWidth >= 1280) {
            setOpenSubMenus((prevState) => ({
                ...prevState,
                [id]: true,
            }));
        }
    };

    const handleMouseLeave = (id) => {
        if (window.innerWidth >= 1280) {
            setOpenSubMenus((prevState) => ({
                ...prevState,
                [id]: false,
            }));
        }
    };

    const handleMouseEnterChild = (parentId, childId) => {
        if (window.innerWidth >= 1280) {
            setOpenSubSubMenus((prevState) => ({
                ...prevState,
                [`${parentId}-${childId}`]: true,
            }));
        }
    };

    const handleMouseLeaveChild = (parentId, childId) => {
        if (window.innerWidth >= 1280) {
            setOpenSubSubMenus((prevState) => ({
                ...prevState,
                [`${parentId}-${childId}`]: false,
            }));
        }
    };

    if (error) {
        const errorMessage = error.response ? error.response.data.message : 'Network Error';
        return <PushNotification message={errorMessage} />;
    }

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className={cx('wrapper', { fixed: isFixed })}>
            <div className={cx('inner')}>
                <div className={cx('nav-left-section')}>
                    <div className={cx('mobile-menu-icon')} onClick={toggleMenu}>
                        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
                    </div>
                    <Link to="/" className={cx('logo-link')}>
                        <img src={images.logo} alt="Logo" className={cx('logo')} />
                    </Link>
                    <div className={cx('company-name')}>
                        <Link to="/">THÔN TRANG LIÊN NHẬT</Link>
                    </div>
                </div>
                <div className={cx('main-nav')}>
                    <ul className={cx('navigation-links', { open: isMenuOpen })}>
                        {navigationLinks.map((link) => {
                            // const iconData = iconsData.find((icon) => icon.position === link.position);
                            const sortedChilds = link.children.sort((a, b) => a.position - b.position);
                            return (
                                <li
                                    key={link.id}
                                    className={cx({ 'has-children': link.children.length > 0 })}
                                    onMouseEnter={() => handleMouseEnter(link.id)} // Hover event
                                    onMouseLeave={() => handleMouseLeave(link.id)} // Leave event
                                    onClick={() => toggleSubMenu(link.id)} // Click event for mobile
                                >
                                    <div className={cx('menu-item')}>
                                        <NavLink
                                            end
                                            to={`/${link.slug}`}
                                            className={({ isActive }) => cx('nav-link', { 'active-link': isActive })}
                                            onClick={handleLinkClick}
                                        >
                                            {link.title}
                                        </NavLink>
                                        {link.children.length > 0 && (
                                            <FontAwesomeIcon
                                                icon={openSubMenus[link.id] ? faChevronDown : faChevronRight}
                                                className={cx('submenu-icon')}
                                            />
                                        )}
                                    </div>
                                    {sortedChilds.length > 0 && (
                                        <ul className={cx('dropdown', { open: openSubMenus[link.id] })}>
                                            {sortedChilds.map((childLink) => {
                                                const sortedSubChilds = (childLink.children || []).sort(
                                                    (a, b) => a.position - b.position,
                                                );
                                                return (
                                                    <li
                                                        key={childLink.id}
                                                        className={cx({
                                                            'has-sub-children': sortedSubChilds.length > 0,
                                                        })}
                                                        onMouseEnter={() => handleMouseEnterChild(link.id, childLink.id)}
                                                        onMouseLeave={() => handleMouseLeaveChild(link.id, childLink.id)}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSubSubMenu(link.id, childLink.id);
                                                        }}
                                                    >
                                                        <div className={cx('sub-link-wrapper')}>
                                                            <NavLink
                                                                to={`/${link.slug}/${childLink.slug}`}
                                                                className={({ isActive }) =>
                                                                    cx({ 'active-link': isActive })
                                                                }
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleLinkClick();
                                                                }}
                                                            >
                                                                {childLink.title}
                                                            </NavLink>
                                                            {sortedSubChilds.length > 0 && (
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        openSubSubMenus[`${link.id}-${childLink.id}`]
                                                                            ? faChevronDown
                                                                            : faChevronRight
                                                                    }
                                                                    className={cx('submenu-icon')}
                                                                />
                                                            )}
                                                        </div>
                                                        {sortedSubChilds.length > 0 && (
                                                            <ul
                                                                className={cx('dropdown-second-level', {
                                                                    open: openSubSubMenus[`${link.id}-${childLink.id}`],
                                                                })}
                                                            >
                                                                {sortedSubChilds.map((subChildLink) => {
                                                                    return (
                                                                        <li key={subChildLink.id}>
                                                                            <NavLink
                                                                                to={`/${link.slug}/${childLink.slug}/${subChildLink.slug}`}
                                                                                className={({ isActive }) =>
                                                                                    cx({ 'active-link': isActive })
                                                                                }
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation(); 
                                                                                    handleLinkClick();
                                                                                }}
                                                                            >
                                                                                {subChildLink.title}
                                                                            </NavLink>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <Search />
            </div>
        </div>
    );
}

export default Navigation;
