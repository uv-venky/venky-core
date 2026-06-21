/* Copyright (c) 2024-present Venky Corp. */
import { DefaultAttribute, DefaultDataSource, DefaultReadOnlyAccess } from '../../../../../lib/server/ds/defs/defaults';
import { getPrefix } from '../../../../../lib/server/constants';
const PREFIX = getPrefix();
export const UserActivityArchiveDS = {
    ...DefaultDataSource,
    id: 'UserActivityArchive',
    tableName: `${PREFIX}user_activity_archive`,
    attributes: [
        {
            ...DefaultAttribute,
            code: 'archiveId',
            name: 'Archive Id',
            type: 'Number',
            column: 'archive_id',
            primary: true,
            optional: false,
        },
        {
            ...DefaultAttribute,
            code: 'appId',
            name: 'App Id',
            type: 'Text',
            column: 'app_id',
            maxLength: 128,
            optional: false,
        },
        {
            ...DefaultAttribute,
            code: 'activityDate',
            name: 'Activity Date',
            type: 'Date',
            column: 'activity_date',
            optional: false,
            excludeTime: true,
        },
        {
            ...DefaultAttribute,
            code: 'userName',
            name: 'User Name',
            type: 'Text',
            column: 'user_name',
            maxLength: 128,
            optional: false,
        },
        {
            ...DefaultAttribute,
            code: 'eventType',
            name: 'Event Type',
            type: 'Text',
            column: 'event_type',
            maxLength: 40,
            optional: false,
        },
        {
            ...DefaultAttribute,
            code: 'pageUrl',
            name: 'Page Url',
            type: 'Text',
            column: 'page_url',
            maxLength: 64,
        },
        {
            ...DefaultAttribute,
            code: 'activityCount',
            name: 'Count',
            type: 'Number',
            column: 'activity_count',
            optional: false,
        },
    ],
    access: [
        {
            ...DefaultReadOnlyAccess,
            roleCode: 'admin',
        },
    ],
};
//# sourceMappingURL=UserActivityArchiveDS.js.map