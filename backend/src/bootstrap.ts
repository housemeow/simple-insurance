import dotenv from 'dotenv';
import { connectDB } from '@/config/db';

dotenv.config({ 
  path: ['.env.local', '.env']
});

connectDB();
