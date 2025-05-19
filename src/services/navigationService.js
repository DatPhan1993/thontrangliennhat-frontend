import httpRequest from '~/utils/httpRequest';

// Helper functions for sessionStorage
const saveToSessionStorage = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data));
};

const getFromSessionStorage = (key) => {
    const storedData = sessionStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
};

// Navigation Links
export const getNavigationLinks = async () => {
    const sessionKey = 'navigationLinks';

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get('/parent-navs/all-with-child');
        const navigationLinks = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, navigationLinks);

        return navigationLinks;
    } catch (error) {
        console.error('Error fetching navigation links:', error);
        throw error;
    }
};

// Navigation Links
export const getMainNavigation = async () => {
    const sessionKey = 'MainNavigation';

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get('/parent-navs');
        const navigationLinks = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, navigationLinks);

        return navigationLinks;
    } catch (error) {
        console.error('Error fetching navigation links:', error);
        throw error;
    }
};

// Navigation Links
export const getSubNavigation = async () => {
    const sessionKey = 'SubNavigation';

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get('/child-navs');
        const navigationLinks = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, navigationLinks);

        return navigationLinks;
    } catch (error) {
        console.error('Error fetching navigation links:', error);
        throw error;
    }
};

// Navigation Links
export const getChildNavigation = async () => {
    const sessionKey = 'ChildNavigation';

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get('/child-navs-two');
        const navigationLinks = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, navigationLinks);

        return navigationLinks;
    } catch (error) {
        console.error('Error fetching navigation links:', error);
        throw error;
    }
};

export const getNavigationById = async (id) => {
    const sessionKey = `child_nav_${id}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/child-navs/${id}`);
        const navigationLink = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, navigationLink);

        return navigationLink;
    } catch (error) {
        console.error('Error fetching navigation link:', error);
        throw error;
    }
};

export const getMainNavigationById = async (id) => {
    const sessionKey = `parent_nav_${id}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/parent-navs/${id}`);
        const navigationLink = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, navigationLink);

        return navigationLink;
    } catch (error) {
        console.error('Error fetching navigation link:', error);
        throw error;
    }
};

export const getSubNavigationById = async (id) => {
    const sessionKey = `child_nav_${id}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/child-navs/${id}`);
        const navigationLink = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, navigationLink);

        return navigationLink;
    } catch (error) {
        console.error('Error fetching navigation link:', error);
        throw error;
    }
};

export const getChildNavigationById = async (id) => {
    const sessionKey = `child_nav_two_${id}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/child-navs-two/${id}`);
        const navigationLink = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, navigationLink);

        return navigationLink;
    } catch (error) {
        console.error('Error fetching navigation link:', error);
        throw error;
    }
};

export const createMainNavigationLink = async (data) => {
    try {
        const response = await httpRequest.post('/parent-navs', data);

        sessionStorage.removeItem('navigationLinks');
        const updatedNavigationLinks = await getNavigationLinks();
        saveToSessionStorage('navigationLinks', updatedNavigationLinks);

        return response.data.data;
    } catch (error) {
        console.error('Error creating navigation link:', error);
        throw error;
    }
};

export const createSubNavigationLink = async (data) => {
    try {
        const response = await httpRequest.post('/child-navs', data);

        // Refresh sessionStorage for navigation links
        sessionStorage.removeItem('navigationLinks');
        const updatedNavigationLinks = await getNavigationLinks();
        saveToSessionStorage('navigationLinks', updatedNavigationLinks);

        return response.data.data;
    } catch (error) {
        console.error('Error creating navigation link:', error);
        throw error;
    }
};

export const createChildNavigationLink = async (data) => {
    try {
        const response = await httpRequest.post('/child-navs-two', data);

        // Refresh sessionStorage for navigation links
        sessionStorage.removeItem('navigationLinks');
        const updatedNavigationLinks = await getNavigationLinks();
        saveToSessionStorage('navigationLinks', updatedNavigationLinks);

        return response.data.data;
    } catch (error) {
        console.error('Error creating navigation link:', error);
        throw error;
    }
};

export const updateMainNavigationLink = async (id, data) => {
    try {
        const response = await httpRequest.patch(`/parent-navs/${id}`, data);

        sessionStorage.removeItem(`parent_nav_${id}`);
        sessionStorage.removeItem('navigationLinks');
        const updatedNavigationLinks = await getNavigationLinks();
        saveToSessionStorage('navigationLinks', updatedNavigationLinks);

        return response.data.data;
    } catch (error) {
        console.error('Error updating navigation link:', error);
        throw error;
    }
};

export const updateSubNavigationLink = async (id, data) => {
    try {
        const response = await httpRequest.patch(`/child-navs/${id}`, data);

        sessionStorage.removeItem(`child_nav_${id}`);
        sessionStorage.removeItem('navigationLinks');
        const updatedNavigationLinks = await getNavigationLinks();
        saveToSessionStorage('navigationLinks', updatedNavigationLinks);

        return response.data.data;
    } catch (error) {
        console.error('Error updating navigation link:', error);
        throw error;
    }
};

export const updateChildNavigationLink = async (id, data) => {
    try {
        const response = await httpRequest.patch(`/child-navs-two/${id}`, data);

        sessionStorage.removeItem(`child_nav_two_${id}`);
        sessionStorage.removeItem('navigationLinks');
        const updatedNavigationLinks = await getNavigationLinks();
        saveToSessionStorage('navigationLinks', updatedNavigationLinks);

        return response.data.data;
    } catch (error) {
        console.error('Error updating navigation link:', error);
        throw error;
    }
};

export const deleteMainNavigationLink = async (type, id) => {
    const data = { type, id };
    console.log(data);
    try {
        await httpRequest.delete(`/parent-navs/${id}`, { data });

        // Remove the deleted navigation link from sessionStorage and refresh links
        sessionStorage.removeItem(`parent_nav_${id}`);
        sessionStorage.removeItem(`navigationLinks`);

        const updatedNavigationLinks = await getNavigationLinks();
        saveToSessionStorage('navigationLinks', updatedNavigationLinks);
    } catch (error) {
        console.error('Error deleting navigation link:', error);
        throw error;
    }
};

export const deleteSubNavigationLink = async (type, id) => {
    const data = { type, id };
    console.log(data);
    try {
        await httpRequest.delete(`/child-navs/${id}`, { data });

        // Remove the deleted navigation link from sessionStorage and refresh links
        sessionStorage.removeItem(`child_navs_${id}`);
        sessionStorage.removeItem(`navigationLinks`);

        const updatedNavigationLinks = await getNavigationLinks();
        saveToSessionStorage('navigationLinks', updatedNavigationLinks);
    } catch (error) {
        console.error('Error deleting navigation link:', error);
        throw error;
    }
};

export const deleteChildNavigationLink = async (type, id) => {
    const data = { type, id };
    console.log(data);
    try {
        await httpRequest.delete(`/child-navs-two/${id}`, { data });

        // Remove the deleted navigation link from sessionStorage and refresh links
        sessionStorage.removeItem(`child_nav_two_${id}`);
        sessionStorage.removeItem(`navigationLinks`);
        const updatedNavigationLinks = await getNavigationLinks();
        saveToSessionStorage('navigationLinks', updatedNavigationLinks);
    } catch (error) {
        console.error('Error deleting navigation link:', error);
        throw error;
    }
};
