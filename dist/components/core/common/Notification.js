/* Copyright (c) 2023-present Venky Corp */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { toast } from 'sonner';
import { proxy, useSnapshot } from 'valtio';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import clientLogger from '../../../lib/core/client/client-logger';
import { logError as logDevtoolsError } from '../../../lib/core/client/devtools';
export default function CloseAll({ toastId }) {
    const { notifications } = useSnapshot(state);
    const lastToastId = Object.keys(notifications).at(-3);
    return (_jsx(Button, { variant: "outline", className: cn('absolute -top-4 right-4 z-50', lastToastId === toastId ? 'visible' : 'invisible'), onClick: () => toast.dismiss(), children: "Close All" }));
}
let counter = 0;
function newId() {
    return `t${counter++}`;
}
const state = proxy({
    notifications: {},
});
export function showMessage(args) {
    const { description, type, action } = args;
    let { duration, title } = args;
    // if (this.isRecording()) {
    //   this.recordLine('', `await ui.hasNotified((msg) => msg === \`${msg}\`);`);
    // }
    const ids = Object.keys(state.notifications);
    let duplicateId;
    let duplicateCount = 1;
    if (ids.length) {
        const last = ids.length - 1;
        // just increment the count instead of adding a new entry
        // if the msg matches any of the previous notification msgs
        for (let i = last; i >= 0; i--) {
            const id = ids[i];
            const previousNotification = state.notifications[ids[i]];
            if (previousNotification.title === title && previousNotification.description === description) {
                const note = {
                    ...previousNotification,
                    count: previousNotification.count + 1,
                };
                duplicateCount = note.count ?? 1;
                state.notifications[ids[i]] = note;
                duplicateId = id;
                break;
            }
        }
        if (duplicateCount > 1) {
            title = `${title} (${duplicateCount})`;
        }
    }
    if ((action || type === 'error') && !duration) {
        duration = Number.POSITIVE_INFINITY;
    }
    duration = type === 'warning' ? (duration ?? 30000) : (duration ?? 5000);
    let toastId = -1;
    const id = duplicateId ?? newId();
    const a = action ?? _jsx(CloseAll, { toastId: id });
    switch (type) {
        case 'error':
            toastId = toast.error(title, {
                description,
                duration,
                action: a,
                id,
                dismissible: true,
                closeButton: true,
                onAutoClose: () => {
                    removeNotification(toastId);
                },
                onDismiss: () => {
                    removeNotification(toastId);
                },
            });
            break;
        case 'warning':
            toastId = toast.warning(title, {
                description,
                duration,
                action: a,
                id,
                dismissible: true,
                closeButton: true,
                onAutoClose: () => {
                    removeNotification(toastId);
                },
                onDismiss: () => {
                    removeNotification(toastId);
                },
            });
            break;
        case 'success':
            toastId = toast.success(title, {
                description,
                duration,
                action: a,
                id,
                dismissible: true,
                closeButton: true,
                onAutoClose: () => {
                    removeNotification(toastId);
                },
                onDismiss: () => {
                    removeNotification(toastId);
                },
            });
            break;
        default:
            toastId = toast.info(title, {
                description,
                duration,
                action: a,
                id,
                dismissible: true,
                closeButton: true,
                onAutoClose: () => {
                    removeNotification(toastId);
                },
                onDismiss: () => {
                    removeNotification(toastId);
                },
            });
    }
    if (!duplicateId) {
        state.notifications[toastId] = {
            title,
            description,
            count: duplicateCount,
        };
    }
    return toastId;
}
export function removeNotification(id, onCleanup = false) {
    delete state.notifications[id];
    if (!onCleanup) {
        toast.dismiss(id);
    }
}
export function showError(title, props) {
    let message = '';
    let stack;
    if (typeof title !== 'string') {
        message = title.message || 'Unknown error!. Check the console log for more details.';
        stack = title.stack;
        clientLogger.error({ message: 'Notification error', error: title });
    }
    else {
        message = title;
    }
    // Log to devtools for debugging
    logDevtoolsError('server', message, {
        stack,
        context: props?.description ? { description: props.description } : undefined,
    });
    return showMessage({ ...props, title: message, type: 'error' });
}
export function showWarning(title, props) {
    return showMessage({ ...props, title, type: 'warning' });
}
export function showInfo(title, props) {
    return showMessage({ ...props, title, type: 'info' });
}
export function showSuccess(title, props) {
    return showMessage({ ...props, title, type: 'success' });
}
//# sourceMappingURL=Notification.js.map