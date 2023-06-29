import {
  isSpruceKitAlchemyProvider,
  isSpruceKitAnkrProvider,
  isSpruceKitCloudflareProvider,
  isSpruceKitCustomProvider,
  isSpruceKitEtherscanProvider,
  isSpruceKitInfuraProvider,
  isSpruceKitPocketProvider,
  SpruceKitAlchemyProviderNetworks,
  SpruceKitAnkrProviderNetworks,
  SpruceKitEnsData,
  SpruceKitEtherscanProviderNetworks,
  SpruceKitInfuraProviderNetworks,
  SpruceKitLensProfilesResponse,
  SpruceKitPocketProviderNetworks,
  SpruceKitRPCProvider,
} from "../types";
import {
  getDefaultProvider,
  AbstractProvider,
  EtherscanProvider,
  InfuraProvider,
  AlchemyProvider,
  PocketProvider,
  CloudflareProvider,
  AnkrProvider,
  JsonRpcProvider,
} from "ethers";
import axios from "axios";
import { getProfilesQuery } from "./queries";

/**
 * @param rpc - SpruceKitRPCProvider
 * @returns an ethers provider based on the RPC configuration.
 */
export const getProvider = (rpc?: SpruceKitRPCProvider): AbstractProvider => {
  if (!rpc) {
    return getDefaultProvider("mainnet");
  }
  if (isSpruceKitEtherscanProvider(rpc)) {
    return new EtherscanProvider(
      rpc.network ?? SpruceKitEtherscanProviderNetworks.MAINNET,
      rpc.apiKey
    );
  }
  if (isSpruceKitInfuraProvider(rpc)) {
    return new InfuraProvider(
      rpc.network ?? SpruceKitInfuraProviderNetworks.MAINNET,
      typeof rpc.apiKey === "string" ? rpc.apiKey : rpc.apiKey?.projectId,
      typeof rpc.apiKey === "string" ? null : rpc.apiKey?.projectSecret
    );
  }
  if (isSpruceKitAlchemyProvider(rpc)) {
    return new AlchemyProvider(
      rpc.network ?? SpruceKitAlchemyProviderNetworks.MAINNET,
      rpc.apiKey
    );
  }
  if (isSpruceKitCloudflareProvider(rpc)) {
    return new CloudflareProvider();
  }
  if (isSpruceKitPocketProvider(rpc)) {
    return new PocketProvider(
      rpc.network ?? SpruceKitPocketProviderNetworks.MAINNET,
      rpc.apiKey
    );
  }
  if (isSpruceKitAnkrProvider(rpc)) {
    return new AnkrProvider(
      rpc.network ?? SpruceKitAnkrProviderNetworks.MAINNET,
      rpc.apiKey
    );
  }
  if (isSpruceKitCustomProvider(rpc)) {
    return new JsonRpcProvider(rpc.url, rpc.network);
  }
  return getDefaultProvider("mainnet");
};

/**
 * Resolves ENS data supported by SpruceKit.
 * @param provider - Ethers provider.
 * @param address - User address.
 * @param resolveEnsOpts - Options to resolve ENS.
 * @returns Object containing ENS data.
 */
export const spruceKitResolveEns = async (
  provider: AbstractProvider,
  /* User Address */
  address: string,
  resolveEnsOpts: {
    /* Enables ENS domain/name resolution */
    domain?: boolean;
    /* Enables ENS avatar resolution */
    avatar?: boolean;
  } = {
    domain: true,
    avatar: true,
  }
): Promise<SpruceKitEnsData> => {
  if (!address) {
    throw new Error("Missing address.");
  }
  const ens: SpruceKitEnsData = {};
  const promises: Array<Promise<any>> = [];
  if (resolveEnsOpts?.domain) {
    promises.push(provider.lookupAddress(address));
  }
  if (resolveEnsOpts?.avatar) {
    promises.push(provider.getAvatar(address));
  }

  await Promise.all(promises)
    .then(([domain, avatarUrl]) => {
      if (!resolveEnsOpts.domain && resolveEnsOpts.avatar) {
        [domain, avatarUrl] = [undefined, domain];
      }
      if (domain) {
        ens["domain"] = domain;
      }
      if (avatarUrl) {
        ens["avatarUrl"] = avatarUrl;
      }
    })
    .catch(console.error);

  return ens;
};

const LENS_API_LINKS = {
  matic: "https://api.lens.dev",
  "matic-mumbai": "https://api-mumbai.lens.dev",
};

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
export const spruceKitResolveLens = async (
  provider: AbstractProvider,
  /* Ethereum User Address. */
  address: string,
  /* Page cursor used to paginate the request. Default to first page. */
  pageCursor: string = "{}"
): Promise<SpruceKitLensProfilesResponse | string> => {
  if (!address) {
    throw new Error("Missing address.");
  }

  const networkName = (await provider.getNetwork()).name;
  const apiURL: string | null = LENS_API_LINKS[networkName];

  if (!apiURL) {
    return `Can't resolve Lens to ${address} on network '${networkName}'. Use 'matic' (Polygon) or 'matic-mumbai' (Mumbai) instead.`;
  }

  let lens: { data: { profiles: SpruceKitLensProfilesResponse } };
  try {
    lens = (
      await axios({
        url: apiURL,
        method: "post",
        data: {
          operationName: "Profiles",
          query: getProfilesQuery,
          variables: {
            addresses: [address],
            cursor: pageCursor,
          },
        },
      })
    ).data;
  } catch (err) {
    throw new Error(err?.response?.data?.errors ?? err);
  }
  return lens.data.profiles;
};
