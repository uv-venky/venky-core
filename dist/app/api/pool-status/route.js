import { getPoolStatus } from '../../../lib/core/server/db';
export async function GET() {
  const status = await getPoolStatus();
  return Response.json(status);
}
//# sourceMappingURL=route.js.map
