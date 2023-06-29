#!/usr/bin/env node

'use strict';

const config = require('rc')('sprucekit', {
  signingKey: '',
  providers: {
    rpc: {
      service: 'infura',
      network: 'homestead',
      apiKey: '',
    },
    metrics: {
      service: 'sprucekit',
      apiKey: '',
    },
  },
  listenPort: '8443',
  accessControlAllowOrigin: 'http://localhost:3000',
});

const { SpruceKitServer } = require('../dist/server');
const { SpruceKitExpressMiddleware } = require('../dist/middlewares/express');
const spruceKitServer = new SpruceKitServer(config);
const expressApp = require('express')();

spruceKitServer.on('sprucekit-login', console.log);

expressApp.use(
  require('cors')({
    origin: config.accessControlAllowOrigin,
    credentials: true,
  }),
);
expressApp.use(SpruceKitExpressMiddleware(spruceKitServer));
expressApp.listen(parseInt(config.listenPort));
