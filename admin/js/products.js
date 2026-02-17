/**
 * Products Module - Gestión de Productos
 */

let productsData = [];

/**
 * Carga todos los productos y los muestra en la tabla
 */
async function loadProducts() {
    try {
        showLoading('productsTableBody');
        
        // Cargar productos y sitios si es necesario
        if (!productsData.length) {
            productsData = await ProductsAPI.getAll();
        }
        
        if (!sitesData.length) {
            sitesData = await SitesAPI.getAll();
        }
        
        renderProductsTable();
    } catch (error) {
        showToast('Error al cargar productos: ' + error.message, 'error');
        renderEmptyState('products', true);
    }
}

/**
 * Renderiza la tabla de productos
 */
function renderProductsTable(filteredData = null) {
    const tbody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('productsEmpty');
    const data = filteredData || productsData;
    
    // Aplicar filtros adicionales
    const siteFilter = document.getElementById('productSiteFilter').value;
    let displayData = data;
    
    if (siteFilter) {
        displayData = data.filter(p => p.siteId === siteFilter || (p.siteId && p.siteId._id === siteFilter));
    }
    
    if (!displayData || displayData.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = displayData.map(product => {
        const site = getSiteName(product.siteId);
        const currencySymbol = getCurrencySymbol(product.currency);
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${product.imageUrl ? `<img src="${escapeHtml(product.imageUrl)}" alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : '<div style="width: 40px; height: 40px; background: var(--bg-tertiary); border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-box" style="color: var(--text-muted);"></i></div>'}
                        <strong>${escapeHtml(product.name)}</strong>
                    </div>
                </td>
                <td>${currencySymbol}${formatNumber(product.price)}</td>
                <td>${escapeHtml(product.category || '-')}</td>
                <td><span class="badge badge-${product.stock > 0 ? 'success' : 'danger'}">${product.stock}</span></td>
                <td>${escapeHtml(site)}</td>
                <td><span class="badge badge-${product.isActive ? 'success' : 'danger'}">${product.isActive ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="edit-btn" onclick="editProduct('${product._id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteProduct('${product._id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Muestra el modal para crear/editar producto
 */
function showProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');
    
    // Limpiar formulario
    form.reset();
    document.getElementById('productId').value = '';
    
    // Poblar select de sitios
    populateProductSiteSelect();
    
    if (productId) {
        const product = productsData.find(p => p._id === productId);
        if (product) {
            title.textContent = 'Editar Producto';
            populateProductForm(product);
        }
    } else {
        title.textContent = 'Nuevo Producto';
    }
    
    modal.classList.add('active');
}

/**
 * Rellena el formulario con los datos del producto
 */
function populateProductForm(product) {
    document.getElementById('productId').value = product._id || '';
    
    // El sitio puede ser un ID o un objeto
    const siteId = product.siteId && typeof product.siteId === 'object' ? product.siteId._id : product.siteId;
    document.getElementById('productSite').value = siteId || '';
    
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productPrice').value = product.price || 0;
    document.getElementById('productCurrency').value = product.currency || 'USD';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productSku').value = product.sku || '';
    document.getElementById('productImageUrl').value = product.imageUrl || '';
    document.getElementById('productDescription').value = product.description || '';
    
    // SEO
    if (product.seo) {
        document.getElementById('productSeoTitle').value = product.seo.title || '';
        document.getElementById('productSeoDescription').value = product.seo.description || '';
        document.getElementById('productSeoKeywords').value = product.seo.keywords ? product.seo.keywords.join(', ') : '';
    }
    
    document.getElementById('productIsActive').checked = product.isActive !== false;
}

/**
 * Pobla el select de sitios en el formulario de producto
 */
function populateProductSiteSelect() {
    const select = document.getElementById('productSite');
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
 * Cierra el modal de producto
 */
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
}

/**
 * Edita un producto existente
 */
function editProduct(productId) {
    showProductModal(productId);
}

/**
 * Elimina un producto
 */
async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await ProductsAPI.delete(productId);
        showToast('Producto eliminado correctamente', 'success');
        await loadProducts();
    } catch (error) {
        showToast('Error al eliminar producto: ' + error.message, 'error');
    }
}

/**
 * Guarda un producto (crear o actualizar)
 */
async function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    
    const productData = {
        siteId: document.getElementById('productSite').value,
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        currency: document.getElementById('productCurrency').value,
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value) || 0,
        sku: document.getElementById('productSku').value,
        imageUrl: document.getElementById('productImageUrl').value,
        description: document.getElementById('productDescription').value,
        seo: {
            title: document.getElementById('productSeoTitle').value,
            description: document.getElementById('productSeoDescription').value,
            keywords: document.getElementById('productSeoKeywords').value.split(',').map(k => k.trim()).filter(k => k)
        },
        isActive: document.getElementById('productIsActive').checked
    };
    
    try {
        if (productId) {
            await ProductsAPI.update(productId, productData);
            showToast('Producto actualizado correctamente', 'success');
        } else {
            await ProductsAPI.create(productData);
            showToast('Producto creado correctamente', 'success');
        }
        
        closeProductModal();
        await loadProducts();
    } catch (error) {
        showToast('Error al guardar producto: ' + error.message, 'error');
    }
}

// Inicializar eventos del formulario
document.getElementById('productForm').addEventListener('submit', saveProduct);

/**
 * Filtra productos por sitio
 */
function filterProductsBySite() {
    renderProductsTable();
}

/**
 * Obtiene los datos de productos (para uso externo)
 */
function getProductsData() {
    return productsData;
}

/**
 * Obtiene un producto por su ID
 */
function getProductById(productId) {
    return productsData.find(p => p._id === productId);
}

// Funciones de utilidad
function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'COP': '$'
    };
    return symbols[currency] || '$';
}

function formatNumber(num) {
    return num.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
