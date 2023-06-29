import { Signer, BrowserProvider } from "ethers";
import {
  initialized,
  sprucekitSession as spruceKitSession,
} from "@spruceid/sprucekit-wasm";
import merge from "lodash.merge";
import axios, { AxiosInstance } from "axios";
import { generateNonce } from "siwe";
import {
  SpruceKitEnsData,
  spruceKitResolveEns,
  spruceKitResolveLens,
  SpruceKitLensProfilesResponse,
  SpruceKitEnsResolveOptions,
  isSpruceKitRouteConfig,
} from "@spruceid/sprucekit-core";
import {
  SpruceKitClientSession,
  SpruceKitClientConfig,
  ISpruceKitConnected,
  SpruceKitExtension,
  GnosisDelegation,
} from "@spruceid/sprucekit-core/client";

/** UserAuthorization Module
 *
 * Handles the capabilities that a user can provide a dapp, specifically
 * authentication and authorization. This resource handles  all key and
 * signing capabilities including:
 * - ethereum provider, wallet connection, SIWE message creation and signing
 * - session key management
 * - creates, manages, and handles session data
 * - manages/provides capabilities
 */
interface IUserAuthorization {
  /* properties */
  provider: BrowserProvider;
  session?: SpruceKitClientSession;

  /* createUserAuthorization */
  extend: (extension: SpruceKitExtension) => void;
  connect(): Promise<any>;
  signIn(): Promise<any>;
  /**
   * ENS data supported by SpruceKit.
   * @param address - User address.
   * @param resolveEnsOpts - Options to resolve ENS.
   * @returns Object containing ENS data.
   */
  resolveEns(
    /** User address */
    address: string,
    resolveEnsOpts: SpruceKitEnsResolveOptions
  ): Promise<SpruceKitEnsData>;
  /**
   * Resolves Lens profiles owned by the given Ethereum Address. Each request is
   * limited by 10. To get other pages you must pass the pageCursor parameter.
   *
   * Lens profiles can be resolved on the Polygon Mainnet (matic) or Mumbai
   * Testnet (matic-mumbai). Visit https://docs.lens.xyz/docs/api-links for more
   * information.
   *
   * @param address - Ethereum User address.
   * @param pageCursor - Page cursor used to paginate the request. Default to
   * first page. Visit https://docs.lens.xyz/docs/get-profiles#api-details for
   * more information.
   * @returns Object containing Lens profiles items and pagination info.
   */
  resolveLens(
    /* Ethereum User Address. */
    address: string,
    /* Page cursor used to paginate the request. Default to first page. */
    pageCursor: string
  ): Promise<string | SpruceKitLensProfilesResponse>;
  address(): string | undefined;
  chainId(): number | undefined;
  /**
   * Signs a message using the private key of the connected address.
   * @returns signature;
   */
  signMessage(message: string): Promise<string>;
  getSigner(): Promise<Signer>;
  /* getUserAuthorization */
  // getSIWE
  // getSessionData
  // getCapabilities
  /* listUserAuthorization */
  /* deleteUserAuthorization */
  signOut(): Promise<any>;
  // signOut()
  /* updateUserAuthorization */
  // requestCapabilities()
}

class UserAuthorizationInit {
  /** Extensions for the SpruceKitClientSession. */
  private extensions: SpruceKitExtension[] = [];

  /** The session representation (once signed in). */
  public session?: SpruceKitClientSession;

  constructor(private config?: SpruceKitClientConfig) {}

  /** Extend the session with an SpruceKit compatible extension. */
  extend(extension: SpruceKitExtension) {
    this.extensions.push(extension);
  }

  /**
   * Connect to the signing account using the configured provider.
   * @returns UserAuthorizationConnected instance.
   */
  async connect(): Promise<UserAuthorizationConnected> {
    let provider: BrowserProvider;

    // eslint-disable-next-line no-underscore-dangle
    if (!this.config.providers.web3.driver?._isProvider) {
      try {
        provider = new BrowserProvider(this.config.providers.web3.driver);
      } catch (err) {
        // Provider creation error
        console.error(err);
        throw err;
      }
    } else {
      provider = this.config.providers.web3.driver;
    }

    if (
      !this.config.providers.web3?.driver?.bridge?.includes("walletconnect")
    ) {
      const connectedAccounts = await provider.listAccounts();
      if (connectedAccounts.length === 0) {
        try {
          await provider.send("wallet_requestPermissions", [
            { eth_accounts: {} },
          ]);
        } catch (err) {
          // Permission rejected error
          console.error(err);
          throw err;
        }
      }
    }

    let builder;
    try {
      builder = await initialized.then(
        () => new spruceKitSession.SpruceKitSessionBuilder()
      );
    } catch (err) {
      // SpruceKit wasm related error
      console.error(err);
      throw err;
    }

    return new UserAuthorizationConnected(
      builder,
      this.config,
      this.extensions,
      provider
    );
  }
}

