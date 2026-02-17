/**
 * Analytics Module - Gestión de Analytics y Eventos
 */

let analyticsData = null;

/**
 * Inicializa los filtros de analytics
 */
async function initAnalyticsFilters() {
    // Poblar el select de sitios
    const siteFilter = document.getElementById('analyticsSiteFilter');
    siteFilter.innerHTML = '<option value="">Selecciona un sitio</option>';
    
    if (sitesData && sitesData.length > 0) {
        sitesData.forEach(site => {
            const option = document.createElement('option');
            option.value = site._id;
            option.textContent = site.name;
            siteFilter.appendChild(option);
        });
    }
    
    // Establecer fechas por defecto (últimos 7 días)
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    
    document.getElementById('analyticsEndDate').value = formatDateForInput(today);
    document.getElementById('analyticsStartDate').value = formatDateForInput(weekAgo);
}

/**
 * Carga los datos de analytics
 */
async function loadAnalytics() {
    const siteId = document.getElementById('analyticsSiteFilter').value;
    const startDate = document.getElementById('analyticsStartDate').value;
    const endDate = document.getElementById('analyticsEndDate').value;
    
    if (!siteId) {
        showToast('Por favor selecciona un sitio', 'warning');
        return;
    }
    
    try {
        const dashboard = document.getElementById('analyticsDashboard');
        dashboard.style.display = 'none';
        
        // Cargar resumen
        const summaryResponse = await AnalyticsAPI.getSummary(siteId, startDate, endDate);
        const summary = summaryResponse.data || summaryResponse;
        
        // Cargar eventos
        const eventsParams = { siteId, limit: 100 };
        if (startDate) eventsParams.startDate = startDate;
        if (endDate) eventsParams.endDate = endDate;
        
        const eventsResponse = await AnalyticsAPI.getEvents(eventsParams);
        const events = eventsResponse.data || eventsResponse;
        
        // Renderizar datos
        renderAnalyticsSummary(summary);
        renderEventTypesChart(summary);
        renderRecentEvents(events);
        renderEventsTable(events);
        
        dashboard.style.display = 'block';
    } catch (error) {
        showToast('Error al cargar analytics: ' + error.message, 'error');
    }
}

/**
 * Renderiza el resumen de analytics
 */
function renderAnalyticsSummary(summary) {
    document.getElementById('analyticsTotalEvents').textContent = 
        (summary.summary?.totalEvents || 0).toLocaleString();
    document.getElementById('analyticsUniqueSessions').textContent = 
        (summary.summary?.uniqueSessions || 0).toLocaleString();
}

/**
 * Renderiza el gráfico de tipos de eventos
 */
function renderEventTypesChart(summary) {
    const container = document.getElementById('eventTypesChart');
    const eventTypeCounts = summary.summary?.eventTypeCounts || {};
    
    if (Object.keys(eventTypeCounts).length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No hay datos de eventos</p>';
        return;
    }
    
    const total = Object.values(eventTypeCounts).reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...Object.values(eventTypeCounts));
    
    const eventTypeLabels = {
        'click': 'Clics',
        'view': 'Vistas',
        'scroll': 'Scroll',
        'submit': 'Envíos',
        'hover': 'Hover',
        'download': 'Descargas',
        'share': 'Compartidos',
        'search': 'Búsquedas',
        'purchase': 'Compras',
        'signup': 'Registros',
        'custom': 'Personalizado'
    };
    
    container.innerHTML = Object.entries(eventTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => {
            const percentage = total > 0 ? (count / total * 100) : 0;
            const barWidth = maxCount > 0 ? (count / maxCount * 100) : 0;
            const label = eventTypeLabels[type] || type;
            
            return `
                <div class="event-type-item">
                    <span class="event-type-label">${label}</span>
                    <div class="event-type-bar">
                        <div class="event-type-fill" style="width: ${barWidth}%"></div>
                    </div>
                    <span class="event-type-count">${count}</span>
                </div>
            `;
        }).join('');
}

/**
 * Renderiza los eventos recientes
 */
