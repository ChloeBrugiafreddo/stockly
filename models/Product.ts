import mongoose, { Schema } from 'mongoose'

const ProductSchema = new Schema({
  companyId:   { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  sectorId:    { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  categoryId:  { type: Schema.Types.ObjectId, ref: 'Category' },
  supplierId:  { type: Schema.Types.ObjectId, ref: 'Supplier' },
  sku:         { type: String, required: true },
  barcode:     { type: String },         // EAN-13 ou QR (module scan v5.x)
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, default: 0 },
  status:      { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
}, { timestamps: true })

// SKU unique par entreprise
ProductSchema.index({ companyId: 1, sku: 1 }, { unique: true })

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)