import mongoose, { Schema } from 'mongoose'

const StockMovementSchema = new Schema({
  productId:     { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId:   { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  movementType:  { type: String, enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'], required: true },
  quantity:      { type: Number, required: true },
  reason:        { type: String },
  referenceId:   { type: Schema.Types.ObjectId, default: null },
  referenceType: { type: String, enum: ['order', 'purchase_order', 'manual', null], default: null },
  // Module scan (v5.x)
  scanType:      { type: String, enum: ['qrcode', 'barcode', 'serial', null], default: null },
  scanValue:     { type: String },
}, { timestamps: true })

export default mongoose.models.StockMovement || mongoose.model('StockMovement', StockMovementSchema)