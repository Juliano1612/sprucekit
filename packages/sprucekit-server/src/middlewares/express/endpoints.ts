import express from 'express';
import { Request, Response } from 'express';
import {
  SpruceKitServerRoutes,
  isSpruceKitServerMiddlewareConfig,
} from '@spruceid/sprucekit-core';
import { SpruceKitServerBaseClass } from '@spruceid/sprucekit-core/server';
import { getRoutePath } from '../utils';

const spruceKitEndpoints = (
  spruceKit: SpruceKitServerBaseClass,
  routes?: SpruceKitServerRoutes,
) => {
  const router = express.Router();

  /**
   * This endpoint provides a randomly generated nonce for the client to use in
   * a Sign-in with Ethereum signature. This is used to prevent replay attacks.
   * It issues a session token `sprucekit-nonce` that is used to sign the next request.
   *
   * @name /sprucekit-nonce
   * @param {Request} req
   * @param {Response} res
   */
  router.get(
    getRoutePath(routes?.nonce, '/sprucekit-nonce'),
    function (req: Request, res: Response): void {
      req.session.siwe = undefined;
      req.session.nonce = spruceKit.generateNonce();
      req.session.save(() => res.status(200).send(req.session.nonce));
      isSpruceKitServerMiddlewareConfig(routes?.nonce)
        ? routes?.nonce?.callback(req)
        : null;
      return;
    },
  );

  /**
   * This endpoint verifies the signature of the client and the nonce. If the signature is valid,
   * the server issues a session token `sprucekit-session` that is used by the middleware to authenticate requests.
   * If logging is enabled, the server will also log the sign-in to SpruceKit platform.
   *
   * @async
   * @name /sprucekit-login
   * @param {Request} req
   * @param {Response} res
   */
  router.post(
    getRoutePath(routes?.login, '/sprucekit-login'),
    async function (req: Request, res: Response) {
      if (!req.body) {
        res.status(422).json({ message: 'Expected body.' });
        return;
      }
      if (!req.body.signature) {
        res
          .status(422)
          .json({ message: 'Expected the field `signature` in body.' });
        return;
      }
      if (!req.body.siwe) {
        res
          .status(422)
          .json({ message: 'Expected the field `siwe` in the body.' });
        return;
      }

      let spruceKitLoginResponse;

      try {
        spruceKitLoginResponse = await spruceKit.login(
          req.body.siwe,
          req.body.signature,
          req.body.daoLogin,
          req.body.resolveEns,
          req.session.nonce,
          req.body.resolveLens,
        );
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }

      const { success, error, session } = spruceKitLoginResponse;

      if (!success) {
        let message: string = error.type;
        if (error.expected && error.received) {
          message += ` Expected: ${error.expected}. Received: ${error.received}`;
        }
        return res.status(400).json({ message });
      }

      req.session.siwe = session.siwe;
      req.session.signature = session.signature;
      req.session.daoLogin = session.daoLogin;
      req.session.ens = session.ens;
      req.session.lens = session.lens;
      req.session.save(() => res.status(200).json({ ...req.session }));
      isSpruceKitServerMiddlewareConfig(routes?.login)
        ? routes?.login?.callback(req)
        : null;
      return;
    },
  );

  /**
   * This endpoint removes the session token `sprucekit-session` from the client, effectively logging the client out.
   * @name /sprucekit-logout
   * @param {Request} req
   * @param {Response} res
   */
  router.post(
    getRoutePath(routes?.logout, '/sprucekit-logout'),
    async function (req: Request, res: Response) {
      try {
        req.session.destroy(null);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      req.session = null;
      try {
        await req.spruceKit.logout();
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      res.status(204).send();
      isSpruceKitServerMiddlewareConfig(routes?.logout)
        ? routes?.logout?.callback(req)
        : null;
      return;
    },
  );
  return router;
};

export default spruceKitEndpoints;
