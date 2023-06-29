# SpruceKit Client SDK

## Quick Start

You can add SpruceKit to your app using your favorite package manager.

```bash
yarn add @spruceid/sprucekit
# or
npm install @spruceid/sprucekit
# or
pnpm add @spruceid/sprucekit
```

and then you can use it in your app.

```js
import { SpruceKit } from "@spruceid/sprucekit";

const buttonHandler = async () => {
  const sk = new SpruceKit();
  const session = await sk.signIn();
  const address = sk.address();
};
```

## Documentation

For full documentation, see the [SpruceKit Docs](https://sprucekit.dev)
