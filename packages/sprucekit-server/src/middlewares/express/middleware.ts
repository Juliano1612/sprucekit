import { NextFunction, Request, Response } from 'express';
import {
  SpruceKitEnsData,
  SpruceKitLensProfilesResponse,
  SiweMessage,
  SiweGnosisVerify,
} from '@spruceid/sprucekit-core';
import {
  SpruceKitLogFields,
  SpruceKitServerBaseClass,
} from '@spruceid/sprucekit-core/server';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      sprucekit: SpruceKitRequestObject &
        Omit<Partial<SpruceKitServerBaseClass>, 'log'>;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    /** The SIWE request embedded in sprucekit-session */
    siwe: SiweMessage;
    /** Unique value */
    nonce: string;
    /** The signature for the SIWE request embedded in sprucekit-session */
    signature?: string;
    /** If it's a DAO session */
    daoLogin: boolean;
    /** If enable ENS resolution */
    ens?: SpruceKitEnsData;
    /** If enable ENS resolution */
    lens?: string | SpruceKitLensProfilesResponse;
  }
}

/** Interface for the spruceKit fields on a request object. */
export interface SpruceKitRequestObject {
  /** The signature for the SIWE request embedded in sprucekit-session */
  signature?: string;
  /** The SIWE request embedded in sprucekit-session */
  siwe?: SiweMessage;
  /** A flag to have the server lookup and verifiy that the signer is a delegee of the contract in the SIWE request */
  daoLogin?: boolean;
  /** The address of the user who signed in */
  userId?: string;
  /** A boolean indicating if the client's session has been verified/authenticated */
  verified: boolean;
  /** A function that logs the event to the SpruceKit platform */
  log: (data: SpruceKitLogFields) => Promise<boolean>;
}

/**
 * This middleware function can be used to protect an Express route with SpruceKit authentication.
 * It will check for sprucekit.verified and if it is set, the route will be allowed to proceed.
 * If it is not set, the route will redirect or return a 401 Unauthorized response, based on the
 * value of the redirect property.
 * @param redirectURL - The URL to redirect to if the user is not authenticated.
 **/
export const SpruceKitAuthenticated = (redirectURL?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.spruceKit.verified) {
      next();
    } else {
      if (redirectURL) {
        res.redirect(redirectURL);
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    }
  };
};

/**
 * This middleware function intercepts and validates cookies with the sprucekit-prefix
 * and adds their properties to the `spruceKit` property to the Express Request object.
 * This property is set by this middleware and contains the following properties:
 * - cookies: an object containing the cookies sent by the client
 * - verified: a boolean indicating if the client is authenticated
 * - userId: the user id of the client
 * - log: a function that logs the event to the SpruceKit platform
 * - signature: the signature of the client
 * - siwe: the siwe message of the client
 *
 * @param {SpruceKitServerBaseClass} spruceKit
 * @returns {(req: Request, res: Response, next: NextFunction) => void}
 */
export const spruceKitMiddleware = (spruceKit: SpruceKitServerBaseClass) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.spruceKit = {
      ...spruceKit,
      verified: false,
    };

    if (req.session?.siwe) {
      const { signature, siwe, daoLogin, nonce } = req.session;
      const { success: verified, data } = await new SiweMessage(siwe)
        .verify(
          { signature, nonce },
          {
            verificationFallback: daoLogin ? SiweGnosisVerify : null,
            provider: spruceKit.provider,
          },
        )
        .then((data) => ({ success: true, data }))
        .catch((error) => ({ success: false, error, data: null }));
      if (verified) {
        req.spruceKit = {
          ...req.spruceKit,
          siwe: data,
          verified,
          userId: `did:pkh:eip155:${siwe.chainId}:${siwe.address}`,
        };
      } else {
        req.session.destroy(() => next());
      }
    }
    next();
  };
};

export default {
  spruceKitMiddleware,
  SpruceKitAuthenticated,
};
