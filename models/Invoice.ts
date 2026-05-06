import mongoose, { Schema } from 'mongoose'

const InvoiceSchema = new Schema({
  orderId:       { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  companyId:     { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  amount:        { type: Number, required: true },
  taxAmount:     { type: Number, default: 0 },
  status:        { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'DRAFT' },
  dueDate:       { type: Date },
  paidAt:        { type: Date },
}, { timestamps: true })

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema)