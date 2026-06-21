import type { ActionName, ActionOutput, ActionParams } from '../../lib/server/actions';
export default function WithActionData<T extends ActionName>({ action, children, params, fallback, errorCard, }: {
    action: T;
    children: (data: Awaited<ActionOutput<T>>) => React.ReactNode;
    params?: ActionParams<T>;
    fallback?: React.ReactNode;
    errorCard?: (error: string) => React.ReactNode;
}): React.ReactNode;
//# sourceMappingURL=WithActionData.d.ts.map