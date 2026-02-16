// ContentBlock Model - Flexible content sections for landing pages
const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema({
  // Site association - each content block belongs to a specific site
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Flexible data field using Mixed type for any structure
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['hero', 'features', 'testimonials', 'cta', 'gallery', 'text', 'video', 'faq', 'contact', 'custom'],
    default: 'custom'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

contentBlockSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for efficient queries by site and order
contentBlockSchema.index({ siteId: 1, order: 1 });
contentBlockSchema.index({ siteId: 1, isActive: 1 });

module.exports = mongoose.model('ContentBlock', contentBlockSchema);
