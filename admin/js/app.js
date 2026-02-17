/**
 * App Module - Lógica principal de la aplicación
 */

// Variables globales
let currentSection = 'dashboard';

/**
 * Inicialización de la aplicación
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar componentes
    initSidebar();
    initNavigation();
    initFilters();
    
    // Verificar conexión API
    const isConnected = await checkApiConnection();
    
    if (isConnected) {
        // Cargar datos iniciales
        await loadDashboardData();
    }
    
    // Configurar botón de actualizar
    document.getElementById('refreshBtn').addEventListener('click', refreshCurrentSection);
});

/**
 * Inicializa el sidebar
 */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    
    toggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
    });
}

/**
 * Inicializa la navegación
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const addNewBtn = document.getElementById('addNewBtn');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            navigateToSection(section);
            
            // Actualizar navegación activa
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Botón de agregar nuevo
    if (addNewBtn) {
        addNewBtn.addEventListener('click', function() {
            switch(currentSection) {
                case 'sites':
                    showSiteModal();
                    break;
                case 'products':
                    showProductModal();
                    break;
                case 'content':
                    showContentModal();
                    break;
            }
        });
    }
}

/**
 * Inicializa los filtros
 */
function initFilters() {
    // Filtro de productos por sitio
    const productSiteFilter = document.getElementById('productSiteFilter');
    if (productSiteFilter) {
        productSiteFilter.addEventListener('change', filterProductsBySite);
    }
    
    // Filtros de contenido
    const contentSiteFilter = document.getElementById('contentSiteFilter');
    if (contentSiteFilter) {
        contentSiteFilter.addEventListener('change', filterContentBySite);
    }
    
    const contentTypeFilter = document.getElementById('contentTypeFilter');
    if (contentTypeFilter) {
        contentTypeFilter.addEventListener('change', filterContentByType);
    }
}

/**
 * Navega a una sección
 */
function navigateToSection(section) {
    currentSection = section;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const sectionEl = document.getElementById(section + 'Section');
    if (sectionEl) {
        sectionEl.classList.add('active');
    }
    
    // Actualizar título
    updatePageTitle(section);
    
    // Actualizar visibilidad del botón agregar
    const addNewBtn = document.getElementById('addNewBtn');
    if (addNewBtn) {
        addNewBtn.style.display = ['sites', 'products', 'content'].includes(section) ? 'flex' : 'none';
    }
    
    // Cargar datos de la sección
    loadSectionData(section);
}

/**
 * Actualiza el título de la página
 */
function updatePageTitle(section) {
    const titles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Resumen general del sistema' },
        'sites': { title: 'Sitios', subtitle: 'Gestiona los sitios web' },
        'products': { title: 'Productos', subtitle: 'Gestiona el catálogo de productos' },
        'content': { title: 'Contenido', subtitle: ' de contenido' },
        'analytics': { title: 'Analytics', subtitle: 'Estadísticas y eventos' }
    };
    
    const config = titles[section] || { title: 'Panel', subtitle: '' };
    
    document.getElementById('pageTitle').textContent = config.title;
    document.getElementById('pageSubtitle').textContent = config.subtitle;
}

/**
 * Carga los datos de la sección
 */
async function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'sites':
            await loadSites();
            break;
        case 'products':
            await loadProducts();
            populateProductFilters();
            break;
        case 'content':
            await loadContent();
            populateContentFilters();
            break;
        case 'analytics':
            await initAnalyticsFilters();
            break;
    }
}

/**
 * Carga los datos del dashboard
 */
