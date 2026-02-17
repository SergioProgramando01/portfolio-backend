// Site Model - Core model for multi-site management
const mongoose = require('mongoose');
const seoSchema = require('./seo.schema'); // Importar el esquema de SEO

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['CATALOG', 'LANDING_PAGE'] },
  domain: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  branding: {
    logoUrl: { type: String, trim: true },
    primaryColor: { type: String, trim: true, match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ },
    secondaryColor: { type: String, trim: true, match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ },
    fontFamily: { type: String, trim: true },
    backgroundColor: { type: String, trim: true, match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ },
    accentColor: { type: String, trim: true, match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ }
  },
  integrations: {
    googleTagManagerId: { type: String, trim: true },
    googleAnalyticsId: { type: String, trim: true },
    metaPixelId: { type: String, trim: true }
  },
  // Campo para activar/desactivar el blog por sitio
  hasBlog: {
    type: Boolean,
    default: false
  },
  // Bloque de SEO para la página de inicio del sitio
  seo: seoSchema,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);
