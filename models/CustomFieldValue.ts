import mongoose, { Schema } from 'mongoose'

const CustomFieldValueSchema = new Schema({
  customFieldId: { type: Schema.Types.ObjectId, ref: 'CustomField', required: true },
  entityId:      { type: Schema.Types.ObjectId, required: true },
  value:         { type: Schema.Types.Mixed },  // string | number | Date | string[]
}, { timestamps: true })

CustomFieldValueSchema.index({ customFieldId: 1, entityId: 1 }, { unique: true })

export default mongoose.models.CustomFieldValue || mongoose.model('CustomFieldValue', CustomFieldValueSchema)