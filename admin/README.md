# Panel de Control - Admin Panel

Este es el panel de administración del backend. Proporciona una interfaz gráfica para gestionar todas las funcionalidades del sistema.

## Estructura

```
admin/
├── index.html          # Dashboard principal
├── css/
│   └── styles.css      # Estilos minimalistas
└── js/
    ├── app.js          # Lógica principal
    ├── api.js          # Conexión con APIs
    ├── sites.js        # Gestión de sitios
    ├── products.js     # Gestión de productos
    ├── content.js      # Gestión de contenido
    └── analytics.js    # Estadísticas y analytics
```

## Cómo funciona

Este proyecto es un backend serverless desplegado en **Netlify**:

### Backend (netlify/functions/)
- Funciones serverless de Node.js
- Desplegado en: https://backend-catalogo.netlify.app/
- Base de datos: MongoDB (Atlas)

### Frontend Admin (admin/)
- Panel de control HTML/CSS/JS vanilla
- Se conecta al backend via REST API de Netlify
- Permite gestionar contenido, productos, sitios y ver analytics

## Endpoints disponibles

El backend está desplegado en: **https://backend-catalogo.netlify.app/**

- `GET /sites` - Listar sitios
- `POST /sites` - Crear sitio
- `GET /products` - Listar productos
- `POST /products` - Crear producto
- `GET /content` - Listar contenido
- `POST /content` - Crear contenido
- `GET /blog` - Listar posts del blog
- `POST /blog` - Crear post
- `GET /events` - Listar eventos
- `POST /events` - Crear evento
- `GET /analytics/summary` - Obtener analytics

## Cómo usarlo

### Panel de Administración

1. Abre el archivo [`admin/index.html`](admin/index.html) en tu navegador web
2. El panel se conectará automáticamente al backend desplegado en Netlify

### API Directamente

Puedes hacer requests directos a la API:

```bash
# Ejemplo: obtener sitios
curl https://backend-catalogo.netlify.app/sites

# Ejemplo: crear producto
curl -X POST https://backend-catalogo.netlify.app/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Producto 1", "price": 100}'
```

## Despliegue en Netlify

El proyecto ya está configurado para Netlify:

1. Conecta tu repositorio a Netlify
2. Netlify detectará la configuración en `netlify.toml`
3. Las funciones serverless están en `netlify/functions/`
4. Configura las variables de entorno en Netlify Dashboard:
   - `MONGODB_URI` - Connection string de MongoDB Atlas

### Variables de entorno requeridas

- `MONGODB_URI` - MongoDB Atlas connection string (ej: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

## Desarrollo local (opcional)

Si necesitas desarrollar localmente:

1. Instala Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Inicia el entorno local:
```bash
netlify dev
```

3. El backend local estará en: http://localhost:8888

## Requisitos

- Backend corriendo en Netlify (ya desplegado)
- Conexión a MongoDB Atlas configurada en Netlify
- Todas las rutas de API disponibles

## Notas

- El proyecto está diseñado exclusivamente para despliegue en Netlify
- No es un servidor Express tradicional
- Usa funciones serverless para manejar las APIs
