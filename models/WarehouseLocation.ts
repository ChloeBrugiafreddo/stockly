import mongoose, { Schema } from 'mongoose'

const WarehouseLocationSchema = new Schema({
  warehouseId:  { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  label:        { type: String, required: true }, // ex: "Étagère A3 - Rangée 2"
  description:  { type: String },
}, { timestamps: true })

export default mongoose.models.WarehouseLocation || mongoose.model('WarehouseLocation', WarehouseLocationSchema)