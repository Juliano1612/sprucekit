import express, { Express } from 'express';
import { createClient } from 'redis';
import {
  SpruceKitExpressMiddleware,
  SpruceKitHttpMiddleware,
  SpruceKitRPCProviders,
  SpruceKitServer,
} from '../src';
import { SpruceKitEventLogTypes } from '@spruceid/sprucekit-core/server';

jest.mock('@spruceid/sprucekit-core');

const SIWE_MESSAGE = {
  domain: 'login.xyz',
  address: '0x9D85ca56217D2bb651b00f15e694EB7E713637D4',
  statement: 'Sign-In With Ethereum Example Statement',
  uri: 'https://login.xyz',
  version: '1',
  nonce: 'bTyXgcQxn2htgkjJn',
  issuedAt: '2022-01-27T17:09:38.578Z',
  chainId: 1,
  expirationTime: '2100-01-07T14:31:43.952Z',
};

const SIGNATURE =
  '0xdc35c7f8ba2720df052e0092556456127f00f7707eaa8e3bbff7e56774e7f2e05a093cfc9e02964c33d86e8e066e221b7d153d27e5a2e97ccd5ca7d3f2ce06cb1b';

test('Instantiate sprucekit-server successfully with default values', () => {
  expect(() => {
    const server = new SpruceKitServer();
  }).not.toThrowError();
});

test('Instantiate sprucekit-server successfully with SpruceKit as metrics provider', () => {
  expect(() => {
    const server = new SpruceKitServer({
      providers: {
        metrics: {
          service: 'sprucekit',
          apiKey: '',
        },
      },
    });
  }).not.toThrowError();
});

test('Instantiate sprucekit-server successfully with a RPC provider', () => {
  expect(() => {
    const server = new SpruceKitServer({
      providers: {
        rpc: {
          service: SpruceKitRPCProviders.SpruceKitAlchemyProvider,
          apiKey: 'someApiKey',
        },
      },
    });
  }).not.toThrowError();
});

test('Instantiate sprucekit-server express middleware successfully with default config', () => {
  expect(() => {
    const app: Express = express();
    const server = new SpruceKitServer();
    app.use(SpruceKitExpressMiddleware(server));
  }).not.toThrowError();
});

test('Instantiate sprucekit-server express middleware successfully with store config', () => {
  // setup redis client
  const redisClient = createClient({
    legacyMode: true,
    url: process.env.REDIS_URL,
  });
  const app: Express = express();
  expect(() => {
    const server = new SpruceKitServer({
      providers: {
        sessionConfig: {
          store: (session) => {
            const redisStore = require('connect-redis')(session);
            return new redisStore({
              client: redisClient,
            });
          },
        },
      },
    });
    app.use(SpruceKitExpressMiddleware(server));
  }).not.toThrowError();
});

test('Instantiate sprucekit-server http middleware successfully', () => {
  expect(() => {
    const server = new SpruceKitServer();
    const sprucekitMiddleware = SpruceKitHttpMiddleware(server);
  }).not.toThrowError();
});

test('Should call sprucekitLog successfuly', async () => {
  const server = new SpruceKitServer({
    providers: {
      metrics: {
        service: 'sprucekit',
        apiKey: '',
      },
    },
  });
  await expect(
    server.log({ content: '', type: SpruceKitEventLogTypes.LOGIN, userId: '' }),
  ).resolves.not.toThrow();
});

test('Should call sprucekitResolveEns successfuly', async () => {
  const server = new SpruceKitServer();
  await expect(server.resolveEns('')).resolves.not.toThrow();
});

test('Should call destroy session stub successfuly', async () => {
  const server = new SpruceKitServer();
  await expect(server.logout(async () => false)).resolves.toBeFalsy();
});

test('Should successfuly verify the message', async () => {
  const server = new SpruceKitServer();
  await expect(
    server
      .login(
        SIWE_MESSAGE,
        SIGNATURE,
        true,
        { avatar: true },
        SIWE_MESSAGE.nonce,
      )
      .then(({ success }) => success),
  ).resolves.toBeTruthy();
});

test('Should fail to verify the message', async () => {
  const server = new SpruceKitServer();
  await expect(
    server.login(SIWE_MESSAGE, '', false, false, SIWE_MESSAGE.nonce),
  ).rejects.toMatchObject({
    error: { type: 'Signature does not match address of the message.' },
  });
});
