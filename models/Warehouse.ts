import mongoose, { Schema } from 'mongoose'

const WarehouseSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name:      { type: String, required: true },
  location:  { type: String },
  capacity:  { type: Number },
}, { timestamps: true })

export default mongoose.models.Warehouse || mongoose.model('Warehouse', WarehouseSchema)