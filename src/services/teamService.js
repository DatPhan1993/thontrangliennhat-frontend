import httpRequest from '~/utils/httpRequest';

// Helper functions for sessionStorage
const saveToSessionStorage = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data));
};

const getFromSessionStorage = (key) => {
    const storedData = sessionStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
};

// Members
export const getMembers = async (forceRefresh = false) => {
    const sessionKey = 'allMembers';

    // Only use cached data if not forcing refresh
    if (!forceRefresh) {
        const cachedData = getFromSessionStorage(sessionKey);
        if (cachedData) {
            return cachedData;
        }
    } else {
        // Clear the cache when forcing refresh
        sessionStorage.removeItem(sessionKey);
    }

    try {
        // Add a timestamp to force browser to make a fresh request
        const timestamp = new Date().getTime();
        const response = await httpRequest.get(`/teams?_=${timestamp}`);
        const membersData = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, membersData);

        return membersData;
    } catch (error) {
        console.error('Error fetching members', error);
        throw error;
    }
};

export const addMember = async (memberData) => {
    try {
        // Cấu hình đặc biệt cho form data với file upload
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        
        const response = await httpRequest.post(`/teams`, memberData, config);

        // Clear all member-related cache
        sessionStorage.removeItem(`allMembers`);
        
        // Don't need to refresh here as we'll force refresh when needed
        return response.data.data;
    } catch (error) {
        console.error('Error adding member', error);
        throw error;
    }
};

export const updateMember = async (memberId, memberData) => {
    try {
        const response = await httpRequest.post(`/teams/${memberId}`, memberData);

        // Clear all member-related cache
        sessionStorage.removeItem(`member_${memberId}`);
        sessionStorage.removeItem(`allMembers`);

        return response.data;
    } catch (error) {
        console.error('Error updating member', error);
        throw error;
    }
};

export const getMemberById = async (memberId, forceRefresh = false) => {
    const sessionKey = `member_${memberId}`;

    // Only use cached data if not forcing refresh
    if (!forceRefresh) {
        const cachedData = getFromSessionStorage(sessionKey);
        if (cachedData) {
            return cachedData;
        }
    } else {
        // Clear the cache when forcing refresh
        sessionStorage.removeItem(sessionKey);
    }

    try {
        // Add a timestamp to force browser to make a fresh request
        const timestamp = new Date().getTime();
        const response = await httpRequest.get(`/teams/${memberId}?_=${timestamp}`);
        const memberData = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, memberData);

        return memberData;
    } catch (error) {
        console.error('Error fetching member detail', error);
        throw error;
    }
};

export const deleteMember = async (memberId) => {
    try {
        await httpRequest.delete(`/teams/${memberId}`);

        // Clear all member-related cache
        sessionStorage.removeItem(`allMembers`);
        sessionStorage.removeItem(`member_${memberId}`);
    } catch (error) {
        console.error('Error deleting member', error);
        throw error;
    }
};