async function loadDashboardData() {
    try {
        // Cargar todos los datos
        const [sites, products, content, events] = await Promise.all([
            SitesAPI.getAll(),
            ProductsAPI.getAll(),
            ContentAPI.getAll(),
            AnalyticsAPI.getEvents({ limit: 1 })
        ]);
        
        // Actualizar contadores
        document.getElementById('totalSites').textContent = sites.length;
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalContent').textContent = content.length;
        
        // Intentar obtener el total de eventos (puede fallar si no hay sitio)
        try {
            const eventsAll = await AnalyticsAPI.getEvents({ limit: 1000 });
            const totalEvents = eventsAll.pagination?.total || eventsAll.data?.length || 0;
            document.getElementById('totalEvents').textContent = totalEvents;
        } catch {
            document.getElementById('totalEvents').textContent = '0';
        }
        
        // Renderizar listas recientes
        renderRecentSites(sites);
        renderRecentProducts(products);
        
        // Guardar en cache
        sitesData = sites;
        productsData = products;
        contentData = content;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

/**
 * Renderiza los sitios recientes en el dashboard
 */
function renderRecentSites(sites) {
    const container = document.getElementById('recentSites');
    
    if (!sites || sites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-globe"></i>
                <p>No hay sitios registrados</p>
            </div>
        `;
        return;
    }
    
    const recent = sites.slice(0, 5);
    
    container.innerHTML = recent.map(site => `
        <div class="recent-item">
            <div class="recent-item-icon">
                <i class="fas fa-globe"></i>
            </div>
            <div class="recent-item-info">
                <div class="recent-item-title">${escapeHtml(site.name)}</div>
                <div class="recent-item-meta">${escapeHtml(site.domain)}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Renderiza los productos recientes en el dashboard
 */
function renderRecentProducts(products) {
    const container = document.getElementById('recentProducts');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box"></i>
                <p>No hay productos registrados</p>
            </div>
        `;
        return;
    }
    
    const recent = products.slice(0, 5);
    
    container.innerHTML = recent.map(product => `
        <div class="recent-item">
            <div class="recent-item-icon">
                <i class="fas fa-box"></i>
            </div>
            <div class="recent-item-info">
                <div class="recent-item-title">${escapeHtml(product.name)}</div>
                <div class="recent-item-meta">${formatPrice(product.price, product.currency)}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Actualiza las estadísticas del dashboard
 */
async function updateDashboardStats() {
    try {
        const [sites, products, content] = await Promise.all([
            SitesAPI.getAll(),
            ProductsAPI.getAll(),
            ContentAPI.getAll()
        ]);
        
        document.getElementById('totalSites').textContent = sites.length;
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalContent').textContent = content.length;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

/**
 * Refresca la sección actual
 */
async function refreshCurrentSection() {
    invalidateAllCache();
    await loadSectionData(currentSection);
    showToast('Datos actualizados', 'success');
}

/**
 * Pobla los filtros de sitios en productos y contenido
 */
function populateSiteFilters() {
    // Filtro de sitios para productos
    const productFilter = document.getElementById('productSiteFilter');
    if (productFilter) {
        const currentValue = productFilter.value;
        productFilter.innerHTML = '<option value="">Todos los sitios</option>';
        
        sitesData.forEach(site => {
            const option = document.createElement('option');
            option.value = site._id;
            option.textContent = site.name;
            productFilter.appendChild(option);
        });
        
        productFilter.value = currentValue;
    }
    
    // Filtro de sitios para contenido
    const contentFilter = document.getElementById('contentSiteFilter');
    if (contentFilter) {
        const currentValue = contentFilter.value;
        contentFilter.innerHTML = '<option value="">Todos los sitios</option>';
        
        sitesData.forEach(site => {
            const option = document.createElement('option');
            option.value = site._id;
            option.textContent = site.name;
            contentFilter.appendChild(option);
        });
        
        contentFilter.value = currentValue;
    }
}

function populateProductFilters() {
    populateSiteFilters();
}

function populateContentFilters() {
    populateSiteFilters();
}

// ==========================================
// Utilidades
// ==========================================

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Obtiene el nombre del sitio por ID
 */
function getSiteName(siteId) {
    if (!siteId) return '-';
    if (typeof siteId === 'string') {
        const site = sitesData.find(s => s._id === siteId);
        return site ? site.name : '-';
    }
    if (siteId.name) {
        return siteId.name;
    }
    return '-';
}

/**
 * Formatea el precio
 */
function formatPrice(price, currency = 'USD') {
    const symbols = { 'USD': '$', 'EUR': '€', 'COP': '$' };
    const symbol = symbols[currency] || '$';
    return `${symbol}${price.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
}

/**
 * Muestra un toast de notificación
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        'success': 'check-circle',
        'error': 'times-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <p>${escapeHtml(message)}</p>
    `;
    
    container.appendChild(toast);
    
    // Auto eliminar después de 4 segundos
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Muestra estado de carga
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--accent-primary);"></i>
                    <p style="margin-top: 10px; color: var(--text-secondary);">Cargando...</p>
                </td>
            </tr>
        `;
    }
}

/**
 * Renderiza estado vacío
 */
function renderEmptyState(type, show = true, message = null) {
    const emptyState = document.getElementById(type + 'Empty');
    if (emptyState) {
        emptyState.style.display = show ? 'block' : 'none';
        if (message) {
            const p = emptyState.querySelector('p');
            if (p) p.textContent = message;
        }
    }
}

// Hacer funciones accesibles globalmente para los onclick
window.navigateToSection = navigateToSection;
window.loadDashboardData = loadDashboardData;
window.refreshCurrentSection = refreshCurrentSection;
window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.getSiteName = getSiteName;
window.formatPrice = formatPrice;
