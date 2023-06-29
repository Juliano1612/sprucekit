import { SpruceKitEventLogTypes, spruceKitLog } from "../src/server";

const axios: any = jest.genMockFromModule("axios");

axios.create.mockReturnThis();

test("Should call sprucekitLog successfully", async () => {
  const api = axios.create({
    baseURL: "https://api.sprucekit.id",
    headers: {
      Authorization: `Bearer `,
      "Content-Type": "application/json",
    },
  });

  await expect(
    spruceKitLog(api, "", {
      content: "",
      type: SpruceKitEventLogTypes.LOGIN,
      userId: "",
    })
  ).resolves.not.toThrow();
});

test("Should fail calling sprucekitLog", async () => {
  const api = axios.create({
    baseURL: "https://api.sprucekit.id",
    headers: {
      Authorization: `Bearer `,
      "Content-Type": "application/json",
    },
  });

  await expect(
    spruceKitLog(api, "...", {
      content: "",
      type: SpruceKitEventLogTypes.LOGIN,
      userId: "",
    })
  ).rejects.toThrow();
});
