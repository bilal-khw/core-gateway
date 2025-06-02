import { Schema, model, Document } from 'mongoose';

export interface IUserDevice extends Document {
  device_info: any;
}

const userDeviceSchema = new Schema<IUserDevice>({
  device_info: Schema.Types.Mixed
});

export default model<IUserDevice>('UserDevice', userDeviceSchema);
