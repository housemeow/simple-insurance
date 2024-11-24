import { Counter } from '@/models/counter';
import { IPolicyholder, Policyholder } from '@/models/policyholder';
import { Request, Response, NextFunction, Router } from 'express';

const router = Router();

export const asyncErrorHandler = (fn: (req: Request, res: Response) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next);
};

async function getTree(parentNode: IPolicyholder, childrenDepth: number) {
  const nodes = await Policyholder.find({ parents: { $regex: `${parentNode.code}(/[^/]+){0,${childrenDepth - 1}}$` } }) as IPolicyholder[];

  const buildTree = (node: IPolicyholder, allNodes: IPolicyholder[]): any => {
    const leftNode = allNodes.find(n => n.id === node.l?.toString());
    const rightNode = allNodes.find(n => n.id === node.r?.toString());

    return {
      code: node.code,
      name: node.name,
      registration_date: node.registration_date,
      introducer_code: node.introducer_code,
      l: leftNode ? buildTree(leftNode, allNodes) : null,
      r: rightNode ? buildTree(rightNode, allNodes) : null,
    };
  };

  return buildTree(parentNode, nodes);
}

router.get('/', asyncErrorHandler(async (req, res) => {
  const code = req.query.code as string;

  // find 4 levels of nodes
  const parentNode = await Policyholder.findOne({ code }) as IPolicyholder;

  if (!parentNode) {
    return res.status(404).json({ message: 'policyholder not found.' });
  }

  const data = await getTree(parentNode, 3);
  console.log( data )

  res.json(data);
}))

router.get('/:code/top', asyncErrorHandler(async (req, res) => {
  const code = req.params.code;

  const node = await Policyholder.findOne({ code }) as IPolicyholder;

  if (!node) {
    return res.status(404).json({ message: 'policyholder not found.' });
  }

  if (!node.parents) {
    return res.status(400).json({ message: 'node is root.' });
  }

  const parent = node.parents.split('/').slice(-1)[0];
  const data = await getTree(await Policyholder.findOne({ code: parent }) as IPolicyholder, 3);
  res.json(data);
}))

router.post('/', asyncErrorHandler(async (req, res) => {
  const {
    name,
    introducer_code,
  } = req.body

  // create root policyholder
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
    const code = counter.serial.toString().padStart(10, '0');

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

  // create child policyholder
  const introducer = await Policyholder.findOne({ code: introducer_code });
  if (!introducer) {
    return res.status(400).json({ message: 'introducer not found.' });
  }

  const counter = await Counter.findOneAndUpdate(
    { name: 'policyholder' },
    { $inc: { serial: 1 } },
    { new: true, upsert: true }
  );
  const code = counter.serial.toString().padStart(10, '0');

  let parent: IPolicyholder = introducer;
  do {
    if (!parent.l) {
      const child = new Policyholder({
        code,
        name,
        registration_date: new Date(),
        introducer_code,
        parents: parent.parents ? `${parent.parents}/${parent.code}` : parent.code,
      });
      await child.save();

      parent.l = child
      await parent.save();

      return res.json(child);
    } else if (!parent.r) {
      const child = new Policyholder({
        code,
        name,
        registration_date: new Date(),
        introducer_code,
        parents: parent.parents ? `${parent.parents}/${parent.code}` : parent.code,
      });
      await child.save();

      parent.r = child
      await parent.save();

      return res.json(child);
    }
    const leftNode = await Policyholder.findById(parent.l) as IPolicyholder;
    const rightNode = await Policyholder.findById(parent.r) as IPolicyholder;
    // calc left tree node count and right tree node count
    const leftNodeCount = await Policyholder.countDocuments({ parents: { $regex: `${leftNode.parents}/${leftNode.code}` } });
    const rightNodeCount = await Policyholder.countDocuments({ parents: { $regex: `${rightNode.parents}/${rightNode.code}` } });
    parent = await Policyholder.findById(leftNodeCount <= rightNodeCount ? parent.l : parent.r) as IPolicyholder
  } while (parent)
}))

export default router;
