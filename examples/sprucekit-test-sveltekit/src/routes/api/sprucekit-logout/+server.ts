import { json } from "@sveltejs/kit";
import sk from "../../../utils/_spruceKit";

export async function POST() {
  return json(
    {
      success: await sk.logout() ?? true
    },
    {
      status: 200
    }
  );
}