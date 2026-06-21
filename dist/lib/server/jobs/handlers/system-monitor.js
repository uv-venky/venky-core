import os from 'node:os';
import logger from '../../../../lib/core/server/logger';
import { alertFooter, sendGoogleChatAlert } from '../../../../lib/core/server/google-chat';
const THRESHOLD = 85;
function getCpuUsagePercent() {
    const load = os.loadavg()[0];
    const count = os.cpus().length || 1;
    return (load / count) * 100;
}
let alertActive = false;
let lastAlertTime = 0;
export async function monitorSystemUsage() {
    const cpuUsage = getCpuUsagePercent();
    if (cpuUsage > THRESHOLD) {
        const memUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
        logger.warn(`High resource usage detected. CPU: ${cpuUsage.toFixed(2)}%, RAM: ${memUsage.toFixed(2)}%`);
        if (!alertActive) {
            if (Date.now() - lastAlertTime > 1000 * 60 * 15) {
                lastAlertTime = Date.now();
                if (process.env.NODE_ENV === 'production') {
                    sendGoogleChatAlert(`🔴 *High Resource Usage*
• CPU: ${cpuUsage.toFixed(2)}%
• Memory: ${memUsage.toFixed(2)}%
• Threshold: ${THRESHOLD}%
${alertFooter()}`);
                }
            }
            alertActive = true;
        }
    }
    else if (alertActive) {
        // Reset once usage goes back below threshold
        alertActive = false;
    }
}
//# sourceMappingURL=system-monitor.js.map