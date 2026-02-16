// Product Model - For catalog items linked to a specific site
const mongoose = require('mongoose');
const seoSchema = require('./seo.schema'); // Importar el esquema de SEO

const productSchema = new mongoose.Schema({
  // Site association - each product belongs to a specific site
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'COP']
  },
  category: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Bloque de SEO para la página de cada producto
  seo: seoSchema,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for efficient queries by site
productSchema.index({ siteId: 1, isActive: 1 });
productSchema.index({ siteId: 1, category: 1 });

module.exports = mongoose.model('Product', productSchema);
