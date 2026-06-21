/* Copyright (c) 2024-present Venky Corp. */
export const ACTION_PARAM_SCHEMAS = {
    clearCache: [],
    createComment: [
        { name: 'context', label: 'Context', type: 'string' },
        { name: 'contextId', label: 'Context id', type: 'string' },
        { name: 'comment', label: 'Comment', type: 'object' },
    ],
    genID: [],
    getActivityEvents: [{ name: 'filters', label: 'Filters', type: 'object' }],
    getAppConfigForDevtools: [],
    getAuditFilterOptions: [],
    getAuditStats: [],
    getCacheStats: [],
    getCommentStats: [
        { name: 'context', label: 'Context', type: 'string' },
        { name: 'contextId', label: 'Context id', type: 'string' },
    ],
    getCommentView: [
        { name: 'context', label: 'Context', type: 'string' },
        { name: 'contextId', label: 'Context id', type: 'string' },
    ],
    getComments: [
        { name: 'context', label: 'Context', type: 'string' },
        { name: 'contextId', label: 'Context id', type: 'string' },
        { name: 'cursor', label: 'Cursor', type: 'string', nullable: true },
    ],
    getEnvironment: [],
    getJobDashboard: [],
    getJobHistory: [{ name: 'jobName', label: 'Job name', type: 'string' }],
    getSchedulerNodes: [],
    getSystemInfo: [],
    getUserSession: [],
    reactToComment: [
        { name: 'commentId', label: 'Comment id', type: 'string' },
        { name: 'reaction', label: 'Reaction', type: 'string', nullable: true },
        { name: 'context', label: 'Context', type: 'string' },
        { name: 'contextId', label: 'Context id', type: 'string' },
    ],
    resendEmailRequest: [{ name: 'requestId', label: 'Request id', type: 'number' }],
    saveChatModelAsCookie: [{ name: 'model', label: 'Model', type: 'string' }],
    sendTestEmail: [],
    setCommentView: [
        { name: 'context', label: 'Context', type: 'string' },
        { name: 'contextId', label: 'Context id', type: 'string' },
    ],
    signOut: [],
    signOutOthers: [],
    triggerJob: [{ name: 'jobName', label: 'Job name', type: 'string' }],
    updateAvatar: [{ name: 'image', label: 'Image', type: 'string', optional: true }],
    updateProfile: [
        { name: 'key', label: 'Key', type: 'object' },
        { name: 'value', label: 'Value', type: 'object' },
    ],
};
//# sourceMappingURL=param-schemas.generated.js.map