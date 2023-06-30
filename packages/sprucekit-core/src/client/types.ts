/* eslint-disable no-shadow */
import { sprucekitSession as spruceKitSession } from "@spruceid/sprucekit-wasm";
import { AxiosInstance } from "axios";
import { providers } from "ethers";
import {
  SpruceKitEnsData,
  SpruceKitEnsResolveOptions,
  SpruceKitLensProfilesResponse,
  SpruceKitRPCProvider,
  SpruceKitServerRoutes,
} from "../types";

/** Core config for SpruceKit. */
export interface SpruceKitClientConfig {
  /** Whether or not daoLogin is enabled. */
  enableDaoLogin?: boolean;
  /** Connection to a cryptographic keypair and/or network. */
  providers?: SpruceKitClientProviders;
  /** Optional session configuration for the SIWE message. */
  siweConfig?: SiweConfig;
  /** Whether or not ENS resolution is enabled. True means resolve all on client. */
  resolveEns?: boolean | SpruceKitEnsConfig;
  /** Whether or not Lens resolution is enabled. True means resolve on client. */
  resolveLens?: boolean | "onServer";
}

/** Representation of an active SpruceKitSession. */
export type SpruceKitClientSession = {
  /** User address */
  address: string;
  /** User address without delegation */
  walletAddress: string;
  chainId: number;
  /** Key to identify the session */
  sessionKey: string;
  /** The message that can be obtained by SiweMessage.prepareMessage() */
  siwe: string;
  /** The signature of the siwe message */
  signature: string;
  /** ENS data supported by SpruceKit */
  ens?: SpruceKitEnsData;
  /** Lens Profiles */
  lens?: string | SpruceKitLensProfilesResponse;
};

/** The URL of the server running sprucekit-server. Providing this field enables SIWE server communication */
export type SpruceKitServerHost = string;

/** The sprucekit-powered server configuration settings */
export type SpruceKitProviderServer = {
  host: SpruceKitServerHost;
  /** Optional configuration for the server's routes. */
  routes?: SpruceKitServerRoutes;
};

/** Web3 provider configuration settings */
export interface SpruceKitProviderWeb3 {
  /**
   * window.ethereum for Metamask;
   * web3modal.connect() for Web3Modal;
   * const signer = useSigner(); const provider = signer.provider; from Wagmi for Rainbowkit
   * */
  driver: any;
}

/** SpruceKit web3 configuration settings */
export interface SpruceKitClientProviders {
  /** Web3 wallet provider */
  web3?: SpruceKitProviderWeb3;
  /** JSON RPC provider configurations */
  rpc?: SpruceKitRPCProvider;
  /** Optional reference to server running sprucekit-server.
   * Providing this field enables communication with sprucekit-server */
  server?: SpruceKitProviderServer;
}

/** Optional session configuration for the SIWE message. */
export interface SiweConfig extends Partial<spruceKitSession.SiweConfig> {}

/** Extra SIWE fields. */
export type ExtraFields = spruceKitSession.ExtraFields;

/** Overrides for the session configuration. */
export type ConfigOverrides = {
  siwe?: SiweConfig;
};

/** ENS options supported by SpruceKit. */
export interface SpruceKitEnsConfig {
  /** Enable the ENS resolution on server instead of on client. */
  resolveOnServer?: boolean;
  /** ENS resolution options. True means resolve all. */
  resolve: SpruceKitEnsResolveOptions;
}

/** Interface to an intermediate SpruceKit state: connected, but not signed-in. */
export interface ISpruceKitConnected {
  /** Instance of SpruceKitSessionBuilder. */
  builder: spruceKitSession.SpruceKitSessionBuilder;
  /** SpruceKitConfig object. */
  config: SpruceKitClientConfig;
  /** List of enabled extensions. */
  extensions: SpruceKitExtension[];
  /** Web3 provider. */
  provider: providers.Web3Provider;
  /** Promise that is initialized on construction to run the "afterConnect" methods of extensions. */
  afterConnectHooksPromise: Promise<void>;
  /** Method to verify if extension is enabled. */
  isExtensionEnabled: (namespace: string) => boolean;
  /** Axios instance. */
  api?: AxiosInstance;
  /** Method to apply the "afterConnect" methods and the delegated capabilities of the extensions. */
  applyExtensions: () => Promise<void>;
  /** Method to apply the "afterSignIn" methods of the extensions. */
  afterSignIn: (session: SpruceKitClientSession) => Promise<void>;
  /** Method to request nonce from server. */
  spruceKitServerNonce: (params: Record<string, any>) => Promise<string>;
  /** Method to request sign in from server and return session. */
  spruceKitServerLogin: (session: SpruceKitClientSession) => Promise<any>;
  /** Method to request the user to sign in. */
  signIn: () => Promise<SpruceKitClientSession>;
  /** Method to request the user to sign out. */
  signOut: (session: SpruceKitClientSession) => Promise<void>;
}

/** Interface for an extension to SpruceKit. */
export interface SpruceKitExtension {
  /** [recap] Capability namespace. */
  namespace?: string;
  /** [recap] Default delegated actions in capability namespace. */
  defaultActions?(): Promise<string[]>;
  /** [recap] Delegated actions by target in capability namespace. */
  targetedActions?(): Promise<{ [target: string]: string[] }>;
  /** [recap] Extra metadata to help validate the capability. */
  extraFields?(): Promise<ExtraFields>;
  /** Hook to run after SpruceKit has connected to the user's wallet.
   * This can return an object literal to override the session configuration before the user
   * signs in. */
  afterConnect?(spruceKit: ISpruceKitConnected): Promise<ConfigOverrides>;
  /** Hook to run after SpruceKit has signed in. */
  afterSignIn?(session: SpruceKitClientSession): Promise<void>;
}
