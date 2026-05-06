import mongoose, { Schema } from 'mongoose'

const RoleSchema = new Schema({
  companyId:   { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name:        { type: String, required: true },
  permissions: [{ type: String }],
  // Permissions disponibles :
  // stock:read, stock:write, stock:delete
  // orders:read, orders:write
  // invoices:read, invoices:write
  // suppliers:read, suppliers:write
  // customers:read, customers:write
  // users:manage
}, { timestamps: true })

export default mongoose.models.Role || mongoose.model('Role', RoleSchema)