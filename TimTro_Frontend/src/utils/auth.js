export const getAuthUser = () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    
    try {
        const payloadBase64Url = token.split('.')[1];
        if (!payloadBase64Url) return null;

        // Convert Base64Url to Base64
        let base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Pad with '=' so length is a multiple of 4
        while (base64.length % 4) {
            base64 += '=';
        }

        // Handle UTF-8 safely
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        
        return {
            id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
            email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        };
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

// Role helpers
export const isLoggedIn = () => !!getAuthUser();
export const isAdmin = () => getAuthUser()?.role === 'Admin';
export const isModerator = () => getAuthUser()?.role === 'Moderator';
export const isAdminOrModerator = () => ['Admin', 'Moderator'].includes(getAuthUser()?.role);
export const isChuTro = () => getAuthUser()?.role === 'ChuTro';
export const isNguoiThue = () => getAuthUser()?.role === 'NguoiThue';

