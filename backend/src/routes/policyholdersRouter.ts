import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const data = {
        code,
        name: '保戶姓名',
        registration_date: new Date(),
        introducer_code: '介紹人保戶編號',
        l: [
            {
                code: '左樹保戶編號',
                name: '左樹保戶姓名',
                registration_date: new Date(),
                introducer_code: '左樹介紹人保戶編號',
            },
        ],
        r: [
            {
                code: '右樹保戶編號',
                name: '右樹保戶姓名',
                registration_date: new Date(),
                introducer_code: '右樹介紹人保戶編號',
            },
        ],
    }

    res.json(data);
})

router.get('/:code/top', async (req: Request, res: Response) => {
    const code = req.params.code;

    const data = {
        code,
        name: '保戶姓名',
        registration_date: new Date(),
        introducer_code: '介紹人保戶編號',
        l: [
            {
                code: '左樹保戶編號',
                name: '左樹保戶姓名',
                registration_date: new Date(),
                introducer_code: '左樹介紹人保戶編號',
            },
        ],
        r: [
            {
                code: '右樹保戶編號',
                name: '右樹保戶姓名',
                registration_date: new Date(),
                introducer_code: '右樹介紹人保戶編號',
            },
        ],
    }

    res.json(data);
})

export default router;