function renderRecentEvents(events) {
    const container = document.getElementById('recentEventsList');
    
    if (!events || events.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No hay eventos recientes</p>';
        return;
    }
    
    const recentEvents = events.slice(0, 10);
    
    const eventTypeLabels = {
        'click': 'Clic',
        'view': 'Vista',
        'scroll': 'Scroll',
        'submit': 'Envío',
        'hover': 'Hover',
        'download': 'Descarga',
        'share': 'Compartir',
        'search': 'Búsqueda',
        'purchase': 'Compra',
        'signup': 'Registro'
    };
    
    container.innerHTML = recentEvents.map(event => {
        const typeLabel = eventTypeLabels[event.eventType] || event.eventType;
        const timestamp = new Date(event.timestamp);
        const timeAgo = getTimeAgo(timestamp);
        const device = event.device?.type || 'unknown';
        
        return `
            <div class="recent-event-item">
                <div class="recent-event-icon">
                    <i class="fas fa-${getEventIcon(event.eventType)}"></i>
                </div>
                <div class="recent-event-info">
                    <div class="recent-event-type">${typeLabel}</div>
                    <div class="recent-event-meta">${escapeHtml(event.elementClass || event.elementId || 'N/A')} • ${device}</div>
                </div>
                <div class="recent-event-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

/**
 * Renderiza la tabla de eventos
 */
function renderEventsTable(events) {
    const tbody = document.getElementById('eventsTableBody');
    
    if (!events || events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No hay eventos registrados</td></tr>';
        return;
    }
    
    const eventTypeLabels = {
        'click': 'Clic',
        'view': 'Vista',
        'scroll': 'Scroll',
        'submit': 'Envío',
        'hover': 'Hover',
        'download': 'Descarga',
        'share': 'Compartir',
        'search': 'Búsqueda',
        'purchase': 'Compra',
        'signup': 'Registro',
        'custom': 'Custom'
    };
    
    tbody.innerHTML = events.map(event => {
        const typeLabel = eventTypeLabels[event.eventType] || event.eventType;
        const timestamp = new Date(event.timestamp);
        const formattedDate = timestamp.toLocaleString('es-CO');
        const device = event.device?.type || 'N/A';
        const element = event.elementId || event.elementClass || 'N/A';
        const page = event.pageUrl ? extractPageName(event.pageUrl) : 'N/A';
        
        return `
            <tr>
                <td><span class="badge badge-primary">${typeLabel}</span></td>
                <td>${escapeHtml(element.substring(0, 30))}${element.length > 30 ? '...' : ''}</td>
                <td>${escapeHtml(page)}</td>
                <td><span class="badge badge-info">${device}</span></td>
                <td>${formattedDate}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Limpia eventos antiguos
 */
async function cleanupEvents() {
    const days = prompt('¿Cuántos días de eventos deseas conservar?', '90');
    
    if (!days || isNaN(days) || days < 1) {
        return;
    }
    
    if (!confirm(`¿Estás seguro de que deseas eliminar todos los eventos anteriores a ${days} días?`)) {
        return;
    }
    
    try {
        const result = await AnalyticsAPI.cleanupOldEvents(days);
        showToast(result.message || 'Eventos eliminados correctamente', 'success');
        loadAnalytics(); // Recargar datos
    } catch (error) {
        showToast('Error al limpiar eventos: ' + error.message, 'error');
    }
}

// Funciones de utilidad para analytics

function getEventIcon(eventType) {
    const icons = {
        'click': 'mouse-pointer',
        'view': 'eye',
        'scroll': 'arrows-alt-v',
        'submit': 'paper-plane',
        'hover': 'cursor',
        'download': 'download',
        'share': 'share-alt',
        'search': 'search',
        'purchase': 'shopping-cart',
        'signup': 'user-plus'
    };
    return icons[eventType] || 'bolt';
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

function extractPageName(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname || '/';
    } catch {
        return url || '/';
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `hace ${days}d`;
    if (hours > 0) return `hace ${hours}h`;
    if (minutes > 0) return `hace ${minutes}m`;
    return 'ahora';
}

// Event listeners
document.getElementById('loadAnalyticsBtn').addEventListener('click', loadAnalytics);
document.getElementById('cleanupEventsBtn').addEventListener('click', cleanupEvents);
