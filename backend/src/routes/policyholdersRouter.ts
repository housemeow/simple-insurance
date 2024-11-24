import { Counter } from '@/models/counter';
import { IPolicyholder, Policyholder } from '@/models/policyholder';
import { Request, Response, NextFunction, Router } from 'express';
import createError from 'http-errors';

const router = Router();

export const asyncErrorHandler = (fn: (req: Request, res: Response) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next);
};

router.get('/', asyncErrorHandler(async (req, res) => {
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
}))

router.get('/:code/top', asyncErrorHandler(async (req, res) => {
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
}))

router.post('/', asyncErrorHandler(async (req, res) => {
  const {
    name,
    introducer_code,
  } = req.body

  if (!introducer_code) {
    const anyPolicyholder = await Policyholder.findOne();
    if (anyPolicyholder) {
      return res.status(400).json({ message: 'root has been created.' });
    }

    const counter = await Counter.findOneAndUpdate(
      { name: 'policyholder' },
      { $inc: { serial: 1 } },
      { new: true, upsert: true }
    );
    const code = counter.serial.toString().padStart(8, '0');

    const root = new Policyholder({
      code,
      name,
      registration_date: new Date(),
      introducer_code: '',
      parents: '',
    });
    await root.save();
    return res.json(root);
  }

  res.send(createError[501])
}))

export default router;
