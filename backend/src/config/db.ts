import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    console.log('DB connected');
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {});
        console.log('MongoDB connected successfully');
    } catch (err: any) {
        console.error(`fffError: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};
