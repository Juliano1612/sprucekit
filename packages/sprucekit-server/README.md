# SpruceKit Server

SpruceKit Server is a server-side library made to work with the SpruceKit client libraries. sprucekit-server provides authentication and session management, which can be enabled via an ExpressJS middleware or using the methods provided on the SpruceKitServer class.

## Documentation

For full documentation, see the [SpruceKit Docs](https://sprucekit.dev)

## Quickstart

You can add sprucekit-server to your server from npm:

```bash
yarn add @spruceid/sprucekit-server
# or
npm install @spruceid/sprucekit-server
# or
pnpm add @spruceid/sprucekit-server
```

On your server, you'll need to create an instance of sprucekit-server and pass it to an Express middleware layer, as seen below. sprucekit-server doesn't require configuration parameters to use, however it's recommended to have the following variables set:

```typescript
import express from 'express';
import { SpruceKitServer, SpruceKitExpressMiddleware } from '@spruceid/sprucekit-server';

const sk = new SpruceKitServer({
  signingKey: process.env.SPRUCE_KIT_SIGNING_KEY,
  provider: {
    rpc: {
      service: 'infura',
      network: 'homestead',
      apiKey: process.env.INFURA_API_KEY ?? '',
    },
    metrics: {
      service: 'sk',
      apiKey: process.env.SPRUCEKIT_API_TOKEN ?? '',
    },
  },
});

const app = express();

app.use(SpruceKitExpressMiddleware(sk));
app.listen(3001, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${3001}`);
});
```
