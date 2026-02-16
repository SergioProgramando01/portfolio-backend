# Backend API - Multi-Site Management Platform

## Descripción General

Este proyecto es una **API Backend** construida con **Express.js** y **MongoDB**, diseñada para desplegarse en **Netlify** como una plataforma serverless. Su propósito principal es gestionar múltiples sitios web (landing pages y catálogos de productos) desde una única aplicación.

---

## Características Principales

### 🏗️ Arquitectura

- **Servidor**: Express.js con Node.js
- **Base de Datos**: MongoDB (Mongoose ODM)
- **Despliegue**: Netlify Functions (serverless)
- **Seguridad**: Helmet, CORS, validación de datos

### 🌐 Gestión de Sitios Múltiples

La API soporta dos tipos de sitios:

| Tipo | Descripción |
|------|-------------|
| `CATALOG` | Catálogos de productos con gestión de inventario |
| `LANDING_PAGE` | Páginas de aterrizaje con bloques de contenido flexibles |

Cada sitio incluye:
- Nombre, dominio único y descripción
- Personalización de marca (colores, logo, tipografía)
- Integraciones con herramientas de análisis (Google Tag Manager, Google Analytics, Meta Pixel)
- Configuración SEO completa
- Sistema de blog opcional

---

## Modelos de Datos

### 1. Site (Sitio)
Gestión central de sitios web con configuración de marca, integraciones y SEO.

```javascript
{
  name: String,           // Nombre del sitio
  type: String,           // 'CATALOG' | 'LANDING_PAGE'
  domain: String,         // Dominio único
  description: String,
  branding: {
    logoUrl, primaryColor, secondaryColor,
    fontFamily, backgroundColor, accentColor
  },
  integrations: {
    googleTagManagerId, googleAnalyticsId, metaPixelId
  },
  hasBlog: Boolean,
  seo: { title, description, keywords, ogImage, canonicalUrl },
  isActive: Boolean
}
```

### 2. Product (Producto)
Catálogo de productos vinculado a un sitio específico.

```javascript
{
  siteId: ObjectId,       // Referencia al Site
  name: String,
  description: String,
  price: Number,
  currency: String,       // 'USD' | 'EUR' | 'COP'
  category: String,
  imageUrl: String,
  stock: Number,
  sku: String,
  seo: { title, description, keywords, ogImage },
  isActive: Boolean
}
```

### 3. ContentBlock (Bloque de Contenido)
Bloques flexibles para construir landing pages dinámicamente.

**Tipos de bloques disponibles:**
- `hero` - Sección principal/hero
- `features` - Características
- `testimonials` - Testimonios
- `cta` - Llamada a la acción
- `gallery` - Galería de imágenes
- `text` - Texto enriquecido
- `video` - Video embebido
- `faq` - Preguntas frecuentes
- `contact` - Formulario de contacto
- `custom` - Bloque personalizado

```javascript
{
  siteId: ObjectId,
  title: String,
  data: Mixed,           // Estructura flexible según tipo
  type: String,          // Tipo de bloque
  order: Number,         // Orden de visualización
  isActive: Boolean
}
```

### 4. BlogPost (Entrada de Blog)
Sistema de blog para sitios que lo requieran.

```javascript
{
  siteId: ObjectId,
  title: String,
  slug: String,
  content: String,
  author: String,
  featuredImage: String,
  excerpt: String,
  tags: [String],
  status: String,        // 'draft' | 'published' | 'archived'
  seo: { title, description, keywords, ogImage }
}
```

### 5. AnalyticsEvent (Evento de Análisis)
Seguimiento de interacciones de usuarios en los sitios.

```javascript
{
  siteId: ObjectId,
  eventType: String,     // 'click' | 'view' | 'scroll' | 'submit' | 'hover' | 'download' | 'share' | 'search' | 'purchase' | 'signup' | 'custom'
  elementId: String,
  elementClass: String,
  elementTag: String,
  sessionId: String,
  userId: ObjectId,
  pageUrl: String,
  pageTitle: String,
  referrer: String,
  timestamp: Date,
  metadata: Mixed,
  device: {
    type: String,        // 'desktop' | 'tablet' | 'mobile'
    browser, os, screenWidth, screenHeight
  },
  location: { country, region, city }
}
```

---

## Rutas API

### Sites (Sitios)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/sites` | Listar todos los sitios |
| GET | `/api/sites/:id` | Obtener un sitio específico |
| POST | `/api/sites` | Crear nuevo sitio |
| PUT | `/api/sites/:id` | Actualizar sitio |
| DELETE | `/api/sites/:id` | Eliminar sitio |

### Products (Productos)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar productos (filtrar por `siteId`) |
| GET | `/api/products/:id` | Obtener producto específico |
| POST | `/api/products` | Crear nuevo producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |

