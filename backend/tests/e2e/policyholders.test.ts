import request from 'supertest';
import mongoose from 'mongoose';
import type { Express } from 'express'
import dotenv from 'dotenv';
import { connectDB } from '@/config/db';
import { Policyholder } from '@/models/policyholder';
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
      expect(res.body).toHaveProperty('code', '00000001');
      expect(res.body).toHaveProperty('name', 'Policyholder Name');
      expect(res.body).toHaveProperty('registration_date');
      expect(res.body).toHaveProperty('introducer_code', '');
      expect(res.body).toHaveProperty('parents', '');
    });

    it('should return 400 if root policyholder has been created', async () => {
      await Policyholder.create({
        code: '00000001',
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
  })
})
