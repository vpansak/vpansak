import { getAuthUserFromRequest } from "../../../lib/auth-session";

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }
  return Response.json({ user });
}
