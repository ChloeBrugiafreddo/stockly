import mongoose, { Schema } from 'mongoose'

const CustomerSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name:      { type: String, required: true },
  email:     { type: String },
  phone:     { type: String },
  address:   { type: String },
}, { timestamps: true })

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)