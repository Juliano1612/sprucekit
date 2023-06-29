import bodyParser from 'body-parser';
import spruceKitEndpoints from './endpoints';
import { spruceKitMiddleware, SpruceKitAuthenticated } from './middleware';
import { SpruceKitServerRoutes } from '@spruceid/sprucekit-core';
import { SpruceKitServerBaseClass } from '@spruceid/sprucekit-core/server';

/**
 * This middleware function has two key functions:
 * 1. It provides 3 endpoints for the client to hit: /sprucekit-nonce, /sprucekit-login, and /sprucekit-logout. These endpoints are used to authenticate the SIWE message and issue sessions.
 * 2. It provides a middleware function that can be used to authenticate session. The middleware then exposes the authenticated session's data via the `req.sprucekit` property.
 *
 * @param spruceKit - The SpruceKit server instance.
 */
const SpruceKitExpressMiddleware = (
  spruceKit: SpruceKitServerBaseClass,
  routes?: SpruceKitServerRoutes,
) => {
  return [
    spruceKit.session,
    bodyParser.json(),
    spruceKitMiddleware(spruceKit),
    spruceKitEndpoints(spruceKit, routes),
  ];
};
export { SpruceKitExpressMiddleware, SpruceKitAuthenticated };
