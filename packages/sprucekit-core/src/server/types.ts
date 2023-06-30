import { CookieOptions, RequestHandler } from "express";
import { SessionData, SessionOptions, Store } from "express-session";
import {
  SpruceKitEnsData,
  SpruceKitEnsResolveOptions,
  SpruceKitRPCProvider,
} from "../types";
import { EventEmitter } from "events";
import { ethers } from 'ethers';
import { SiweMessage, SiweError } from "siwe";

/** Configuration interface for sprucekit-server */
export interface SpruceKitServerConfig {
  /** A key used for signing cookies coming from the server. Providing this key enables signed cookies. */
  signingKey?: string;
  /** Connection to a cryptographic keypair and/or network. */
  providers?: SpruceKitServerProviders;
  /** Changes cookie attributes. Determines whether or not server cookies
   * require HTTPS and sets the SameSite attribute to 'lax'. Defaults to false */
  useSecureCookies?: boolean;
}

/** SpruceKit web3 configuration settings. */
export interface SpruceKitServerProviders {
  /** JSON RPC provider configurations. */
  rpc?: SpruceKitRPCProvider;
  /** SpruceKit Session Store configuration settings. */
  sessionConfig?: Partial<SpruceKitSessionStoreConfig>;
  /** Metrics service configurations. */
  metrics?: SpruceKitMetricsProvider;
}

/** SpruceKit Session Store configuration settings */
export interface SpruceKitSessionStoreConfig {
  /** Overrides for [SessionOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a24d35afe48f7fb702e7617b983ddca1904ba36b/types/express-session/index.d.ts#L52) */
  sessionOptions?: Partial<SessionOptions>;
  /** Connector for different stores */
  store?: (session: any) => Store;
}

/** SpruceKit Redis Session Store Provider settings. */
export type SpruceKitRedisSessionStoreProvider = {
  service: "redis";
  redisUrl: string;
};

/** SpruceKit Express Session Store Provider settings. */
export type SpruceKitExpressSessionStoreProvider = {
  service: "express";
  config?: SessionOptions;
};

/** SpruceKit Metrics Provider settings. */
export type SpruceKitMetricsProvider = {
  service: "sprucekit";
  apiKey: string;
};

/** Configuration interface for cookies issued by sprucekit-server */
export interface SpruceKitCookieOptions extends CookieOptions {
  /** Prevents client-side javascript from accessing cookies. Should always be true. */
  httpOnly: true;
  /** Whether or not cookies should be sent over https. Recommend true for production. */
  secure: boolean;
  /** Prevents Cross Site Request Forgery Attacks by telling the browser to only send
   * cookies with request from your site. The lax setting allows GET requests from
   * other sites. Recommended true for production. */
  sameSite: boolean | "lax" | "strict" | "none" | undefined;
  /** Whether or not cookies should be signed. Recommended true for production.
   * Set to true by providing a signing key. If false, cookies can be tampered
   * with on the client. */
  signed: boolean;
}

/** Allowed fields for an SpruceKit Log. */
export interface SpruceKitLogFields {
  /** Unique identifier for the user, formatted as a DID. */
  userId: string;
  /** RFC-3339 time of resource generation, defaults to now. */
  timestamp?: string;
  /** Type of content being logged. */
  type: SpruceKitEventLogTypes;
  /** Any JSON stringifiable structure to be logged. */
  content: string | Record<string, any>;
}

/** Available SpruceKit Log Types. */
export enum SpruceKitEventLogTypes {
  /** Login type definition. */
  LOGIN = "sprucekit-login",
  /** Logout type definition. */
  // LOGOUT = "sprucekit-logout",
  /** Logging type definition. */
  // LOG = "LOG",
  /** Event type definition. */
  // EVENT = "event",
}

/**
 * SpruceKit-Server is a server-side library made to work with the SpruceKit client libraries.
 * SpruceKit-Server is the base class that takes in a configuration object and works
 * with various middleware libraries to add authentication and metrics to your server.
 */
export abstract class SpruceKitServerBaseClass extends EventEmitter {
  /** SpruceKitServerConfig object. */
  protected _config;
  /** Axios instance. */
  protected _api;
  /** EthersJS provider. */
  public provider: ethers.providers.BaseProvider;
  /** Session is a configured instance of express-session middleware. */
  public session: RequestHandler;
  /**
   * Sets default values for optional configurations
   */
  protected _setDefaults;
  /**
   * Registers a new event to the API
   * @param data - SpruceKitLogFields object.
   * @returns True (success) or false (fail).
   */
  public log: (data: SpruceKitLogFields) => Promise<boolean>;
  /**
   * Generates a nonce for use in the SpruceKit client libraries.
   * Nonce is a random string that is used to prevent replay attacks.
   * Wraps the generateNonce function from the SIWE library.
   * @returns A nonce string.
   */
  public generateNonce: () => string;
  /**
   * Verifies the SIWE message, signature, and nonce for a sign-in request.
   * If the message is verified, a session token is generated and returned.
   * @param siwe - SIWE Message.
   * @param signature - The signature of the SIWE message.
   * @param daoLogin - Whether or not daoLogin is enabled.
   * @param resolveEns - Resolve ENS settings.
   * @param nonce - nonce string.
   * @returns Request data with SpruceKit Server Session.
   */
  public login: (
    siwe: Partial<SiweMessage> | string,
    signature: string,
    daoLogin: boolean,
    resolveEns: boolean | SpruceKitEnsResolveOptions,
    nonce: string,
    resolveLens?: boolean
  ) => Promise<{
    success: boolean;
    error: SiweError;
    session: Partial<SessionData>;
  }>;
  /**
   * ENS data supported by SpruceKit.
   * @param address - User address.
   * @param resolveEnsOpts - Options to resolve ENS.
   * @returns Object containing ENS data.
   */
  public resolveEns: (
    address: string,
    resolveEnsOpts?: SpruceKitEnsResolveOptions
  ) => Promise<SpruceKitEnsData>;
  /**
   * Logs out the user by deleting the session.
   * Currently this is a no-op.
   * @param destroySession - Method to remove session from storage.
   * @returns Promise with true (success) or false (fail).
   */
  public logout: (destroySession?: () => Promise<any>) => Promise<boolean>;
  /**
   * Gets Express Session config params to configure the session.
   * @returns Session options.
   */
  public getExpressSessionConfig: () => SessionOptions;
  /**
   * Gets default Express Session Config.
   * @returns Default session options
   */
  protected getDefaultExpressSessionConfig;
}
//# sourceMappingURL=server.d.ts.map
