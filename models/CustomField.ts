import mongoose, { Schema } from 'mongoose'

const CustomFieldSchema = new Schema({
  companyId:   { type: Schema.Types.ObjectId, ref: 'Company', default: null },
  sectorId:    { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  entity:      { type: String, enum: ['product', 'order', 'customer', 'supplier'], required: true },
  fieldName:   { type: String, required: true },
  fieldLabel:  { type: String, required: true },
  fieldType:   { type: String, enum: ['text', 'number', 'date', 'boolean', 'array', 'select'], required: true },
  options:     [{ type: String }],   // si fieldType = 'select'
  isRequired:  { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.CustomField || mongoose.model('CustomField', CustomFieldSchema)