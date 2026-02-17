/**
 * Sites Module - Gestión de Sitios
 */

let sitesData = [];

/**
 * Carga todos los sitios y los muestra en la tabla
 */
async function loadSites() {
    try {
        showLoading('sitesTableBody');
        sitesData = await SitesAPI.getAll();
        renderSitesTable();
        updateDashboardStats();
    } catch (error) {
        showToast('Error al cargar sitios: ' + error.message, 'error');
        renderEmptyState('sites', true);
    }
}

/**
 * Renderiza la tabla de sitios
 */
function renderSitesTable() {
    const tbody = document.getElementById('sitesTableBody');
    const emptyState = document.getElementById('sitesEmpty');
    
    if (!sitesData || sitesData.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = sitesData.map(site => `
        <tr>
            <td><strong>${escapeHtml(site.name)}</strong></td>
            <td>${escapeHtml(site.domain)}</td>
            <td><span class="badge badge-${site.type === 'CATALOG' ? 'primary' : 'info'}">${site.type === 'CATALOG' ? 'Catálogo' : 'Landing Page'}</span></td>
            <td><span class="badge badge-${site.isActive ? 'success' : 'danger'}">${site.isActive ? 'Activo' : 'Inactivo'}</span></td>
            <td><span class="badge badge-${site.hasBlog ? 'success' : 'warning'}">${site.hasBlog ? 'Sí' : 'No'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="edit-btn" onclick="editSite('${site._id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteSite('${site._id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Muestra el modal para crear/editar sitio
 */
function showSiteModal(siteId = null) {
    const modal = document.getElementById('siteModal');
    const title = document.getElementById('siteModalTitle');
    const form = document.getElementById('siteForm');
    
    // Limpiar formulario
    form.reset();
    document.getElementById('siteId').value = '';
    
    if (siteId) {
        const site = sitesData.find(s => s._id === siteId);
        if (site) {
            title.textContent = 'Editar Sitio';
            populateSiteForm(site);
        }
    } else {
        title.textContent = 'Nuevo Sitio';
    }
    
    modal.classList.add('active');
}

/**
 * Rellena el formulario con los datos del sitio
 */
function populateSiteForm(site) {
    document.getElementById('siteId').value = site._id || '';
    document.getElementById('siteName').value = site.name || '';
    document.getElementById('siteDomain').value = site.domain || '';
    document.getElementById('siteType').value = site.type || 'LANDING_PAGE';
    document.getElementById('siteDescription').value = site.description || '';
    
    // Branding
    if (site.branding) {
        document.getElementById('siteLogoUrl').value = site.branding.logoUrl || '';
        document.getElementById('sitePrimaryColor').value = site.branding.primaryColor || '#007bff';
        document.getElementById('siteSecondaryColor').value = site.branding.secondaryColor || '#6c757d';
        document.getElementById('siteAccentColor').value = site.branding.accentColor || '#28a745';
    }
    
    // Integrations
    if (site.integrations) {
        document.getElementById('siteGtmId').value = site.integrations.googleTagManagerId || '';
        document.getElementById('siteGaId').value = site.integrations.googleAnalyticsId || '';
        document.getElementById('siteMetaPixelId').value = site.integrations.metaPixelId || '';
    }
    
    // SEO
    if (site.seo) {
        document.getElementById('siteSeoTitle').value = site.seo.title || '';
        document.getElementById('siteSeoDescription').value = site.seo.description || '';
        document.getElementById('siteSeoKeywords').value = site.seo.keywords ? site.seo.keywords.join(', ') : '';
    }
    
    // Other fields
    document.getElementById('siteHasBlog').checked = site.hasBlog || false;
    document.getElementById('siteIsActive').checked = site.isActive !== false;
}

/**
 * Cierra el modal de sitio
 */
function closeSiteModal() {
    const modal = document.getElementById('siteModal');
    modal.classList.remove('active');
}

/**
 * Edita un sitio existente
 */
function editSite(siteId) {
    showSiteModal(siteId);
}

/**
 * Elimina un sitio
 */
async function deleteSite(siteId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este sitio? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await SitesAPI.delete(siteId);
        showToast('Sitio eliminado correctamente', 'success');
        await loadSites();
        populateSiteFilters();
    } catch (error) {
        showToast('Error al eliminar sitio: ' + error.message, 'error');
    }
}

/**
 * Guarda un sitio (crear o actualizar)
 */
async function saveSite(event) {
    event.preventDefault();
    
    const siteId = document.getElementById('siteId').value;
    
    const siteData = {
        name: document.getElementById('siteName').value,
        domain: document.getElementById('siteDomain').value,
        type: document.getElementById('siteType').value,
        description: document.getElementById('siteDescription').value,
        branding: {
            logoUrl: document.getElementById('siteLogoUrl').value,
            primaryColor: document.getElementById('sitePrimaryColor').value,
            secondaryColor: document.getElementById('siteSecondaryColor').value,
            accentColor: document.getElementById('siteAccentColor').value
        },
        integrations: {
            googleTagManagerId: document.getElementById('siteGtmId').value,
            googleAnalyticsId: document.getElementById('siteGaId').value,
            metaPixelId: document.getElementById('siteMetaPixelId').value
        },
        seo: {
            title: document.getElementById('siteSeoTitle').value,
            description: document.getElementById('siteSeoDescription').value,
            keywords: document.getElementById('siteSeoKeywords').value.split(',').map(k => k.trim()).filter(k => k)
        },
        hasBlog: document.getElementById('siteHasBlog').checked,
        isActive: document.getElementById('siteIsActive').checked
    };
    
    try {
        if (siteId) {
            await SitesAPI.update(siteId, siteData);
            showToast('Sitio actualizado correctamente', 'success');
        } else {
            await SitesAPI.create(siteData);
            showToast('Sitio creado correctamente', 'success');
        }
        
        closeSiteModal();
        await loadSites();
        populateSiteFilters();
    } catch (error) {
        showToast('Error al guardar sitio: ' + error.message, 'error');
    }
}

// Inicializar eventos del formulario
document.getElementById('siteForm').addEventListener('submit', saveSite);

/**
 * Obtiene los datos de sitios (para uso externo)
 */
function getSitesData() {
    return sitesData;
}

/**
 * Obtiene un sitio por su ID
 */
function getSiteById(siteId) {
    return sitesData.find(s => s._id === siteId);
}
