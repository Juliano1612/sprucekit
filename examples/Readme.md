# SpruceKit Examples
## Overview
This directory contains examples of how to use the various packages in the SpruceKit Monorepo. The examples can be run standalone or together.

Frontend examples include 
- `sprucekit-test-app`
- `sprucekit-test-next`
- `sprucekit-test-sveltekit`

Backend examples include
- `sprucekit-test-express-api`
- `sprucekit-test-next`
- `sprucekit-test-sveltekit`


## Running the examples
To run the examples, you'll need to build the packages first. The best way to do that is in the root of the repo:
```sh
yarn
```

Then, you can run sprucekit-test-dapp and sprucekit-test-express-api:
```sh
# From the root of the repo
yarn examples
# OR
yarn test-app start
yarn express-api start
```