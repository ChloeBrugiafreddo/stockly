import mongoose, { Schema } from 'mongoose'

const SupplierSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name:      { type: String, required: true },
  email:     { type: String },
  phone:     { type: String },
  address:   { type: String },
  country:   { type: String },
}, { timestamps: true })

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema)