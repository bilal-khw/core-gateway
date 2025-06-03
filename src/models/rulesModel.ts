import { Schema, model, Document } from 'mongoose';

export interface IRule extends Document {
  type: string;
  rules: any;
}

const ruleSchema = new Schema<IRule>({
  type: { type: String, required: true, unique: true },
  rules: { type: Schema.Types.Mixed, required: true }
});

export default model<IRule>('Rule', ruleSchema);
