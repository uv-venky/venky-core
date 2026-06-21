'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useQuery } from '../../lib/core/client/useQuery';
import ErrorCard from '../../components/core/common/error';
import LoadingSkeleton from '../../components/core/common/loading';
export default function WithActionData({ action, children, params = [], fallback, errorCard, }) {
    const result = useQuery(action, ...params);
    if (result.status === 'error') {
        return errorCard ? errorCard(result.error) : _jsx(ErrorCard, { children: result.error });
    }
    if (result.status === 'loading') {
        return fallback ?? _jsx(LoadingSkeleton, {});
    }
    return children(result.data);
}
//# sourceMappingURL=WithActionData.js.map