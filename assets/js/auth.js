class Auth {
    static isLoggedIn() {
        return !!ApiClient.getToken();
    }

    static async getUser() {
        if (!this.isLoggedIn()) return null;
        try {
            const response = await ApiClient.get('/auth/me');
            return response.data;
        } catch (error) {
            return null;
        }
    }

    static async logout() {
        try {
            await ApiClient.post('/auth/logout');
        } catch (error) {
            console.error(error);
        } finally {
            ApiClient.removeToken();
            window.location.href = '/login.html';
        }
    }

    static requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login.html';
        }
    }

    static requireGuest() {
        if (this.isLoggedIn()) {
            window.location.href = '/index.html';
        }
    }
}
