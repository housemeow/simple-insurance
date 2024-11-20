import { Router } from 'express';
import policyholdersRouter from '@/routes/policyholdersRouter';

const router = Router();

router.use('/policyholders', policyholdersRouter);

export default router;