/** An intermediate SpruceKit state: connected, but not signed-in. */
class UserAuthorizationConnected implements ISpruceKitConnected {
  /**
   * Promise that is initialized on construction of this class to run the "afterConnect" methods
   * of the extensions.
   */
  public afterConnectHooksPromise: Promise<void>;

  /** Verifies if extension is enabled. */
  public isExtensionEnabled = (namespace: string) =>
    this.extensions.filter((e) => e.namespace === namespace).length === 1;

  /** Axios instance. */
  public api?: AxiosInstance;

  /** Ethereum Provider */

  constructor(
    /** Instance of SpruceKitSessionBuilder */
    public builder: spruceKitSession.SpruceKitSessionBuilder,
    /** SpruceKitConfig object. */
    public config: SpruceKitClientConfig,
    /** Enabled extensions. */
    public extensions: SpruceKitExtension[],
    /** EthersJS provider. */
    public provider: BrowserProvider
  ) {
    this.afterConnectHooksPromise = this.applyExtensions();
    if (this.config.providers?.server?.host) {
      this.api = axios.create({
        baseURL: this.config.providers.server.host,
        withCredentials: true,
      });
    }
    // this.provider = provider;
  }

  /** Applies the "afterConnect" methods and the delegated capabilities of the extensions. */
  public async applyExtensions(): Promise<void> {
    for (const extension of this.extensions) {
      if (extension.afterConnect) {
        const overrides = await extension.afterConnect(this);
        this.config = {
          ...this.config,
          siweConfig: { ...this.config?.siweConfig, ...overrides?.siwe },
        };
      }

      if (extension.namespace && extension.defaultActions) {
        const defaults = await extension.defaultActions();
        this.builder.addDefaultActions(extension.namespace, defaults);
      }

      if (extension.namespace && extension.extraFields) {
        const defaults = await extension.extraFields();
        this.builder.addExtraFields(extension.namespace, defaults);
      }

      if (extension.namespace && extension.targetedActions) {
        const targetedActions = await extension.targetedActions();
        for (const target in targetedActions) {
          this.builder.addTargetedActions(
            extension.namespace,
            target,
            targetedActions[target]
          );
        }
      }
    }
  }

  /**
   * Applies the "afterSignIn" methods of the extensions.
   * @param session - SpruceKitClientSession object.
   */
  public async afterSignIn(session: SpruceKitClientSession): Promise<void> {
    for (const extension of this.extensions) {
      if (extension.afterSignIn) {
        await extension.afterSignIn(session);
      }
    }
  }

  /**
   * Requests nonce from server.
   * @param params - Request params.
   * @returns Promise with nonce.
   */
  public async spruceKitServerNonce(
    params: Record<string, any>
  ): Promise<string> {
    const route =
      this.config.providers?.server?.routes?.nonce ?? "/sprucekit-nonce";
    const requestConfig = isSpruceKitRouteConfig(route)
      ? {
          customAPIOperation: undefined,
          ...route,
        }
      : {
          customAPIOperation: undefined,
          url: route,
        };

    const { customAPIOperation } = requestConfig;
    if (customAPIOperation) {
      return customAPIOperation(params);
    }

    if (this.api) {
      let nonce;

      try {
        nonce = (
          await this.api.request({
            method: "get",
            url: "/sprucekit-nonce",
            ...requestConfig,
            params,
          })
        ).data;
      } catch (error) {
        console.error(error);
        throw error;
      }
      if (!nonce) {
        throw new Error("Unable to retrieve nonce from server.");
      }
      return nonce;
    }
  }

