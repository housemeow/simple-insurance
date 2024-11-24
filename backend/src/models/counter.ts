import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
    name: string;
    serial: number;
}

const CounterSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    serial: { type: Number, default: 0 }
});

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);
