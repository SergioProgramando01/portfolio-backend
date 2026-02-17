/**
 * API Module - Manejo de conexiones con el backend
 */

// Configuración de la API
const API_CONFIG = {
    // Ajusta esta URL según tu entorno
    baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : '/api',
    timeout: 30000
};

// Cache para almacenar datos
const apiCache = {
    sites: null,
    products: null,
    content: null,
    events: null
};

/**
 * Realiza una petición HTTP
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        timeout: API_CONFIG.timeout,
        ...options
    };

    // Si hay body, convertir a JSON
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// ==========================================
// Sites API
// ==========================================

const SitesAPI = {
    async getAll() {
        const data = await apiRequest('/sites');
        apiCache.sites = data;
        return data;
    },

    async getById(id) {
        return await apiRequest(`/sites/${id}`);
    },

    async create(siteData) {
        const data = await apiRequest('/sites', {
            method: 'POST',
            body: siteData
        });
        apiCache.sites = null; // Invalidar cache
        return data;
    },

    async update(id, siteData) {
        const data = await apiRequest(`/sites/${id}`, {
            method: 'PUT',
            body: siteData
        });
        apiCache.sites = null; // Invalidar cache
        return data;
    },

    async delete(id) {
        const data = await apiRequest(`/sites/${id}`, {
            method: 'DELETE'
        });
        apiCache.sites = null; // Invalidar cache
        return data;
    }
};

// ==========================================
// Products API
// ==========================================

const ProductsAPI = {
    async getAll() {
        const data = await apiRequest('/products');
        apiCache.products = data;
        return data;
    },

    async getById(id) {
        return await apiRequest(`/products/${id}`);
    },

    async create(productData) {
        const data = await apiRequest('/products', {
            method: 'POST',
            body: productData
        });
        apiCache.products = null; // Invalidar cache
        return data;
    },

    async update(id, productData) {
        const data = await apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: productData
        });
        apiCache.products = null; // Invalidar cache
        return data;
    },

    async delete(id) {
        const data = await apiRequest(`/products/${id}`, {
            method: 'DELETE'
        });
        apiCache.products = null; // Invalidar cache
        return data;
    }
};

// ==========================================
// Content API
// ==========================================

const ContentAPI = {
    async getAll() {
        const data = await apiRequest('/content');
        apiCache.content = data;
        return data;
    },

    async getById(id) {
        return await apiRequest(`/content/${id}`);
    },

    async create(contentData) {
        const data = await apiRequest('/content', {
            method: 'POST',
            body: contentData
        });
        apiCache.content = null; // Invalidar cache
        return data;
    },

    async update(id, contentData) {
        const data = await apiRequest(`/content/${id}`, {
            method: 'PUT',
            body: contentData
        });
        apiCache.content = null; // Invalidar cache
        return data;
    },

    async delete(id) {
        const data = await apiRequest(`/content/${id}`, {
            method: 'DELETE'
        });
        apiCache.content = null; // Invalidar cache
        return data;
    }
};

// ==========================================
// Analytics API
// ==========================================

const AnalyticsAPI = {
    async getEvents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/events?${queryString}` : '/events';
        const data = await apiRequest(endpoint);
        return data;
    },

    async getSummary(siteId, startDate = null, endDate = null) {
        let params = { siteId };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        
        const queryString = new URLSearchParams(params).toString();
        const data = await apiRequest(`/events/summary?${queryString}`);
        return data;
    },

    async getEventsByElement(siteId, elementId, limit = 50) {
        const params = new URLSearchParams({ siteId, elementId, limit });
        const data = await apiRequest(`/events/element?${params}`);
        return data;
    },

    async cleanupOldEvents(days = 90) {
        const data = await apiRequest(`/events/cleanup?days=${days}`, {
            method: 'DELETE'
        });
        return data;
    }
};

// ==========================================
// Utilidades
// ==========================================

/**
 * Verifica la conexión con la API
 */
async function checkApiConnection() {
    const statusEl = document.getElementById('apiStatus');
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('.status-text');
    
    try {
        // Intentar obtener los sitios para verificar conexión
        await SitesAPI.getAll();
        dot.classList.add('connected');
        text.textContent = 'Conectado';
        return true;
    } catch (error) {
        dot.classList.add('error');
        text.textContent = 'Sin conexión';
        return false;
    }
}

/**
 * Invalida toda la cache
 */
function invalidateAllCache() {
    apiCache.sites = null;
    apiCache.products = null;
    apiCache.content = null;
    apiCache.events = null;
}
