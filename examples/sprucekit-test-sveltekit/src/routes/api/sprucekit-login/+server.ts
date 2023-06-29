import { json } from "@sveltejs/kit";
import sk from "../../../utils/_spruceKit";

export async function POST({ request, cookies }) {
  const body = await request.json();

  const nonce = cookies.get('nonce');

  return json(
    await sk.login(
      body.siwe,
      body.signature,
      body.daoLogin,
      body.resolveEns,
      nonce ?? "",
      body.resolveLens,
    ),
    {
      status: 200
    }
  );
}