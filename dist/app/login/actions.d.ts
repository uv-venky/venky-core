export type Result =
  | {
      status: 'ERROR';
      message: string;
    }
  | {
      status: 'OK';
    };
export declare function authenticate(_prevState: Result | undefined, formData: FormData): Promise<Result>;
export declare function authenticateToken(token: string, relayState?: string | null): Promise<Result>;
//# sourceMappingURL=actions.d.ts.map
