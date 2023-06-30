import {
  SpruceKitRPCProviders,
  SpruceKitEnsData,
  SpruceKitEnsResolveOptions,
  SpruceKitLensProfilesResponse,
} from "@spruceid/sprucekit-core";
import {
  IUserAuthorization,
  KeplerStorage,
  UserAuthorization,
} from "./modules";
import {
  SpruceKitClientConfig,
  SpruceKitClientSession,
  SpruceKitExtension,
} from "@spruceid/sprucekit-core/client";
import type { BrowserProvider, Signer } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Configuration for managing SpruceKit Modules
 */
interface SpruceKitModuleConfig {
  storage?: boolean | { [key: string]: any };
}

// temporary: will move to sprucekit-core
interface SpruceKitConfig extends SpruceKitClientConfig {
  modules?: SpruceKitModuleConfig;
}

const SPRUCEKIT_DEFAULT_CONFIG: SpruceKitClientConfig = {
  providers: {
    web3: {
      driver: globalThis.ethereum,
    },
  },
};

/** SpruceKit: Self-sovereign anything.
 *
 * A toolbox for user-controlled identity, credentials, storage and more.
 */
export class SpruceKit {
  /** The Ethereum provider */
  public provider: BrowserProvider;

  /** Supported RPC Providers */
  public static RPCProviders = SpruceKitRPCProviders;

  /** UserAuthorization Module
   *
   * Handles the capabilities that a user can provide a app, specifically
   * authentication and authorization. This resource handles all key and
   * signing capabilities including:
   * - ethereum provider, wallet connection, SIWE message creation and signing
   * - session key management
   * - creates, manages, and handles session data
   * - manages/provides capabilities
   */
  public userAuthorization: IUserAuthorization;

  /** Storage Module */
  public storage: KeplerStorage;

  constructor(private config: SpruceKitConfig = SPRUCEKIT_DEFAULT_CONFIG) {
    // TODO: pull out config validation into separate function
    // TODO: pull out userAuthorization config
    this.userAuthorization = new UserAuthorization(config);

    // initialize storage module
    // assume storage module is **disabled** if config.storage is not defined
    const storageConfig =
      config?.modules?.storage === undefined ? false : config.modules.storage;

    if (storageConfig !== false) {
      if (typeof storageConfig === "object") {
        // Initialize storage with the provided config
        this.storage = new KeplerStorage(storageConfig, this.userAuthorization);
      } else {
        // storage == true or undefined
        // Initialize storage with default config when no other condition is met
        this.storage = new KeplerStorage(
          { prefix: "sprucekit" },
          this.userAuthorization
        );
      }
      this.extend(this.storage);
    }
  }

  /**
   * Extends SpruceKit with a functions that are called after connecting and signing in.
   */
  public extend(extension: SpruceKitExtension): void {
    this.userAuthorization.extend(extension);
  }

  /**
   * Request the user to sign in, and start the session.
   * @returns Object containing information about the session
   */
  public signIn = async (): Promise<SpruceKitClientSession> => {
    return this.userAuthorization.signIn();
  };

  /**
   * Invalidates user's session.
   */
  public signOut = async (): Promise<void> => {
    return this.userAuthorization.signOut();
  };

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
    return this.userAuthorization.resolveEns(address, resolveEnsOpts);
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
  async resolveLens(
    /* Ethereum User Address. */
    address: string,
    /* Page cursor used to paginate the request. Default to first page. */
    pageCursor = "{}"
  ): Promise<string | SpruceKitLensProfilesResponse> {
    return this.userAuthorization.resolveLens(address, pageCursor);
  }

  /**
   * Gets the session representation (once signed in). 
   * @returns Address.
   */
  public session: () => SpruceKitClientSession | undefined = () =>
    this.userAuthorization.session;

  /**
   * Gets the address that is connected and signed in.
   * @returns Address.
   */
  public address: () => string | undefined = () =>
    this.userAuthorization.address();

  /**
   * Get the chainId that the address is connected and signed in on.
   * @returns chainId.
   */
  public chainId: () => number | undefined = () =>
    this.userAuthorization.chainId();

  /**
   * Gets the provider that is connected and signed in.
   * @returns Provider.
   */
  public getProvider(): BrowserProvider | undefined {
    return this.userAuthorization.provider;
  }

  /**
   * Returns the signer of the connected address.
   * @returns ethers.Signer
   * @see https://docs.ethers.io/v5/api/signer/#Signer
   */
  public async getSigner(): Promise<Signer> {
    return await this.userAuthorization.provider.getSigner();
  }
}
