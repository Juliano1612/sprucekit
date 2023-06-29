const { generateTestingUtils } = require("eth-testing");
const { TextEncoder: TE, TextDecoder: TD } = require("util");

jest.mock("axios");

global.TextEncoder = TE;
global.TextDecoder = TD;

const { SpruceKit } = require("../src");

test("Instantiate SpruceKit with window.ethereum", () => {
  expect(() => {
    const spruceKit = new SpruceKit();
  }).not.toThrowError();
});

test("Instantiate SpruceKit with providers.web3.driver and successfully sign in and sign out", async () => {
  const testingUtils = generateTestingUtils({ providerType: "MetaMask" });
  testingUtils.mockChainId("0x5");
  testingUtils.mockConnectedWallet([
    "0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF1",
  ]);
  const config = {
    providers: {
      web3: {
        driver: testingUtils.getProvider(),
      },
    },
    modules: {
      storage: false,
    },
  };
  const spruceKit = new SpruceKit(config);
  await expect(spruceKit.signIn()).resolves.not.toThrowError();
  await expect(spruceKit.signOut()).resolves.not.toThrowError();
});

test("Instantiate SpruceKit with providers.web3.driver and daoLogin", async () => {
  const testingUtils = generateTestingUtils({ providerType: "MetaMask" });
  testingUtils.mockChainId("0x1");
  testingUtils.mockConnectedWallet([
    "0x456c1182DecC365DCFb5F981dCaef671C539AD44",
  ]);
  const abi = [
    "event SetDelegate(address indexed delegator, bytes32 indexed id, address indexed delegate)",
    "event ClearDelegate(address indexed delegator, bytes32 indexed id, address indexed delegate)",
  ] as const;
  const contractTestingUtils = testingUtils.generateContractUtils(abi);
  contractTestingUtils.mockGetLogs("SetDelegate", []);
  contractTestingUtils.mockGetLogs("ClearDelegate", []);
  const config = {
    providers: {
      web3: {
        driver: testingUtils.getProvider(),
      },
    },
    enableDaoLogin: true,
    modules: {
      storage: false,
    },
  };
  const spruceKit = new SpruceKit(config);
  await expect(spruceKit.signIn()).resolves.not.toThrowError();
});

test("Instantiate SpruceKit with providers.web3.driver and server and successfully sign in and sign out", async () => {
  const testingUtils = generateTestingUtils({ providerType: "MetaMask" });
  testingUtils.mockChainId("0x5");
  testingUtils.mockConnectedWallet([
    "0x96F7fB7ed32640d9D3a982f67CD6c09fc53EBEF1",
  ]);
  const config = {
    providers: {
      web3: {
        driver: testingUtils.getProvider(),
      },
      server: {
        host: "http://localhost:3001",
      },
    },
    modules: {
      storage: false,
    },
  };
  const spruceKit = new SpruceKit(config);

  const mockAxios = jest.requireMock("axios");
  mockAxios.default.create = jest.fn().mockImplementation(() => ({
    request: async (props: { url: string }) => {
      switch (props.url) {
        case "/sprucekit-nonce":
          return { data: "ZH54GNgkQWB887iJU" };
        default:
          return { data: {} };
      }
    },
  }));

  await expect(spruceKit.signIn()).resolves.not.toThrowError();
  await expect(spruceKit.signOut()).resolves.not.toThrowError();
});

test("Should override paths successfully", async () => {
  expect(() => {
    const spruceKit = new SpruceKit({
      providers: {
        server: {
          host: "http://localhost:3001",
          endpoints: {
            nonce: "/sprucekit-custom-nonce",
            login: "/sprucekit-custom-login",
            logout: "/sprucekit-custom-logout",
          },
        },
      },
    });
  }).not.toThrowError();
});

test("Should override paths with SpruceKitRouteConfig successfully", async () => {
  expect(() => {
    const spruceKit = new SpruceKit({
      providers: {
        server: {
          host: "http://localhost:3001",
          endpoints: {
            nonce: { url: "/sprucekit-custom-nonce", method: "post" },
            login: { url: "/sprucekit-custom-login", method: "post" },
            logout: { url: "/sprucekit-custom-logout", method: "post" },
          },
        },
      },
    });
  }).not.toThrowError();
});

test("Should accept axios request config options successfully", async () => {
  expect(() => {
    const spruceKit = new SpruceKit({
      providers: {
        server: {
          host: "http://localhost:3001",
          endpoints: {
            nonce: {
              url: "/sprucekit-custom-nonce",
              method: "post",
              headers: { "X-Requested-With": "XMLHttpRequest" },
              transformRequest: [
                function (data, headers) {
                  // Do whatever you want to transform the data
                  console.log("Test: transformRequest", data, headers);
                  return data;
                },
              ],
            },
          },
        },
      },
    });
  }).not.toThrowError();
});

test("Should accept extensions successfully", async () => {
  jest.setTimeout(30000);
  const GnosisDelegation = (await import("@spruceid/sprucekit-core/client"))
    .GnosisDelegation;
  const testingUtils = generateTestingUtils({ providerType: "MetaMask" });
  testingUtils.mockChainId("0x1");
  testingUtils.mockConnectedWallet([
    "0x456c1182DecC365DCFb5F981dCaef671C539AD44",
  ]);
  const abi = [
    "event SetDelegate(address indexed delegator, bytes32 indexed id, address indexed delegate)",
    "event ClearDelegate(address indexed delegator, bytes32 indexed id, address indexed delegate)",
  ] as const;
  const contractTestingUtils = testingUtils.generateContractUtils(abi);
  contractTestingUtils.mockGetLogs("SetDelegate", []);
  contractTestingUtils.mockGetLogs("ClearDelegate", []);
  const spruceKitConfig = {
    providers: {
      web3: {
        driver: testingUtils.getProvider(),
      },
    },
    modules: {
      storage: false,
    },
  };
  const spruceKit = new SpruceKit(spruceKitConfig);
  const gnosis = new GnosisDelegation();
  spruceKit.extend(gnosis);

  await expect(spruceKit.signIn()).resolves.not.toThrowError();
});
