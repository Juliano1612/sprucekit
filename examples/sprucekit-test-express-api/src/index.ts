import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { utils } from "ethers";
import {
  SpruceKitServer,
  SpruceKitExpressMiddleware,
  SpruceKitRPCProviders,
  SpruceKitInfuraProviderNetworks,
} from "@spruceid/sprucekit-server";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

const spruceKit = new SpruceKitServer({
  signingKey: process.env.SPRUCEKIT_SIGNING_KEY,
  providers: {
    rpc: {
      service: SpruceKitRPCProviders.SpruceKitInfuraProvider,
      network: SpruceKitInfuraProviderNetworks.GOERLI,
      apiKey: process.env.INFURA_API_KEY ?? "",
    },
    metrics: {
      service: "sprucekit",
      apiKey: process.env.SPRUCEKIT_API_TOKEN ?? "",
    },
  },
});

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use(
  SpruceKitExpressMiddleware(spruceKit, {
    login: {
      path: "/sprucekit-login",
      callback: (req: Request) => {
        console.log(`User ${req.body.address} successfully signed in`);
      },
    },
    logout: "/sprucekit-logout",
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/userdata", async (req: Request, res: Response) => {
  if (!req.spruceKit.verified) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const data = await getDataFromNode(req.spruceKit.siwe?.address);

  res.json({
    success: true,
    userId: req.spruceKit.siwe?.address,
    message:
      "Some user data, retrieved from a blockchain node the server can access.",
    ...data,
  });
});

app.use((req, res) => {
  if (!res.headersSent) {
    res.status(404).json({ message: "Invalid API route", success: false });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

async function getDataFromNode(address: string | undefined) {
  if (!address) {
    return {};
  }
  const balanceRaw = await spruceKit.provider.getBalance(address);
  const balance = utils.formatEther(balanceRaw);
  const currentBlock = await spruceKit.provider.getBlockNumber();
  return { balance, currentBlock };
}
