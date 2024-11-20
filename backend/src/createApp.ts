import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import createError, { HttpError } from 'http-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import rootRouter from '@/routes'; // Import the root router

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
    
    // catch 404 and forward to error handler
    app.use((req: Request, res: Response, next: NextFunction) => {
        next(createError(404));
    });
    
    // error handler
    app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
    
    return app;
}
