/**
 * Content Module - Gestión de Contenido
 */

let contentData = [];

/**
 * Carga todo el contenido y lo muestra en la tabla
 */
async function loadContent() {
    try {
        showLoading('contentTableBody');
        
        contentData = await ContentAPI.getAll();
        
        if (!sitesData.length) {
            sitesData = await SitesAPI.getAll();
        }
        
        renderContentTable();
    } catch (error) {
        showToast('Error al cargar contenido: ' + error.message, 'error');
        renderEmptyState('content', true);
    }
}

/**
 * Renderiza la tabla de contenido
 */
function renderContentTable(filteredData = null) {
    const tbody = document.getElementById('contentTableBody');
    const emptyState = document.getElementById('contentEmpty');
    
    // Aplicar filtros
    const siteFilter = document.getElementById('contentSiteFilter').value;
    const typeFilter = document.getElementById('contentTypeFilter').value;
    
    let displayData = filteredData || contentData;
    
    if (siteFilter) {
        displayData = displayData.filter(c => c.siteId === siteFilter || (c.siteId && c.siteId._id === siteFilter));
    }
    
    if (typeFilter) {
        displayData = displayData.filter(c => c.type === typeFilter);
    }
    
    if (!displayData || displayData.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    const typeLabels = {
        'hero': 'Hero',
        'features': 'Features',
        'testimonials': 'Testimonials',
        'cta': 'CTA',
        'gallery': 'Gallery',
        'text': 'Text',
        'video': 'Video',
        'faq': 'FAQ',
        'contact': 'Contact',
        'custom': 'Custom'
    };
    
    tbody.innerHTML = displayData.map(content => {
        const site = getSiteName(content.siteId);
        const typeLabel = typeLabels[content.type] || content.type;
        
        return `
            <tr>
                <td><strong>${escapeHtml(content.title)}</strong></td>
                <td><span class="badge badge-info">${typeLabel}</span></td>
                <td>${content.order || 0}</td>
                <td>${escapeHtml(site)}</td>
                <td><span class="badge badge-${content.isActive ? 'success' : 'danger'}">${content.isActive ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="edit-btn" onclick="editContent('${content._id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteContent('${content._id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Muestra el modal para crear/editar contenido
 */
function showContentModal(contentId = null) {
    const modal = document.getElementById('contentModal');
    const title = document.getElementById('contentModalTitle');
    const form = document.getElementById('contentForm');
    
    // Limpiar formulario
    form.reset();
    document.getElementById('contentId').value = '';
    
    // Poblar select de sitios
    populateContentSiteSelect();
    
    if (contentId) {
        const content = contentData.find(c => c._id === contentId);
        if (content) {
            title.textContent = 'Editar Contenido';
            populateContentForm(content);
        }
    } else {
        title.textContent = 'Nuevo Contenido';
    }
    
    modal.classList.add('active');
}

/**
 * Rellena el formulario con los datos del contenido
 */
function populateContentForm(content) {
    document.getElementById('contentId').value = content._id || '';
    
    // El sitio puede ser un ID o un objeto
    const siteId = content.siteId && typeof content.siteId === 'object' ? content.siteId._id : content.siteId;
    document.getElementById('contentSite').value = siteId || '';
    
    document.getElementById('contentTitle').value = content.title || '';
    document.getElementById('contentType').value = content.type || 'custom';
    document.getElementById('contentOrder').value = content.order || 0;
    document.getElementById('contentIsActive').checked = content.isActive !== false;
    
    // Data como JSON
    if (content.data) {
        document.getElementById('contentData').value = JSON.stringify(content.data, null, 2);
    } else {
        document.getElementById('contentData').value = '';
    }
}

/**
 * Pobla el select de sitios en el formulario de contenido
 */
function populateContentSiteSelect() {
    const select = document.getElementById('contentSite');
    select.innerHTML = '<option value="">Selecciona un sitio</option>';
    
    if (sitesData && sitesData.length > 0) {
        sitesData.forEach(site => {
            const option = document.createElement('option');
            option.value = site._id;
            option.textContent = site.name;
            select.appendChild(option);
        });
    }
}

/**
 * Cierra el modal de contenido
 */
function closeContentModal() {
    const modal = document.getElementById('contentModal');
    modal.classList.remove('active');
}

/**
 * Edita un contenido existente
 */
function editContent(contentId) {
    showContentModal(contentId);
}

/**
 * Elimina un contenido
 */
async function deleteContent(contentId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este contenido? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await ContentAPI.delete(contentId);
        showToast('Contenido eliminado correctamente', 'success');
        await loadContent();
    } catch (error) {
        showToast('Error al eliminar contenido: ' + error.message, 'error');
    }
}

/**
 * Guarda un contenido (crear o actualizar)
 */
async function saveContent(event) {
    event.preventDefault();
    
    const contentId = document.getElementById('contentId').value;
    let dataValue = {};
    
    // Parsear JSON
    const dataText = document.getElementById('contentData').value.trim();
    if (dataText) {
        try {
            dataValue = JSON.parse(dataText);
        } catch (e) {
            showToast('El campo Datos debe ser un JSON válido', 'error');
            return;
        }
    }
    
    const contentDataToSave = {
        siteId: document.getElementById('contentSite').value,
        title: document.getElementById('contentTitle').value,
        type: document.getElementById('contentType').value,
        order: parseInt(document.getElementById('contentOrder').value) || 0,
        data: dataValue,
        isActive: document.getElementById('contentIsActive').checked
    };
    
    try {
        if (contentId) {
            await ContentAPI.update(contentId, contentDataToSave);
            showToast('Contenido actualizado correctamente', 'success');
        } else {
            await ContentAPI.create(contentDataToSave);
            showToast('Contenido creado correctamente', 'success');
        }
        
        closeContentModal();
        await loadContent();
    } catch (error) {
        showToast('Error al guardar contenido: ' + error.message, 'error');
    }
}

// Inicializar eventos del formulario
document.getElementById('contentForm').addEventListener('submit', saveContent);

/**
 * Filtra contenido por sitio
 */
function filterContentBySite() {
    renderContentTable();
}

/**
 * Filtra contenido por tipo
 */
function filterContentByType() {
    renderContentTable();
}

/**
 * Obtiene los datos de contenido (para uso externo)
 */
function getContentData() {
    return contentData;
}

/**
 * Obtiene un contenido por su ID
 */
function getContentById(contentId) {
    return contentData.find(c => c._id === contentId);
}
