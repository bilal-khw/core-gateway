import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  blu_id: string;//internal system id
  user_id?: string;// external system id
  vendor_name?: string;
  client_login_name?: string;
  email?: string;
  phone_number?: string;
  KYC_status?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  card_number?: string[];
  supported_banks?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    blu_id: { type: String, unique: true, required: true },
    user_id: { type: String, unique: true, required: true }, // external system id
    vendor_name: { type: String },
    client_login_name: { type: String },
    email: { type: String },
    phone_number: { type: String, unique: true, required: true }, // unique phone number
    KYC_status: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
    card_number: [{ type: String }],
    supported_banks: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
