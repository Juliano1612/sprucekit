import {
  getProvider,
  SpruceKitRPCProvider,
  SpruceKitRPCProviders,
  spruceKitResolveEns,
  spruceKitResolveLens,
  SpruceKitInfuraProviderNetworks,
} from "../src";

const sprucekitRPCProviders: Record<string, SpruceKitRPCProvider> = {
  etherscan: {
    service: SpruceKitRPCProviders.SpruceKitEtherscanProvider,
  },
  infura: {
    service: SpruceKitRPCProviders.SpruceKitInfuraProvider,
  },
  alchemy: {
    service: SpruceKitRPCProviders.SpruceKitAlchemyProvider,
  },
  cloudflare: {
    service: SpruceKitRPCProviders.SpruceKitCloudflareProvider,
  },
  pocket: {
    service: SpruceKitRPCProviders.SpruceKitPocketProvider,
  },
  ankr: {
    service: SpruceKitRPCProviders.SpruceKitAnkrProvider,
  },
  custom: {
    service: SpruceKitRPCProviders.SpruceKitCustomProvider,
  },
};

test("Should get Etherscan Provider successfully", () => {
  let provider;
  expect(async () => {
    provider = getProvider(sprucekitRPCProviders.etherscan);
  }).not.toThrowError();

  expect(provider.getBaseUrl()).toEqual("https://api.etherscan.io");
});

test("Should get Infura Provider successfully", () => {
  expect(() => {
    getProvider(sprucekitRPCProviders.infura);
  }).not.toThrowError();
});

test("Should get Alchemy Provider successfully", () => {
  expect(() => {
    getProvider(sprucekitRPCProviders.alchemy);
  }).not.toThrowError();
});

test("Should get Cloudflare Provider successfully", () => {
  expect(() => {
    getProvider(sprucekitRPCProviders.cloudflare);
  }).not.toThrowError();
});

test("Should get Poket Provider successfully", () => {
  expect(() => {
    getProvider(sprucekitRPCProviders.pocket);
  }).not.toThrowError();
});

test("Should get Ankr Provider successfully", () => {
  expect(() => {
    getProvider(sprucekitRPCProviders.ankr);
  }).not.toThrowError();
});

test("Should get Custom Provider successfully", () => {
  expect(() => {
    getProvider(sprucekitRPCProviders.custom);
  }).not.toThrowError();
});

test("Should get default Provider successfully", () => {
  expect(() => {
    getProvider();
  }).not.toThrowError();
});

test("Should fail to resolve ENS domain", async () => {
  const provider = getProvider(sprucekitRPCProviders.goerli);
  await expect(spruceKitResolveEns(provider, "")).rejects.toThrow();
}, 30000);

test("Should resolve ENS domain successfully", async () => {
  const provider = getProvider(sprucekitRPCProviders.goerli);
  await expect(
    spruceKitResolveEns(
      provider,
      "0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF1",
      {
        domain: true,
        avatar: false,
      }
    )
  ).resolves.not.toThrow();
}, 30000);

test("Should resolve ENS avatar successfully", async () => {
  const provider = getProvider(sprucekitRPCProviders.goerli);
  await expect(
    spruceKitResolveEns(
      provider,
      "0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF1",
      {
        domain: false,
        avatar: true,
      }
    )
  ).resolves.not.toThrow();
}, 30000);

test("Should resolve ENS domain and avatar successfully", async () => {
  const provider = getProvider(sprucekitRPCProviders.goerli);
  await expect(
    spruceKitResolveEns(
      provider,
      "0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF1",
      {
        domain: true,
        avatar: true,
      }
    )
  ).resolves.not.toThrow();
}, 30000);

test("Should fail requesting Lens profile", async () => {
  const provider = getProvider({
    service: SpruceKitRPCProviders.SpruceKitInfuraProvider,
    network: SpruceKitInfuraProviderNetworks.POLYGON,
  });

  await expect(
    spruceKitResolveLens(
      provider,
      "0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF111"
    )
  ).rejects.toThrow();
});

test("Should resolve Lens profile on Mainnet with a message advertising about the network", async () => {
  const provider = getProvider(sprucekitRPCProviders.infura);

  await expect(
    spruceKitResolveLens(provider, "0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF1")
  ).resolves.toEqual(
    `Can't resolve Lens to 0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF1 on network 'mainnet'. Use 'matic' (Polygon) or 'matic-mumbai' (Mumbai) instead.`
  );
}, 30000);

test("Should resolve Lens profile on Polygon Mainnet successfully", async () => {
  const provider = getProvider({
    service: SpruceKitRPCProviders.SpruceKitInfuraProvider,
    network: SpruceKitInfuraProviderNetworks.POLYGON,
  });

  await expect(
    spruceKitResolveLens(provider, "0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF1")
  ).resolves.toEqual(
    expect.objectContaining({
      pageInfo: expect.objectContaining({
        prev: '{"offset":0}',
        next: '{"offset":1}',
      }),
    })
  );
}, 30000);

test("Should resolve Lens profile on Mumbai Testnet successfully", async () => {
  const provider = getProvider({
    service: SpruceKitRPCProviders.SpruceKitInfuraProvider,
    network: SpruceKitInfuraProviderNetworks.POLYGON_MUMBAI,
  });

  await expect(
    spruceKitResolveLens(provider, "0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF1")
  ).resolves.toEqual(
    expect.objectContaining({
      pageInfo: expect.objectContaining({
        prev: '{"offset":0}',
        next: null,
      }),
    })
  );
}, 30000);
