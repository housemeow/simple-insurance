import mongoose, { Schema, Document } from 'mongoose';

export interface IPolicyholder extends Document {
    code: string;
    name: string;
    registration_date: Date;
    introducer_code: string;
    l?: IPolicyholder;
    r?: IPolicyholder;
    parents: string;
}

const PolicyholderSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    registration_date: { type: Date, default: Date.now },
    introducer_code: { type: String },
    l: { type: Schema.Types.ObjectId, ref: 'Policyholder' },
    r: { type: Schema.Types.ObjectId, ref: 'Policyholder' },
    parents: { type: String }
});

export const Policyholder = mongoose.model<IPolicyholder>('Policyholder', PolicyholderSchema);
