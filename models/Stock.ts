import mongoose, { Schema } from 'mongoose'

const StockSchema = new Schema({
  productId:    { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId:  { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  locationId:   { type: Schema.Types.ObjectId, ref: 'WarehouseLocation' },
  quantity:     { type: Number, required: true, default: 0 },
  minimumStock: { type: Number, default: 0 },  // seuil alerte bas
  maximumStock: { type: Number, default: 0 },  // seuil surstock
}, { timestamps: true })

// Un produit ne peut être qu'une fois par emplacement
StockSchema.index({ productId: 1, warehouseId: 1, locationId: 1 }, { unique: true })

export default mongoose.models.Stock || mongoose.model('Stock', StockSchema)