### Content (Contenido)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/content` | Listar bloques de contenido |
| GET | `/api/content/:id` | Obtener bloque específico |
| POST | `/api/content` | Crear nuevo bloque |
| PUT | `/api/content/:id` | Actualizar bloque |
| DELETE | `/api/content/:id` | Eliminar bloque |

### Blog
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/blog` | Listar entradas (filtrar por `siteId`, `status`) |
| GET | `/api/blog/:id` | Obtener entrada específica |
| POST | `/api/blog` | Crear nueva entrada |
| PUT | `/api/blog/:id` | Actualizar entrada |
| DELETE | `/api/blog/:id` | Eliminar entrada |

### Analytics (Análisis)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/events` | Registrar nuevo evento |
| GET | `/api/events` | Listar eventos (filtros: `siteId`, `eventType`, `sessionId`, fechas) |
| GET | `/api/events/summary` | Obtener resumen deanalytics |
| GET | `/api/events/element` | Obtener eventos por elemento |
| DELETE | `/api/events/cleanup` | Eliminar eventos antiguos |

---

## Estructura del Proyecto

```
LP_DEMO_1/
├── .env                    # Variables de entorno
├── .gitignore              # Archivos ignorados por Git
├── netlify.toml            # Configuración de Netlify
├── package.json            # Dependencias y scripts
├── public/
│   └── index.html          # Frontend estático (SPA)
├── netlify/
│   └── functions/          # Netlify Functions (serverless)
│       ├── blog.js
│       ├── content.js
│       ├── events.js
│       ├── products.js
│       └── sites.js
└── src/
    ├── api/
    │   ├── controllers/    # Lógica de negocio
    │   │   ├── analytics.controller.js
    │   │   ├── blog.controller.js
    │   │   ├── content.controller.js
    │   │   ├── products.controller.js
    │   │   └── sites.controller.js
    │   ├── models/         # Modelos de Mongoose
    │   │   ├── analytics.model.js
    │   │   ├── blog.model.js
    │   │   ├── content.model.js
    │   │   ├── product.model.js
    │   │   ├── seo.schema.js
    │   │   └── site.model.js
    │   └── routes/         # Definición de rutas
    │       ├── blog.routes.js
    │       ├── content.routes.js
    │       ├── events.routes.js
    │       ├── index.js
    │       ├── products.routes.js
    │       └── sites.routes.js
    └── config/
        └── database.js     # Conexión a MongoDB
```

---

## Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- MongoDB (local o Atlas)
- Cuenta de Netlify (para despliegue)

### Variables de Entorno (.env)

```env
# Conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/tu-database

# Configuración del servidor
PORT=3000
NODE_ENV=development

# (Opcional) Credenciales de producción
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
```

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start
```

---

## Despliegue en Netlify

El proyecto está configurado para desplegarse automáticamente en Netlify:

1. **Conectar repositorio** en Netlify
2. **Configurar variables de entorno** en Netlify Dashboard
3. **Build command**: `npm run build` (configurado en netlify.toml)
4. **Functions directory**: `netlify/functions`

### Redirects Configurados (netlify.toml)

- `/*` → `/index.html` (SPA)
- `/api/*` → `/.netlify/functions/:splat` (API)

---

## Tecnologías Utilizadas

| Tecnología | Propósito |
|------------|-----------|
| Express.js | Framework web/server |
| Mongoose | ODM para MongoDB |
| Netlify Functions | Serverless deployment |
| Helmet | Headers de seguridad |
| CORS | Control de acceso cruzado |
| Morgan | Logging de peticiones |
| Dotenv | Variables de entorno |

---

## Casos de Uso

### 1. Crear un Catálogo de Productos
```bash
# 1. Crear sitio tipo CATALOG
POST /api/sites
{ "name": "Mi Tienda", "type": "CATALOG", "domain": "mitienda.com" }

# 2. Agregar productos
POST /api/products
{ "siteId": "...", "name": "Producto 1", "price": 99.99, "currency": "USD" }
```

### 2. Crear una Landing Page
```bash
# 1. Crear sitio tipo LANDING_PAGE
POST /api/sites
{ "name": "Landing Page", "type": "LANDING_PAGE", "domain": "micampana.com" }

# 2. Agregar bloques de contenido
POST /api/content
{ "siteId": "...", "title": "Hero", "type": "hero", "data": {...} }
```

### 3. Registrar Eventos de Analytics
```javascript
// Desde el frontend
fetch('/api/events', {
  method: 'POST',
  body: JSON.stringify({
    siteId: '...',
    eventType: 'click',
    elementId: 'btn-cta',
    sessionId: 'abc123',
    pageUrl: '/',
    pageTitle: 'Inicio'
  })
});
```

---

## Licencia

MIT

---

## Autor

Desarrollado como parte del proyecto Sermultimedia.
