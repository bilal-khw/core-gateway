import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IVendor extends Document {
  vendor_name: string;
  // ID: string;
  vendor_tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  merchant_id: string;
  vendor_id: string;
  currency: string;
  callback_url: string;
  allowed_payment_systems: string[];
  allowed_withdrawals : number[];
  allowed_deposits : number[];
  createdAt?: Date;
  updatedAt?: Date;
}

const vendorSchema: Schema<IVendor> = new Schema({
  vendor_name: { type: String, required: true },
  vendor_id: { type: String, unique: true, required: true },
  vendor_tier: { type: String, enum: ['Platinum', 'Gold', 'Silver', 'Bronze'], required: true },
  merchant_id: { type: String, required: true },
  currency: { type: String, required: true, default: "IRR" },
  callback_url: { type: String, required: true },
  allowed_payment_systems: { type: [String], required: true },
  allowed_deposits: { type: [String], required: true },
  allowed_withdrawals: { type: [String], required: true }
}, { timestamps: true });

const Vendor: Model<IVendor> = mongoose.model<IVendor>('Vendor', vendorSchema);

export default Vendor;
