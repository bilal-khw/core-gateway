import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  invoice_reference?: string;
  transaction_id: string;
  user_id: string;
  vendor_id: string;
  operation_unique_id: string;
  matched_with: string
  points: number;
  amount: number;
  currency: string;
  transaction_time: Date;
  transaction_type: 'Deposit' | 'Withdraw';
  payment_system_name?: string;
  status: 'Paid' | 'Pending' | 'Canceled';
  description?: string;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    //add all missing fields
    operation_unique_id: { type: String, required: true },
    matched_with: { type: String, required: true },
    points: { type: Number, required: true, default: 0 },
    invoice_reference: { type: String },
    transaction_id: { type: String, unique: true, required: true },
    user_id: { type: String, required: true },
    vendor_id: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    transaction_time: { type: Date, required: true },
    transaction_type: { type: String, enum: ['Deposit', 'Withdraw'], required: true },
    payment_system_name: { type: String },
    status: { type: String, enum: ['Paid', 'Pending', 'Canceled'], required: true, default: "Pending" },
    description: { type: String },
    note: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
