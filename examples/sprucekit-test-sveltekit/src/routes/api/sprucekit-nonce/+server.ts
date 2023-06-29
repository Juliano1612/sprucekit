import sk from "../../../utils/_spruceKit";

export function GET() {
  const nonce = sk.generateNonce();
  return new Response(nonce, {
    status: 200,
    headers: { 'Set-Cookie': `nonce=${nonce}` }
  });
}