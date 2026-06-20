import type { Activity } from '@/lib/core/common/types/Activity';
import type { LogLevel } from '@/lib/core/common/types/UserSettings';
import { getTrackId, resetTrackId } from '@/lib/core/client/state';
import { pushLog } from '@/lib/feedback/client/diagnostics';

interface Props extends Record<string, any> {
  message: string;
  dataSource?: string;
}

interface Props2 extends Props {
  level: LogLevel;
}

async function logMessage(payload: Props2) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  if (process.env.NODE_ENV !== 'production' && LEVEL[payload.level] <= LEVEL.info) {
    const { message, ...rest } = payload;
    console.info(message, rest);
    return;
  }
  const { ...rest } = payload;
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('x-track-id', getTrackId());
  const response = await fetch('/api/log', {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...rest }),
  });
  if (!response.ok) {
    console.error('Failed to log', response);
  }
  const resp = await response.json();
  if (resp.status !== 'OK') {
    console.error('Failed to log', resp);
  }
}

const LEVEL = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
};

class Logger {
  level = process.env.NODE_ENV === 'development' ? LEVEL.debug : LEVEL.warn;

  log = (props: Props) => {
    if (this.isTraceEnabled) {
      pushLog('trace', props);
      logMessage({ ...props, level: 'trace' });
    }
  };

  info = (props: Props) => {
    if (this.isInfoEnabled) {
      pushLog('info', props);
      logMessage({ ...props, level: 'info' });
    }
  };

  debug = (props: Props) => {
    if (this.isDebugEnabled) {
      pushLog('debug', props);
      logMessage({ ...props, level: 'debug' });
    }
  };

  warn = (props: Props) => {
    if (this.isWarnEnabled) {
      pushLog('warn', props);
      logMessage({ ...props, level: 'warn' });
    }
  };

  error = (props: Props) => {
    pushLog('error', props);
    logMessage({ ...props, level: 'error' });
  };

  setLevel(level: keyof typeof LEVEL) {
    this.level = LEVEL[level];
  }

  getLevel() {
    return this.level;
  }

  get isTraceEnabled() {
    return this.level <= LEVEL.trace;
  }

  get isDebugEnabled() {
    return this.level <= LEVEL.debug;
  }

  get isInfoEnabled() {
    return this.level <= LEVEL.info;
  }

  get isWarnEnabled() {
    return this.level <= LEVEL.warn;
  }

  logActivity = async (props: Omit<Activity, 'userName' | 'sessionId' | 'createdAt' | 'trackId'>) => {
    if (process.env.DISABLE_ACTIVITY_LOGGING?.toLowerCase() === 'true' || process.env.NODE_ENV === 'test') {
      return;
    }
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('x-track-id', getTrackId());
    const response = await fetch('/api/activity', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...props,
        trackId: getTrackId(),
      }),
    });
    if (!response.ok) {
      console.error('Failed to log activity', response);
    }
    const resp = await response.json();
    if (resp.status !== 'OK') {
      console.error('Failed to log activity', resp);
    }
  };

  resetTrackId = resetTrackId;
}

export default new Logger();
