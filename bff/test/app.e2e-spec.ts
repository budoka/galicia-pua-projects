import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import nock from 'nock';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    nock(/.+/)
      .get('/ping')
      .reply(200, 'pong!');

    nock(/.+/)
      .get('/wrong/endpoint')
      .reply(404);
  });

  afterAll(async () => {
    await app.close();
  });

  it('endpoint /ping should response "pong!" and status 200', async done => {
    request(app.getHttpServer())
      .get('/ping')
      .expect('pong!')
      .expect(200, done);
  });

  it('endpoint /wrong/endpoint should response status 404', async done => {
    request(app.getHttpServer())
      .get('/wrong/endpoint')
      .expect(404, done);
  });
});
