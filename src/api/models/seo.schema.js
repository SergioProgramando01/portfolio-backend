// SEO Schema - Reusable schema for SEO optimization across all pages
const mongoose = require('mongoose');

// Este es un esquema reutilizable, NO un modelo.
// Centraliza todos los campos de SEO para cualquier página.
const seoSchema = new mongoose.Schema({
  metaTitle: { type: String, required: true, trim: true },
  metaDescription: { type: String, required: true, trim: true },
  h1: { type: String, required: true, trim: true },
  ogTitle: { type: String, trim: true },
  ogDescription: { type: String, trim: true },
  ogImage: { type: String, trim: true }
}, { _id: false });

module.exports = seoSchema;