  /**
   * Requests sign in from server and returns session.
   * @param session - SpruceKitClientSession object.
   * @returns Promise with server session data.
   */
  public async spruceKitServerLogin(
    session: SpruceKitClientSession
  ): Promise<any> {
    const route =
      this.config.providers?.server?.routes?.login ?? "/sprucekit-login";
    const requestConfig = isSpruceKitRouteConfig(route)
      ? {
          customAPIOperation: undefined,
          ...route,
        }
      : {
          customAPIOperation: undefined,
          url: route,
        };
    const { customAPIOperation } = requestConfig;

    if (customAPIOperation) {
      return customAPIOperation(session);
    }

    if (this.api) {
      let resolveEns: boolean | SpruceKitEnsResolveOptions = false;
      if (
        typeof this.config.resolveEns === "object" &&
        this.config.resolveEns.resolveOnServer
      ) {
        resolveEns = this.config.resolveEns.resolve;
      }

      const resolveLens: boolean = this.config.resolveLens === "onServer";

      try {
        const data = {
          signature: session.signature,
          siwe: session.siwe,
          address: session.address,
          walletAddress: session.walletAddress,
          chainId: session.chainId,
          daoLogin: this.isExtensionEnabled("delegationRegistry"),
          resolveEns,
          resolveLens,
        };
        // @TODO(w4ll3): figure out how to send a custom sessionKey
        return this.api
          .request({
            method: "post",
            url: "/sprucekit-login",
            ...requestConfig,
            data,
          })
          .then((response) => response.data);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  }

  /**
   * Requests the user to sign in.
   * Generates the SIWE message for this session, requests the configured
   * Signer to sign the message, calls the "afterSignIn" methods of the
   * extensions.
   * @returns Promise with the SpruceKitClientSession object.
   */
  async signIn(): Promise<SpruceKitClientSession> {
    await this.afterConnectHooksPromise;
    const sessionKey = this.builder.jwk();
    if (sessionKey === undefined) {
      return Promise.reject(new Error("unable to retrieve session key"));
    }
    const signer = await this.provider.getSigner();
    const walletAddress = await signer.getAddress();
    const defaults = {
      address: this.config.siweConfig?.address ?? walletAddress,
      walletAddress,
      // @TODO: resolve the casting
      chainId: Number((await this.provider._detectNetwork()).chainId),
      domain: globalThis.location.hostname,
      issuedAt: new Date().toISOString(),
      nonce: generateNonce(),
    };

    const serverNonce = await this.spruceKitServerNonce(defaults);
    if (serverNonce) defaults.nonce = serverNonce;

    const siweConfig = merge(defaults, this.config.siweConfig);
    const siwe = await this.builder.build(siweConfig);
    const signature = await signer.signMessage(siwe);

    let session = {
      address: siweConfig.address,
      walletAddress,
      chainId: siweConfig.chainId,
      sessionKey,
      siwe,
      signature,
    };

    const response = await this.spruceKitServerLogin(session);

    session = {
      ...session,
      ...response,
    };

    await this.afterSignIn(session);

    return session;
  }

  /**
   * Requests the user to sign out.
   * @param session - SpruceKitClientSession object.
   */
  async signOut(session: SpruceKitClientSession): Promise<void> {
    // get request configuration
    const route =
      this.config.providers?.server?.routes?.login ?? "/sprucekit-logout";
    const requestConfig = isSpruceKitRouteConfig(route)
      ? {
          customAPIOperation: undefined,
          ...route,
        }
      : {
          customAPIOperation: undefined,
          url: route,
        };
    // check if we should run a custom operation instead
    const { customAPIOperation } = requestConfig;

    if (customAPIOperation) {
      return customAPIOperation(session);
    }

    if (this.api) {
      try {
        const data = { ...session };

        await this.api.request({
          method: "post",
          url: "/sprucekit-logout",
          ...requestConfig,
          data,
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  }
}
const SPRUCEKIT_DEFAULT_CONFIG: SpruceKitClientConfig = {
  providers: {
    web3: {
      driver: globalThis.ethereum,
    },
  },
};

class UserAuthorization implements IUserAuthorization {
  /** The Ethereum provider */
  public provider: BrowserProvider;

  /** The session representation (once signed in). */
  public session?: SpruceKitClientSession;

  /** SpruceKitClientSession builder. */
  private init: UserAuthorizationInit;

  /** Current connection of SpruceKit */
  private connection?: UserAuthorizationConnected;

  /** The SpruceKitClientConfig object. */
  private config: SpruceKitClientConfig;

  constructor(
    private _config: SpruceKitClientConfig = SPRUCEKIT_DEFAULT_CONFIG
  ) {
    this.config = _config;
    this.init = new UserAuthorizationInit({
      ...this.config,
      providers: {
        ...SPRUCEKIT_DEFAULT_CONFIG.providers,
        ...this.config?.providers,
      },
    });

    if (this.config.enableDaoLogin) {
      const gnosis = new GnosisDelegation();
      this.init.extend(gnosis);
    }
  }

  /**
   * Extends SpruceKit with a functions that are called after connecting and signing in.
   */
  public extend(extension: SpruceKitExtension): void {
    this.init.extend(extension);
  }

  public async connect(): Promise<void> {
    if (this.connection) {
      return;
    }
    try {
      this.connection = await this.init.connect();
      this.provider = this.connection.provider;
    } catch (err) {
      // ERROR:
      // Something went wrong when connecting or creating Session (wasm)
      console.error(err);
      throw err;
    }
  }

  public async signIn(): Promise<SpruceKitClientSession> {
    await this.connect();

    try {
      this.session = await this.connection.signIn();
    } catch (err) {
      // Request to /sprucekit-login went wrong
      console.error(err);
      throw err;
    }
    const promises = [];

    let resolveEnsOnClient = false;
    if (this.config.resolveEns) {
      if (this.config.resolveEns === true) {
        resolveEnsOnClient = true;
        promises.push(this.resolveEns(this.session.address));
      } else if (!this.config.resolveEns.resolveOnServer) {
        resolveEnsOnClient = true;

        promises.push(
          this.resolveEns(this.session.address, this.config.resolveEns.resolve)
        );
      }
    }

    const resolveLensOnClient = this.config.resolveLens === true;
    if (resolveLensOnClient) {
      promises.push(this.resolveLens(this.session.address));
    }

    await Promise.all(promises).then(([ens, lens]) => {
      if (!resolveEnsOnClient && resolveLensOnClient) {
        [ens, lens] = [undefined, ens];
      }
      if (ens) {
        this.session.ens = ens;
      }
      if (lens) {
        this.session.lens = lens;
      }
    });

    return this.session;
  }

  /**
   * ENS data supported by SpruceKit.
   * @param address - User address.
   * @param resolveEnsOpts - Options to resolve ENS.
   * @returns Object containing ENS data.
   */
  public async resolveEns(
    /** User address */
    address: string,
    resolveEnsOpts: SpruceKitEnsResolveOptions = {
      domain: true,
      avatar: true,
    }
  ): Promise<SpruceKitEnsData> {
    return spruceKitResolveEns(
      this.connection.provider,
      address,
      resolveEnsOpts
    );
  }

  /**
   * Resolves Lens profiles owned by the given Ethereum Address. Each request is
   * limited by 10. To get other pages you must to pass the pageCursor parameter.
   *
   * Lens profiles can be resolved on the Polygon Mainnet (matic) or Mumbai Testnet
   * (matic-mumbai). Visit https://docs.lens.xyz/docs/api-links for more information.
   *
   * @param address - Ethereum User address.
   * @param pageCursor - Page cursor used to paginate the request. Default to
   * first page. Visit https://docs.lens.xyz/docs/get-profiles#api-details for more
   * information.
   * @returns Object containing Lens profiles items and pagination info.
   */
  public async resolveLens(
    /* Ethereum User Address. */
    address: string,
    /* Page cursor used to paginate the request. Default to first page. */
    pageCursor = "{}"
  ): Promise<string | SpruceKitLensProfilesResponse> {
    return spruceKitResolveLens(this.connection.provider, address, pageCursor);
  }

  /**
   * Invalidates user's session.
   */
  public async signOut(): Promise<void> {
    try {
      await this.connection.signOut(this.session);
    } catch (err) {
      // request to /sprucekit-logout went wrong
      console.error(err);
      throw err;
    }
    this.session = undefined;
    this.connection = undefined;
  }

  /**
   * Gets the address that is connected and signed in.
   * @returns Address.
   */
  public address: () => string | undefined = () => this.session?.address;

  /**
   * Get the chainId that the address is connected and signed in on.
   * @returns chainId.
   */
  public chainId: () => number | undefined = () => this.session?.chainId;

  /**
   * Signs a message using the private key of the connected address.
   * @returns signature;
   */
  public async signMessage(message: string): Promise<string> {
    return (await this.provider.getSigner()).signMessage(message);
  }

  /**
   * Gets the provider that is connected and signed in.
   * @returns Provider.
   */
  public getProvider(): BrowserProvider | undefined {
    return this.provider;
  }

  /**
   * Returns the signer of the connected address.
   * @returns ethers.Signer
   * @see https://docs.ethers.io/v5/api/signer/#Signer
   */
  public async getSigner(): Promise<Signer> {
    return await this.provider.getSigner();
  }
}

export {
  IUserAuthorization,
  UserAuthorization,
  UserAuthorizationInit,
  UserAuthorizationConnected,
};
