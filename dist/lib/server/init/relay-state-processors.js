/* Copyright (c) 2024-present Venky Corp. */
async function dashboardRelayStateProcessor(context) {
    const { segments } = context;
    if (segments[0] === 'dashboard' && segments.length > 1) {
        let folder = segments[1];
        let folderPt2 = 'dashboard';
        const folder2 = segments[2];
        if (folder2 === 'counter') {
            folder = 'amazon-counter';
        }
        else if (folder2 === 'ontime') {
            folderPt2 = 'ontime';
        }
        else if (folder2 === 'forecast') {
            folderPt2 = 'forecast';
        }
        else if (folder2 === 'beeline') {
            folderPt2 = 'beeline';
        }
        else if (folder === 'm1') {
            folderPt2 = folder2;
        }
        let role = `${folder}-${folderPt2}-user`;
        if (folder2 === 'configure' && folder === 'qbr') {
            role = 'qbr-dashboard-admin';
        }
        return {
            roles: [role],
            checkCloudioRoles: true,
            cloudioRoleNames: [folder],
        };
    }
    return null;
}
const relayStateProcessors = [dashboardRelayStateProcessor];
export default relayStateProcessors;
//# sourceMappingURL=relay-state-processors.js.map