import { providers } from 'ethers';
import { ConnectionInfo } from "ethers/lib/utils";
import { SpruceKitClientSession } from "./client";
import type { AxiosRequestConfig } from "axios";

/** SpruceKit Route Configuration
 *  This configuration is used to override the default endpoint paths.
 * The config options here are a subset of the
 * [AxiosRequestConfig](https://axios-http.com/docs/req_config).
 * This type does not explicitly extend AxiosRequestConfig,
 * but those options are supported by the client.
 */
export interface SpruceKitRouteConfig {
  /** Endpoint path. */
  url?: string;
  /** Endpoint request method. */
  method?: "get" | "post" | "put" | "delete";
  /** Custom Operation.
   * Replace the sprucekit function called with a function of your own
   **/
  customAPIOperation?(
    params: SpruceKitClientSession | Record<string, any> | any
  ): Promise<any>;
}

/** Type-Guard for SpruceKitRouteConfig. */
export const isSpruceKitRouteConfig = (
  config: SpruceKitServerRouteEndpointType
): config is SpruceKitRouteConfig | AxiosRequestConfig | SpruceKitServerMiddlewareConfig =>
  typeof config === "object";

export interface SpruceKitServerMiddlewareConfig {
  path: string;
  callback?: (req: any, body?: Record<string, any>) => Promise<void> | void;
}

/** Type-Guard for SpruceKitServerMiddlewareConfig. */
export const isSpruceKitServerMiddlewareConfig = (
  config: SpruceKitServerRouteEndpointType
): config is SpruceKitServerMiddlewareConfig =>
  (config as SpruceKitServerMiddlewareConfig)?.path !== undefined;

export type SpruceKitServerRouteEndpointType =
  | Partial<SpruceKitRouteConfig>
  | AxiosRequestConfig
  | string
  | SpruceKitServerMiddlewareConfig;

/** Server endpoints configuration. */
export interface SpruceKitServerRoutes {
  /** Get nonce endpoint path. /sprucekit-nonce as default. */
  nonce?: SpruceKitServerRouteEndpointType;
  /** Post login endpoint path. /sprucekit-login as default. */
  login?: SpruceKitServerRouteEndpointType;
  /** Post logout endpoint path. /sprucekit-logout as default. */
  logout?: SpruceKitServerRouteEndpointType;
}

/** Server endpoints name configuration. */
export interface SpruceKitServerRouteNames {
  /** Get nonce endpoint path. /sprucekit-nonce as default. */
  nonce?: string;
  /** Post login endpoint path. /sprucekit-login as default. */
  login?: string;
  /** Post logout endpoint path. /sprucekit-logout as default. */
  logout?: string;
}

/** Supported provider types. */
export type SpruceKitRPCProvider =
  | SpruceKitGenericProvider
  | SpruceKitEtherscanProvider
  | SpruceKitInfuraProvider
  | SpruceKitAlchemyProvider
  | SpruceKitCloudflareProvider
  | SpruceKitPocketProvider
  | SpruceKitAnkrProvider
  | SpruceKitCustomProvider;

/** Enum of supported EthersJS providers. */
export enum SpruceKitRPCProviders {
  SpruceKitAlchemyProvider = "alchemy",
  SpruceKitAnkrProvider = "ankr",
  SpruceKitCloudflareProvider = "cloudflare",
  SpruceKitCustomProvider = "custom",
  SpruceKitEtherscanProvider = "etherscan",
  SpruceKitInfuraProvider = "infura",
  SpruceKitPocketProvider = "pocket",
}

/** Enum of supported networks for Etherscan. */
export enum SpruceKitEtherscanProviderNetworks {
  MAINNET = "homestead",
  ROPSTEN = "ropsten",
  RINKEBY = "rinkeby",
  GOERLI = "goerli",
  KOVAN = "kovan",
}

/** Etherscan provider settings. */
export type SpruceKitEtherscanProvider = {
  service: SpruceKitRPCProviders.SpruceKitEtherscanProvider;
  apiKey?: string;
  network?: SpruceKitEtherscanProviderNetworks;
};

/* Type-Guard for SpruceKitEtherScanProvider. */
export const isSpruceKitEtherscanProvider = (
  provider: SpruceKitRPCProvider
): provider is SpruceKitEtherscanProvider =>
  provider.service === SpruceKitRPCProviders.SpruceKitEtherscanProvider;

/** Enum of supported networks for Infura. */
export enum SpruceKitInfuraProviderNetworks {
  MAINNET = "homestead",
  ROPSTEN = "ropsten",
  RINKEBY = "rinkeby",
  GOERLI = "goerli",
  KOVAN = "kovan",
  POLYGON = "matic",
  POLYGON_MUMBAI = "maticmum",
  OPTIMISM = "optimism",
  OPTIMISM_KOVAN = "optimism-kovan",
  ARBITRUM = "arbitrum",
  ARBITRUM_RINKEBY = "arbitrum-rinkeby",
}

/** Infura provider project settings. */
export type SpruceKitInfuraProviderProjectSettings = {
  projectId: string;
  projectSecret: string;
};

/** Infura provider settings. */
export type SpruceKitInfuraProvider = {
  service: SpruceKitRPCProviders.SpruceKitInfuraProvider;
  apiKey: string | SpruceKitInfuraProviderProjectSettings;
  network?: SpruceKitInfuraProviderNetworks;
};

