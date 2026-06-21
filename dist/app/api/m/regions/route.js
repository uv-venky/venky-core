import { auth } from '../../../../auth';
import { executeQuery } from '../../../../lib/core/server/mysql';
export async function GET() {
    const session = await auth();
    if (!session) {
        return Response.json({ status: 'ERROR', message: 'Unauthorized' }, { status: 401 });
    }
    const result = await executeQuery('SELECT CUSTOMID, NAME, ID FROM warehouse.mo_regions where status = "Active"');
    return Response.json({ status: 'OK', data: result.rows });
}
//# sourceMappingURL=route.js.map