import mongoose, { Schema } from 'mongoose'

const OrderItemSchema = new Schema({
  productId:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:   { type: Number, required: true },
  unitPrice:  { type: Number, required: true },
})

const OrderSchema = new Schema({
  companyId:  { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  status:     { type: String, enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
  items:      [OrderItemSchema],
  totalPrice: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)