'use server';

import { signIn } from '@/auth';
import logger from '@/lib/core/server/logger';
import { z } from 'zod/v3';

export type Result =
  | {
      status: 'ERROR';
      message: string;
    }
  | {
      status: 'OK';
    };

export async function authenticate(_prevState: Result | undefined, formData: FormData): Promise<Result> {
  try {
    const userName = formData.get('userName');
    const password = formData.get('password');

    const parsedCredentials = z
      .object({
        userName: z.string(),
        password: z.string().min(5),
      })
      .safeParse({
        userName,
        password,
      });

    if (parsedCredentials.success) {
      await signIn('credentials', {
        userName: parsedCredentials.data.userName,
        password: parsedCredentials.data.password,
        redirect: false,
      });

      return {
        status: 'OK',
      };
    } else {
      return {
        status: 'ERROR',
        message: 'Invalid credentials',
      };
    }
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid credentials') || error.message.includes('Authentication failed')) {
        return {
          status: 'ERROR',
          message: 'Invalid username and/or password!',
        };
      }
      logger.error(error);
      return {
        status: 'ERROR',
        message: error.message || 'Unknown error',
      };
    }
    logger.error(error);
    return {
      status: 'ERROR',
      message: 'Unknown error',
    };
  }
}

export async function authenticateToken(token: string, relayState?: string | null): Promise<Result> {
  if (token == null) {
    return {
      status: 'ERROR',
      message: 'Invalid token',
    };
  }
  try {
    await signIn('credentials', {
      token,
      relayState: relayState ?? undefined,
      redirect: false,
    });

    return {
      status: 'OK',
    };
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid credentials') || error.message.includes('Authentication failed')) {
        return {
          status: 'ERROR',
          message: 'Invalid credentials!',
        };
      }
      logger.error(error);
      return {
        status: 'ERROR',
        message: error.message || 'Unknown error',
      };
    }
    logger.error(error);
    return {
      status: 'ERROR',
      message: 'Unknown error',
    };
  }
}