/* Type-Guard for SpruceKitInfuraProvider. */
export const isSpruceKitInfuraProvider = (
  provider: SpruceKitRPCProvider
): provider is SpruceKitInfuraProvider =>
  provider.service === SpruceKitRPCProviders.SpruceKitInfuraProvider;

/** Enum of supported networks for Alchemy. */
export enum SpruceKitAlchemyProviderNetworks {
  MAINNET = "homestead",
  ROPSTEN = "ropsten",
  RINKEBY = "rinkeby",
  GOERLI = "goerli",
  KOVAN = "kovan",
  POLYGON = "matic",
  POLYGON_MUMBAI = "maticmum",
  OPTIMISM = "optimism",
  OPTIMISM_KOVAN = "optimism-kovan",
  ARBITRUM = "arbitrum",
  ARBITRUM_RINKEBY = "arbitrum-rinkeby",
}

/** Alchemy provider settings. */
export type SpruceKitAlchemyProvider = {
  service: SpruceKitRPCProviders.SpruceKitAlchemyProvider;
  apiKey?: string;
  network?: SpruceKitAlchemyProviderNetworks;
};

/* Type-Guard for SpruceKitAlchemyProvider. */
export const isSpruceKitAlchemyProvider = (
  provider: SpruceKitRPCProvider
): provider is SpruceKitAlchemyProvider =>
  provider.service === SpruceKitRPCProviders.SpruceKitAlchemyProvider;

/** Cloudflare provider settings. */
export type SpruceKitCloudflareProvider = {
  service: SpruceKitRPCProviders.SpruceKitCloudflareProvider;
};

/* Type-Guard for SpruceKitCloudflareProvider. */
export const isSpruceKitCloudflareProvider = (
  provider: SpruceKitRPCProvider
): provider is SpruceKitCloudflareProvider =>
  provider.service === SpruceKitRPCProviders.SpruceKitCloudflareProvider;

/** Enum of supported networks for Pocket. */
export enum SpruceKitPocketProviderNetworks {
  MAINNET = "homestead",
  ROPSTEN = "ropsten",
  RINKEBY = "rinkeby",
  GOERLI = "goerli",
}

/** Pocket provider settings. */
export type SpruceKitPocketProvider = {
  service: SpruceKitRPCProviders.SpruceKitPocketProvider;
  apiKey?: string;
  network?: SpruceKitPocketProviderNetworks;
};

/** Type-Guard for SpruceKitPocketProvider. */
export const isSpruceKitPocketProvider = (
  provider: SpruceKitRPCProvider
): provider is SpruceKitPocketProvider =>
  provider.service === SpruceKitRPCProviders.SpruceKitPocketProvider;

/** Enum of supported networks for Ankr. */
export enum SpruceKitAnkrProviderNetworks {
  MAINNET = "homestead",
  POLYGON = "matic",
  ARBITRUM = "arbitrum",
}

/** Ankr provider settings. */
export type SpruceKitAnkrProvider = {
  service: SpruceKitRPCProviders.SpruceKitAnkrProvider;
  apiKey?: string;
  network?: SpruceKitAnkrProviderNetworks;
};

/** Type-Guard for SpruceKitAnkrProvider. */
export const isSpruceKitAnkrProvider = (
  provider: SpruceKitRPCProvider
): provider is SpruceKitAnkrProvider =>
  provider.service === SpruceKitRPCProviders.SpruceKitAnkrProvider;

/** Custom provider settings. */
export type SpruceKitCustomProvider = {
  service: SpruceKitRPCProviders.SpruceKitCustomProvider;
  url?: string | ConnectionInfo;
  network?: providers.Networkish;
};

/** Type-Guard for SpruceKitCustomProvider. */
export const isSpruceKitCustomProvider = (
  provider: SpruceKitRPCProvider
): provider is SpruceKitCustomProvider =>
  provider.service === SpruceKitRPCProviders.SpruceKitCustomProvider;

/** Generic provider settings. */
export type SpruceKitGenericProvider = {
  service: SpruceKitRPCProviders;
  url?: string | ConnectionInfo;
  network?: providers.Networkish;
  apiKey?: string | SpruceKitInfuraProviderProjectSettings;
};

/** ENS options supported by SpruceKit. */
export interface SpruceKitEnsResolveOptions {
  /** Enable ENS name/domain resolution. */
  domain?: boolean;
  /** Enable ENS avatar resolution. */
  avatar?: boolean;
}

/** ENS data supported by SpruceKit. */
export interface SpruceKitEnsData {
  /** ENS name/domain. */
  domain?: string | null;
  /** ENS avatar. */
  avatarUrl?: string | null;
}

/** Lens profiles page info */
export interface SpruceKitLensProfilesPageInfo {
  /** Cursor to previous page, e.g. '\{"offset":0\}'. */
  prev: string;
  /** Cursor to next page, e.g. '\{"offset":10\}'. */
  next: string;
  /** Total profiles available to retrieve. */
  totalCount: number;
}

/** Lens profiles item */
export interface SpruceKitLensProfileData {
  id: string;
  name: string | null;
  bio: string | null;
  attributes: Array<any>;
  followNftAddress: string | null;
  metadata: string | null;
  isDefault: boolean;
  picture: string | null;
  handle: string | null;
  coverPicture: string | null;
  ownedBy: string | null;
  dispatcher: any;
  stats: any;
  followModule: any;
}

/** Lens profiles. */
export interface SpruceKitLensProfilesResponse {
  /** Lens profiles array. */
  items: Array<SpruceKitLensProfileData>;
  /** Lens pagination info. */
  pageInfo?: SpruceKitLensProfilesPageInfo;
}
