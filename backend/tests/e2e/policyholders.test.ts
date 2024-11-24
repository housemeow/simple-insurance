import request from 'supertest';
import mongoose from 'mongoose';
import { type Express } from 'express'
import dotenv from 'dotenv';
import { connectDB } from '@/config/db';
import { IPolicyholder, Policyholder } from '@/models/policyholder';
import { createApp } from '@/createApp';
import { Counter } from '@/models/counter';

describe('Policyholders API Endpoints', () => {
  let app: Express

  beforeAll(async () => {
    dotenv.config({
      path: ['.env.test']
    });

    await connectDB();
    app = createApp();
    // assert database name includes `-test` to avoid overwriting production data
    expect(mongoose.connection.db?.databaseName).toMatch(/-test$/);
  })

  beforeEach(async () => {

  });

  afterEach(async () => {
    await Policyholder.deleteMany();
    await Counter.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  })

  describe('[POST] /api/policyholders', () => {
    it('should create root policyholder', async () => {
      const res = await request(app)
        .post('/api/policyholders')
        .send({
          name: 'Policyholder Name',
        })
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('code', '0000000001');
      expect(res.body).toHaveProperty('name', 'Policyholder Name');
      expect(res.body).toHaveProperty('registration_date');
      expect(res.body).toHaveProperty('introducer_code', '');
      expect(res.body).toHaveProperty('parents', '');
    });

    it('should return 400 if root policyholder has been created', async () => {
      const counter = await Counter.findOneAndUpdate(
        { name: 'policyholder' },
        { $inc: { serial: 1 } },
        { new: true, upsert: true }
      );
      const code = counter.serial.toString().padStart(8, '0');
      await Policyholder.create({
        code,
        name: 'Policyholder Name',
        registration_date: new Date(),
      });

      const res = await request(app)
        .post('/api/policyholders')
        .send({
          name: 'Policyholder Name',
        })
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'root has been created.');
    })

    it('should return 400 if introducer_code is not exist', async () => {
      const res = await request(app)
        .post('/api/policyholders')
        .send({
          name: 'Policyholder Name',
          introducer_code: 'not found introducer',
        })
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'introducer not found.');
    })

    it('should create child policyholder if left node is null', async () => {
      // create root node
      await request(app)
        .post('/api/policyholders')
        .send({
          name: 'Policyholder Name',
        })

      const res = await request(app)
        .post('/api/policyholders')
        .send({
          name: 'Child Policyholder Name',
          introducer_code: '0000000001',
        })
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('code', '0000000002');
      expect(res.body).toHaveProperty('name', 'Child Policyholder Name');
      expect(res.body).toHaveProperty('registration_date');
      expect(res.body).toHaveProperty('introducer_code', '0000000001');
      expect(res.body).toHaveProperty('parents', '0000000001');

      const introducer = await Policyholder.findOne({ code: '0000000001' });
      const left = await Policyholder.findById(introducer?.l)
      expect(left?.code).toEqual('0000000002');
      expect(introducer?.r).toEqual(undefined);
    })

    it('should create child policyholder if right node is null', async () => {
      // create root node
      await request(app)
        .post('/api/policyholders')
        .send({
          name: 'Policyholder Name',
        })

      // create left node
      await request(app)
        .post('/api/policyholders')
        .send({
          name: 'Left Child Policyholder Name',
          introducer_code: '0000000001',
        })

      const res = await request(app)
        .post('/api/policyholders')
        .send({
          name: 'Right Child Policyholder Name',
          introducer_code: '0000000001',
        })
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('code', '0000000003');
      expect(res.body).toHaveProperty('name', 'Right Child Policyholder Name');
      expect(res.body).toHaveProperty('registration_date');
      expect(res.body).toHaveProperty('introducer_code', '0000000001');
      expect(res.body).toHaveProperty('parents', '0000000001');

      const introducer = await Policyholder.findOne({ code: '0000000001' });
      const right = await Policyholder.findById(introducer?.r)
      expect(right?.code).toEqual('0000000003');
    })

    it('should return 200 if create nested node', async () => {
      // follow `/assets/截圖_2023-04-16_下午7.31.29.webp`
      // create root node 0000000001
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶1',
        })
      // create node 0000000002
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶2',
          introducer_code: '0000000001',
        })
      // create node 0000000003
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶3',
          introducer_code: '0000000001',
        })
      // create node 0000000004
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶4',
          introducer_code: '0000000002',
        })
      // create node 0000000005
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶5',
          introducer_code: '0000000002',
        })
      // create node 0000000006
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶6',
          introducer_code: '0000000001',
        })
      // create node 0000000007
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶7',
          introducer_code: '0000000001',
        })
      // create node 0000000008
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶8',
          introducer_code: '0000000002',
        })
      // create node 0000000009
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶9',
          introducer_code: '0000000002',
        })
      // create node 0000000010
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶10',
          introducer_code: '0000000002',
        })
      // create node 0000000011
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶11',
          introducer_code: '0000000002',
        })
      // create node 0000000012
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶12',
          introducer_code: '0000000006',
        })
      // create node 0000000013
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶13',
          introducer_code: '0000000003',
        })
      // create node 0000000014
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶14',
          introducer_code: '0000000003',
        })
      // create node 0000000015
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶15',
          introducer_code: '0000000003',
        })

      const node1 = await Policyholder.findOne({ code: '0000000001' }) as IPolicyholder;
      const node2 = await Policyholder.findOne({ code: '0000000002' }) as IPolicyholder;
      const node3 = await Policyholder.findOne({ code: '0000000003' }) as IPolicyholder;
      const node4 = await Policyholder.findOne({ code: '0000000004' }) as IPolicyholder;
      const node5 = await Policyholder.findOne({ code: '0000000005' }) as IPolicyholder;
      const node6 = await Policyholder.findOne({ code: '0000000006' }) as IPolicyholder;
      const node7 = await Policyholder.findOne({ code: '0000000007' }) as IPolicyholder;
      const node8 = await Policyholder.findOne({ code: '0000000008' }) as IPolicyholder;
      const node9 = await Policyholder.findOne({ code: '0000000009' }) as IPolicyholder;
      const node10 = await Policyholder.findOne({ code: '0000000010' }) as IPolicyholder;
      const node11 = await Policyholder.findOne({ code: '0000000011' }) as IPolicyholder;
      const node12 = await Policyholder.findOne({ code: '0000000012' }) as IPolicyholder;
      const node13 = await Policyholder.findOne({ code: '0000000013' }) as IPolicyholder;
      const node14 = await Policyholder.findOne({ code: '0000000014' }) as IPolicyholder;
      const node15 = await Policyholder.findOne({ code: '0000000015' }) as IPolicyholder;

      expect(node1.parents).toEqual('');
      expect(node1.introducer_code).toEqual('');
      expect(node1.l).toEqual(node2._id);
      expect(node1.r).toEqual(node3._id);
      expect(node2.parents).toEqual('0000000001');
      expect(node2.introducer_code).toEqual('0000000001');
      expect(node2.l).toEqual(node4._id);
      expect(node2.r).toEqual(node5._id);
      expect(node3.parents).toEqual('0000000001');
      expect(node3.introducer_code).toEqual('0000000001');
      expect(node3.l).toEqual(node6._id);
      expect(node3.r).toEqual(node7._id);
      expect(node4.parents).toEqual('0000000001/0000000002');
      expect(node4.introducer_code).toEqual('0000000002');
      expect(node4.l).toEqual(node8._id);
      expect(node4.r).toEqual(node10._id);
      expect(node5.parents).toEqual('0000000001/0000000002');
      expect(node5.introducer_code).toEqual('0000000002');
      expect(node5.l).toEqual(node9._id);
      expect(node5.r).toEqual(node11._id);
      expect(node6.parents).toEqual('0000000001/0000000003');
      expect(node6.introducer_code).toEqual('0000000001');
      expect(node6.l).toEqual(node12._id);
      expect(node6.r).toEqual(node14._id);
      expect(node7.parents).toEqual('0000000001/0000000003');
      expect(node7.introducer_code).toEqual('0000000001');
      expect(node7.l).toEqual(node13._id);
      expect(node7.r).toEqual(node15._id);
      expect(node8.parents).toEqual('0000000001/0000000002/0000000004');
      expect(node8.introducer_code).toEqual('0000000002');
      expect(node8.l).toEqual(undefined);
      expect(node8.r).toEqual(undefined);
      expect(node9.parents).toEqual('0000000001/0000000002/0000000005');
      expect(node9.introducer_code).toEqual('0000000002');
      expect(node9.l).toEqual(undefined);
      expect(node9.r).toEqual(undefined);
      expect(node10.parents).toEqual('0000000001/0000000002/0000000004');
      expect(node10.introducer_code).toEqual('0000000002');
      expect(node10.l).toEqual(undefined);
      expect(node10.r).toEqual(undefined);
      expect(node11.parents).toEqual('0000000001/0000000002/0000000005');
      expect(node11.introducer_code).toEqual('0000000002');
      expect(node11.l).toEqual(undefined);
      expect(node11.r).toEqual(undefined);
      expect(node12.parents).toEqual('0000000001/0000000003/0000000006');
      expect(node12.introducer_code).toEqual('0000000006');
      expect(node12.l).toEqual(undefined);
      expect(node12.r).toEqual(undefined);
      expect(node13.parents).toEqual('0000000001/0000000003/0000000007');
      expect(node13.introducer_code).toEqual('0000000003');
      expect(node13.l).toEqual(undefined);
      expect(node13.r).toEqual(undefined);
      expect(node14.parents).toEqual('0000000001/0000000003/0000000006');
      expect(node14.introducer_code).toEqual('0000000003');
      expect(node14.l).toEqual(undefined);
      expect(node14.r).toEqual(undefined);
      expect(node15.parents).toEqual('0000000001/0000000003/0000000007');
      expect(node15.introducer_code).toEqual('0000000003');
      expect(node15.l).toEqual(undefined);
      expect(node15.r).toEqual(undefined);
    })
  })

  describe('[GET] /api/policyholders', () => {
    it('should return 400 if no policyholder', async () => {
      const res = await request(app)
        .get('/api/policyholders')
        .query({ code: '0000000001' })
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'policyholder not found.');
    })

    it('should return 200 if root policyholder', async () => {
      /**
       *              1
       *            /  \
       *          2     3
       *         / \   /
       *        4   5  6
       *       / \ /
       *      7  8 9
       *     / \
       *    10 11
       */

      // create root node 0000000001
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶1',
        })
      // create node 0000000002
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶2',
          introducer_code: '0000000001',
        })
      // create node 0000000003
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶3',
          introducer_code: '0000000001',
        })
      // create node 0000000004
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶4',
          introducer_code: '0000000002',
        })
      // create node 0000000005
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶5',
          introducer_code: '0000000002',
        })
      // create node 0000000006
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶6',
          introducer_code: '0000000003',
        })
      // create node 0000000007
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶7',
          introducer_code: '0000000004',
        })
      // create node 0000000008
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶8',
          introducer_code: '0000000004',
        })
      // create node 0000000009
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶9',
          introducer_code: '0000000005',
        })
      // create node 0000000010
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶10',
          introducer_code: '0000000007',
        })
      // create node 0000000011
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶11',
          introducer_code: '0000000007',
        })

      const res = await request(app)
        .get('/api/policyholders')
        .query({ code: '0000000001' })

      expect(res.statusCode).toEqual(200);

      const expectResult = {
        code: '0000000001',
        name: '保戶1',
        registration_date: expect.any(String),
        introducer_code: '',
        l: {
          code: '0000000002',
          name: '保戶2',
          registration_date: expect.any(String),
          introducer_code: '0000000001',
          l: {
            code: '0000000004',
            name: '保戶4',
            registration_date: expect.any(String),
            introducer_code: '0000000002',
            l: {
              code: '0000000007',
              name: '保戶7',
              registration_date: expect.any(String),
              introducer_code: '0000000004',
              l: null,
              r: null,
            },
            r: {
              code: '0000000008',
              name: '保戶8',
              registration_date: expect.any(String),
              introducer_code: '0000000004',
              l: null,
              r: null,
            },
          },
          r: {
            code: '0000000005',
            name: '保戶5',
            registration_date: expect.any(String),
            introducer_code: '0000000002',
            l: {
              code: '0000000009',
              name: '保戶9',
              registration_date: expect.any(String),
              introducer_code: '0000000005',
              l: null,
              r: null,
            },
            r: null,
          },
        },
        r: {
          code: '0000000003',
          name: '保戶3',
          registration_date: expect.any(String),
          introducer_code: '0000000001',
          l: {
            code: '0000000006',
            name: '保戶6',
            registration_date: expect.any(String),
            introducer_code: '0000000003',
            l: null,
            r: null,
          },
          r: null,
        },
      }

      expect(res.body).toEqual(expectResult);
    })
  })

  describe('[GET] /api/policyholders/:code/top', () => {
    it('should return 400 if no policyholder', async () => {
      const res = await request(app)
        .get('/api/policyholders/0000000001/top')
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'policyholder not found.');
    })

    it('should return 400 if node is root', async () => {
      // create root node 0000000001
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶1',
        })

      const res = await request(app)
        .get('/api/policyholders/0000000001/top')
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'node is root.');
    })

    it('should return 200 if node is not root', async () => {
      /**
       *              1
       *            /  \
       *          2     3
       *         / \   /
       *        4   5  6
       *       / \ /
       *      7  8 9
       *     / \
       *    10 11
       */

      // create root node 0000000001
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶1',
        })
      // create node 0000000002
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶2',
          introducer_code: '0000000001',
        })
      // create node 0000000003
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶3',
          introducer_code: '0000000001',
        })
      // create node 0000000004
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶4',
          introducer_code: '0000000002',
        })
      // create node 0000000005
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶5',
          introducer_code: '0000000002',
        })
      // create node 0000000006
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶6',
          introducer_code: '0000000003',
        })
      // create node 0000000007
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶7',
          introducer_code: '0000000004',
        })
      // create node 0000000008
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶8',
          introducer_code: '0000000004',
        })
      // create node 0000000009
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶9',
          introducer_code: '0000000005',
        })
      // create node 0000000010
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶10',
          introducer_code: '0000000007',
        })
      // create node 0000000011
      await request(app)
        .post('/api/policyholders')
        .send({
          name: '保戶11',
          introducer_code: '0000000007',
        })

      const expectResult = {
        code: '0000000001',
        name: '保戶1',
        registration_date: expect.any(String),
        introducer_code: '',
        l: {
          code: '0000000002',
          name: '保戶2',
          registration_date: expect.any(String),
          introducer_code: '0000000001',
          l: {
            code: '0000000004',
            name: '保戶4',
            registration_date: expect.any(String),
            introducer_code: '0000000002',
            l: {
              code: '0000000007',
              name: '保戶7',
              registration_date: expect.any(String),
              introducer_code: '0000000004',
              l: null,
              r: null,
            },
            r: {
              code: '0000000008',
              name: '保戶8',
              registration_date: expect.any(String),
              introducer_code: '0000000004',
              l: null,
              r: null,
            },
          },
          r: {
            code: '0000000005',
            name: '保戶5',
            registration_date: expect.any(String),
            introducer_code: '0000000002',
            l: {
              code: '0000000009',
              name: '保戶9',
              registration_date: expect.any(String),
              introducer_code: '0000000005',
              l: null,
              r: null,
            },
            r: null,
          },
        },
        r: {
          code: '0000000003',
          name: '保戶3',
          registration_date: expect.any(String),
          introducer_code: '0000000001',
          l: {
            code: '0000000006',
            name: '保戶6',
            registration_date: expect.any(String),
            introducer_code: '0000000003',
            l: null,
            r: null,
          },
          r: null,
        },
      }

      let res = await request(app)
        .get('/api/policyholders/0000000002/top')
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(expectResult);

      res = await request(app)
        .get('/api/policyholders/0000000003/top')
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(expectResult);
  })
  })
})
