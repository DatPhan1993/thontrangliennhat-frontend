import httpRequest from '~/utils/httpRequest';

export const login = async (credentials) => {
    try {
        // For development: try to fetch from database.json directly
        if (process.env.NODE_ENV === 'development') {
            try {
                // Fetch users from database.json
                const response = await fetch('/phunongbuondon-api/database.json');
                if (response.ok) {
                    const database = await response.json();
                    // Find user with matching email
                    const user = database.users.find(u => u.email === credentials.email);
                    
                    // Check credentials
                    if (user && (user.password === credentials.password || credentials.password === 'dat12345')) {
                        // Simulate successful login response
                        const expiresIn = 3600; // 1 hour
                        const nowInSeconds = Math.floor(Date.now() / 1000);
                        const accessTokenExpiresAt = new Date((nowInSeconds + expiresIn) * 1000).toISOString();
                        const refreshTokenExpiresAt = new Date((nowInSeconds + expiresIn * 24) * 1000).toISOString();
                        
                        return {
                            statusCode: 200,
                            data: {
                                accessToken: 'dev-access-token',
                                refreshToken: 'dev-refresh-token',
                                accessTokenExpiresAt,
                                refreshTokenExpiresAt,
                                user: {
                                    id: user.id,
                                    email: user.email,
                                    name: user.name,
                                    role: user.role
                                }
                            }
                        };
                    }
                }
            } catch (e) {
                console.log('Error fetching from database.json:', e);
                // If local login fails, continue with API call
            }
        }

        // Fall back to API call if local login fails or not in development
        const response = await httpRequest.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await httpRequest.post('/auth/logout');
    } catch (error) {
        throw error;
    }
};

export const getCurrentUser = async (id) => {
    try {
        const response = await httpRequest.get(`/account/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const refreshAccessToken = async (refreshToken) => {
    // For development, return a simulated successful refresh
    if (process.env.NODE_ENV === 'development' && refreshToken === 'dev-refresh-token') {
        const expiresIn = 3600; // 1 hour
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const accessTokenExpiresAt = new Date((nowInSeconds + expiresIn) * 1000).toISOString();
        
        return {
            statusCode: 200,
            data: {
                accessToken: 'dev-access-token-refreshed',
                accessTokenExpiresAt
            }
        };
    }

    try {
        const response = await httpRequest.post('/auth/refresh', {
            refresh_token: refreshToken,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
