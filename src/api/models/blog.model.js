// Blog Model - Blog posts for each site
const mongoose = require('mongoose');
const seoSchema = require('./seo.schema');

const blogPostSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Equipo' },
  featuredImage: { type: String },
  excerpt: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  // Incrustar el bloque de SEO
  seo: seoSchema
}, { timestamps: true });

// Compound index for site and slug (unique per site)
blogPostSchema.index({ siteId: 1, slug: 1 }, { unique: true });
blogPostSchema.index({ siteId: 1, status: 1 });
blogPostSchema.index({ siteId: 1, createdAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
