import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {});
        console.log('MongoDB connected successfully');
    } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};
