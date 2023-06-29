[![codecov](https://codecov.io/gh/spruceid/sprucekit/branch/main/graph/badge.svg?token=8G6LMTT51M)](https://codecov.io/gh/spruceid/sprucekit)

# SpruceKit

SpruceKit is a library that enables you to easily add user authentication, session management, and more to your app.

## Documentation

https://sprucekit.dev

## SDKs

- Client side under [`./packages/sprucekit`](./packages/sprucekit-sdk).
- Server side under [`./packages/sprucekit-server`](./packages/sprucekit-server).

## Useful Commands
> **⚠** This repository requires node >= 18.16.0

- `yarn` - Install dependencies and build packages
- `yarn build` - Build all packages and examples
- `yarn build:packages` - Build all packages
- `yarn build:examples` - Build all examples
- `yarn examples` - Concurrently run the `sprucekit-test-app` and `sprucekit-test-express-api` found in `./examples`
- `yarn test` - Run unit tests (Jest)
- `yarn test:e2e` - Run E2E tests (Cypress/Synpress)
- `yarn clean` - Remove all build artifacts and node_modules


## Docker

SpruceKit ships with a [Docker Compose](https://docs.docker.com/compose/) configuration
for setting up a local development and testing environment with SpruceKit server and
our example app. Make sure you have
[Docker and Compose installed](https://docs.docker.com/compose/install/), then
create a `.env` file in the project root:

```
sprucekit_listenPort=8443 # sprucekit server will be available on http://localhost:8443
sprucekit_signingKey= # session secret for sprucekit server
sprucekit_providers__metrics__apiKey= # sprucekit metrics api key https://app.sprucekit.id
sprucekit_providers__rpc__apiKey= # infura api key for wallet connect (optional)
```

Save your `.env` file and from the project root, run:

```
docker compose up
```

Docker will build containers for the SpruceKit server and example app from the
working tree and start them both.

- Example app: http://localhost:3000
- SpruceKit Server: http://localhost:8443
