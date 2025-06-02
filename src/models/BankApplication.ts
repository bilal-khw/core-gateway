import mongoose, { Document, Schema } from 'mongoose';

export interface IBankApplication extends Document {
  application_name: string;
  supported_banks: string[];
  is_active: boolean;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const bankAppSchema = new Schema<IBankApplication>(
  {
    application_name: { type: String, required: true },
    supported_banks: { type: [String], required: true },
    is_active: { type: Boolean, required: true },
    priority: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IBankApplication>('BankApplication', bankAppSchema);
