import mongoose, { Schema } from 'mongoose'

const InvoiceItemSchema = new Schema({
  description: { type: String, required: true },
  quantity:    { type: Number, required: true },
  unitPrice:   { type: Number, required: true },
})

const InvoiceSchema = new Schema({
  companyId:     { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  orderId:       { type: Schema.Types.ObjectId, ref: 'Order', default: null },
  customerId:    { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
  productionId:  { type: Schema.Types.ObjectId, ref: 'Production', default: null },
  invoiceNumber: { type: String, required: true, unique: true },
  customerName:  { type: String, required: true },
  customerEmail: { type: String },
  items:         [InvoiceItemSchema],
  amount:        { type: Number, required: true }, // toujours HT
  status:        { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'DRAFT' },
  dueDate:       { type: Date },
  paidAt:        { type: Date },
  notes:         { type: String },
}, { timestamps: true })

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema)