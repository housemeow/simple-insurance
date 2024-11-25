import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import createError, { HttpError } from 'http-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import rootRouter from '@/routes'; // Import the root router
import { MongooseError } from 'mongoose';
import { setupSwagger } from '@/config/swagger'; // Import Swagger setup

export function createApp() {
    const app = express();

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cors());

    app.get('/', async (req: Request, res: Response) => {
        res.json({
            now: new Date().toISOString(),
        })
    })

    app.use('/api', rootRouter);

    // Setup Swagger
    setupSwagger(app);

    // catch 404 and forward to error handler
    app.use((req: Request, res: Response, next: NextFunction) => {
        next(createError(404));
    });

    // error handler
    app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof MongooseError) {
        return res.status(400).json({ message: err.message });
      }

      res.status(500).json({ message: err?.message || err });
    });

    return app;
}
