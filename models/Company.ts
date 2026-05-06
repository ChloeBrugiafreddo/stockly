import mongoose, { Schema } from 'mongoose'

const CompanySchema = new Schema({
  name:      { type: String, required: true },
  sectorId:  { type: Schema.Types.ObjectId, ref: 'Sector' },
  email:     { type: String },
  phone:     { type: String },
  address:   { type: String },
}, { timestamps: true })

export default mongoose.models.Company || mongoose.model('Company', CompanySchema)