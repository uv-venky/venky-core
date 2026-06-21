import { jsx as _jsx } from "react/jsx-runtime";
/* Copyright (c) 2024-present Venky Corp. */
import { auth } from '../../../auth';
import { newReadOnlyClient } from '../../../lib/core/server/db';
/**
 * Page wrapper that provides a readonly DB client.
 * No BEGIN/COMMIT — autocommit is sufficient for reads. Release always runs.
 */
export const withReadOnlyDBSessionPage = (callback) => {
    return async (props) => {
        const session = await auth(true);
        if (!session) {
            return _jsx("div", { children: "Unauthorized" });
        }
        const client = await newReadOnlyClient();
        try {
            return await callback(client, session, props);
        }
        finally {
            client.release();
        }
    };
};
//# sourceMappingURL=withReadOnlyDBPages.js.map