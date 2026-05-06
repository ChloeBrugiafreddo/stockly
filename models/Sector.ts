import mongoose, { Schema } from 'mongoose'

const SectorSchema = new Schema({
  name:        { type: String, required: true },
  description: { type: String },
  modules:     [{ type: String }],
  isSystem:    { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Sector || mongoose.model('Sector', SectorSchema)