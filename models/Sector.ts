import mongoose, { Schema } from 'mongoose'

const SectorSchema = new Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String },
  isSystem:    { type: Boolean, default: true },

  // Thème visuel
  theme: {
    primary:      { type: String, default: '#3b82f6' },
    primaryLight: { type: String, default: '#eff6ff' },
    primaryDark:  { type: String, default: '#1d4ed8' },
    secondary:    { type: String, default: '#6366f1' },
    accent:       { type: String, default: '#f59e0b' },
    accentLight:  { type: String, default: '#fffbeb' },
  },

  // Vocabulaire
  vocab: {
    product:     { type: String, default: 'Produit' },
    products:    { type: String, default: 'Produits' },
    production:  { type: String, default: 'Production' },
    productions: { type: String, default: 'Productions' },
    stock:       { type: String, default: 'Stock' },
  },

  // Icônes emoji
  icons: {
    product:    { type: String, default: '📦' },
    production: { type: String, default: '🏭' },
    supplier:   { type: String, default: '🚚' },
    customer:   { type: String, default: '👤' },
  },

  // Catégories par défaut
  defaultCategories: [{ type: String }],
}, { timestamps: true })

export default mongoose.models.Sector || mongoose.model('Sector', SectorSchema)