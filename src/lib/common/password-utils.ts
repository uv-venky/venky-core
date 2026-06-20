export function getPasswordRequirements(): {
  label: string;
  test: (pwd: string) => boolean;
  message: string;
}[] {
  return [
    {
      label: '8-128 characters',
      test: (pwd: string) => pwd.length >= 8 && pwd.length <= 128,
      message: 'Password must be between 8 and 128 characters',
    },
    {
      label: 'One uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd),
      message: 'Password must contain at least one uppercase letter',
    },
    {
      label: 'One lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd),
      message: 'Password must contain at least one lowercase letter',
    },
    {
      label: 'One number',
      test: (pwd: string) => /[0-9]/.test(pwd),
      message: 'Password must contain at least one number',
    },
    {
      label: 'One special character',
      test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
      message: 'Password must contain at least one special character',
    },
  ];
}
