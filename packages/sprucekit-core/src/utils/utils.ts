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
  providers, 
  getDefaultProvider
} from 'ethers';
import axios from "axios";
import { getProfilesQuery } from "./queries";

/**
 * @param rpc - SpruceKitRPCProvider
 * @returns an ethers provider based on the RPC configuration.
 */
export const getProvider = (rpc?: SpruceKitRPCProvider): providers.BaseProvider => {
  if (!rpc) {
    return getDefaultProvider();
  }
  if (isSpruceKitEtherscanProvider(rpc)) {
    return new providers.EtherscanProvider(
      rpc.network ?? SpruceKitEtherscanProviderNetworks.MAINNET,
      rpc.apiKey
    );
  }
  if (isSpruceKitInfuraProvider(rpc)) {
    return new providers.InfuraProvider(
      rpc.network ?? SpruceKitInfuraProviderNetworks.MAINNET,
      rpc.apiKey
    );
  }
  if (isSpruceKitAlchemyProvider(rpc)) {
    return new providers.AlchemyProvider(
      rpc.network ?? SpruceKitAlchemyProviderNetworks.MAINNET,
      rpc.apiKey
    );
  }
  if (isSpruceKitCloudflareProvider(rpc)) {
    return new providers.CloudflareProvider();
  }
  if (isSpruceKitPocketProvider(rpc)) {
    return new providers.PocketProvider(
      rpc.network ?? SpruceKitPocketProviderNetworks.MAINNET,
      rpc.apiKey
    );
  }
  if (isSpruceKitAnkrProvider(rpc)) {
    return new providers.AnkrProvider(
      rpc.network ?? SpruceKitAnkrProviderNetworks.MAINNET,
      rpc.apiKey
    );
  }
  if (isSpruceKitCustomProvider(rpc)) {
    return new providers.JsonRpcProvider(rpc.url, rpc.network);
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
  provider: providers.BaseProvider,
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
  maticmum: "https://api-mumbai.lens.dev",
};

/**
 * Resolves Lens profiles owned by the given Ethereum Address. Each request is
 * limited by 10. To get other pages you must to pass the pageCursor parameter.
 *
 * Lens profiles can be resolved on the Polygon Mainnet (matic) or Mumbai Testnet
 * (maticmum). Visit https://docs.lens.xyz/docs/api-links for more information.
 *
 * @param address - Ethereum User address.
 * @param pageCursor - Page cursor used to paginate the request. Default to
 * first page. Visit https://docs.lens.xyz/docs/get-profiles#api-details for more
 * information.
 * @returns Object containing Lens profiles items and pagination info.
 */
export const spruceKitResolveLens = async (
  provider: providers.BaseProvider,
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
    return `Can't resolve Lens to ${address} on network '${networkName}'. Use 'matic' (Polygon) or 'maticmum' (Mumbai) instead.`;
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
