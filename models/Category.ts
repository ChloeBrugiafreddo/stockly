import mongoose, { Schema } from 'mongoose'

const CategorySchema = new Schema({
  sectorId:  { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  name:      { type: String, required: true },
  parentId:  { type: Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true })

export default mongoose.models.Category || mongoose.model('Category', CategorySchema)