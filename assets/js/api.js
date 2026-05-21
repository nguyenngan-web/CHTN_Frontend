const API_BASE = 'https://chtnbackend-production.up.railway.app/api';
class ApiClient {
    static getToken() {
        return localStorage.getItem('auth_token');
    }

    static setToken(token) {
        localStorage.setItem('auth_token', token);
    }

    static removeToken() {
        localStorage.removeItem('auth_token');
    }

    static async request(method, endpoint, data = null, isFormData = false) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Accept': 'application/json',
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (data) {
            config.body = isFormData ? data : JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                this.removeToken();
                window.location.href = '/login.html';
                return null;
            }

            let responseData = null;
            const text = await response.text();
            if (text) {
                try {
                    responseData = JSON.parse(text);
                } catch (e) {
                    responseData = text;
                }
            }

            if (!response.ok) {
                const errorMessage = (responseData && responseData.message) ? responseData.message : (typeof responseData === 'string' ? responseData : 'Có lỗi xảy ra');
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static get(endpoint) {
        return this.request('GET', endpoint);
    }

    static post(endpoint, data, isFormData = false) {
        return this.request('POST', endpoint, data, isFormData);
    }

    static put(endpoint, data, isFormData = false) {
        return this.request('PUT', endpoint, data, isFormData);
    }

    static patch(endpoint, data, isFormData = false) {
        return this.request('PATCH', endpoint, data, isFormData);
    }

    static delete(endpoint) {
        return this.request('DELETE', endpoint);
    }
}

// Global Notification Function
window.showNotification = function (message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-5 right-5 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    }

    const alertEl = document.createElement('div');
    if (type === 'success') {
        alertEl.className = 'px-4 py-3 rounded shadow-lg bg-green-100 text-green-700 transition-all duration-300 transform translate-x-full opacity-0';
    } else {
        alertEl.className = 'px-4 py-3 rounded shadow-lg bg-red-100 text-red-700 transition-all duration-300 transform translate-x-full opacity-0';
    }
    alertEl.innerText = message;

    container.appendChild(alertEl);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            alertEl.classList.remove('translate-x-full', 'opacity-0');
            alertEl.classList.add('translate-x-0', 'opacity-100');
        });
    });

    // Animate out and remove
    setTimeout(() => {
        alertEl.classList.remove('translate-x-0', 'opacity-100');
        alertEl.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => alertEl.remove(), 300);
    }, 3000);
};

// Global Async Confirmation Modal (Fixes INP issue by replacing native blocking confirm)
window.showConfirm = function (title, message) {
    return new Promise((resolve) => {
        let container = document.getElementById('confirm-modal-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'confirm-modal-container';
            container.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300';
            document.body.appendChild(container);
        }

        container.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-2xl max-w-sm w-full mx-4 transform scale-90 transition-all duration-300">
                <h3 class="text-lg font-bold text-gray-900 mb-2">${title}</h3>
                <p class="text-sm text-gray-500 mb-6">${message}</p>
                <div class="flex justify-end gap-3">
                    <button id="confirm-btn-cancel" class="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 rounded transition-colors uppercase">Hủy</button>
                    <button id="confirm-btn-ok" class="px-4 py-2 text-xs font-semibold text-white bg-[#6F2A2A] rounded hover:opacity-90 transition-opacity uppercase">Xác nhận</button>
                </div>
            </div>
        `;

        const modal = container.firstElementChild;

        // Open modal
        container.classList.remove('pointer-events-none', 'opacity-0');
        container.classList.add('opacity-100');
        setTimeout(() => {
            modal.classList.remove('scale-90');
            modal.classList.add('scale-100');
        }, 10);

        function closeModal(result) {
            modal.classList.remove('scale-100');
            modal.classList.add('scale-90');
            container.classList.remove('opacity-100');
            container.classList.add('opacity-0', 'pointer-events-none');

            setTimeout(() => {
                resolve(result);
            }, 300);
        }

        document.getElementById('confirm-btn-cancel').onclick = () => closeModal(false);
        document.getElementById('confirm-btn-ok').onclick = () => closeModal(true);
    });
};

// Global Async Prompt Modal (Fixes INP issue by replacing native blocking prompt)
window.showPrompt = function (title, message, placeholder = '') {
    return new Promise((resolve) => {
        let container = document.getElementById('prompt-modal-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'prompt-modal-container';
            container.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300';
            document.body.appendChild(container);
        }

        container.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-2xl max-w-sm w-full mx-4 transform scale-90 transition-all duration-300">
                <h3 class="text-lg font-bold text-gray-900 mb-2">${title}</h3>
                <p class="text-sm text-gray-500 mb-4">${message}</p>
                <input type="text" id="prompt-input-field" placeholder="${placeholder}" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#6F2A2A] mb-6">
                <div class="flex justify-end gap-3">
                    <button id="prompt-btn-cancel" class="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 rounded transition-colors uppercase">Hủy</button>
                    <button id="prompt-btn-ok" class="px-4 py-2 text-xs font-semibold text-white bg-[#6F2A2A] rounded hover:opacity-90 transition-opacity uppercase">Xác nhận</button>
                </div>
            </div>
        `;

        const modal = container.firstElementChild;
        const inputField = document.getElementById('prompt-input-field');

        // Open modal
        container.classList.remove('pointer-events-none', 'opacity-0');
        container.classList.add('opacity-100');
        setTimeout(() => {
            modal.classList.remove('scale-90');
            modal.classList.add('scale-100');
            inputField.focus();
        }, 10);

        function closeModal(value) {
            modal.classList.remove('scale-100');
            modal.classList.add('scale-90');
            container.classList.remove('opacity-100');
            container.classList.add('opacity-0', 'pointer-events-none');

            setTimeout(() => {
                resolve(value);
            }, 300);
        }

        document.getElementById('prompt-btn-cancel').onclick = () => closeModal(null);
        document.getElementById('prompt-btn-ok').onclick = () => {
            const val = inputField.value.trim();
            closeModal(val);
        };
        inputField.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = inputField.value.trim();
                closeModal(val);
            }
        };
    });
};

window.performGlobalSearch = function () {
    const input = document.getElementById('search-input');
    if (input) {
        const val = input.value.trim();
        if (window.location.pathname.endsWith('products.html')) {
            if (typeof loadProducts === 'function') {
                loadProducts(1);
            }
        } else {
            if (val) {
                window.location.href = `products.html?search=${encodeURIComponent(val)}`;
            } else {
                window.location.href = `products.html`;
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.performGlobalSearch();
            }
        });
    }
});
