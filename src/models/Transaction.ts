import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
  invoice_reference?: string;
  transaction_id: string;
  user_id: Types.ObjectId;
  vendor_id: Types.ObjectId;
  operation_unique_id: string;
  matched_with: Types.ObjectId
  points: number;
  amount: number;
  currency: string;
  transaction_time: Date;
  type: 'Deposit' | 'Withdraw';
  application_used?: string;
  status: 'Paid' | 'Pending' | 'Canceled';
}

const transactionSchema = new Schema<ITransaction>(
  {
    //add all missing fields
    operation_unique_id: { type: String, required: true },
    matched_with: { type: Schema.Types.ObjectId, required: true },
    points: { type: Number, required: true, default: 0 },
    invoice_reference: { type: String },
    transaction_id: { type: String, unique: true, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true },
    vendor_id: { type: Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    type: { type: String, enum: ['Deposit', 'Withdraw'], required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Canceled'], required: true, default: "Pending" },
    application_used: { type: String },
    // description: { type: String },
    // note: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
