import mongoose, { Schema } from 'mongoose'

const ProductionComponentSchema = new Schema({
  productId:   { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  ref:         { type: String, required: true },
  name:        { type: String, required: true },
  quantity:    { type: Number, required: true },
  addedAt:     { type: Date, default: Date.now },
  addedBy:     { type: String },
})

const ProductionSchema = new Schema({
  companyId:   { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  ref:         { type: String, required: true },
  name:        { type: String, required: true },
  description: { type: String },
  status:      { type: String, enum: ['EN_COURS', 'TERMINE', 'ARCHIVE'], default: 'EN_COURS' },
  components:  [ProductionComponentSchema],
  notes:       { type: String },
}, { timestamps: true })

ProductionSchema.index({ companyId: 1, ref: 1 }, { unique: true })

export default mongoose.models.Production || mongoose.model('Production', ProductionSchema)