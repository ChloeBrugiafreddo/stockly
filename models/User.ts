import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema({
  companyId:    { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  firstname:    { type: String, required: true },
  lastname:     { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roleId:       { type: Schema.Types.ObjectId, ref: 'Role' },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)