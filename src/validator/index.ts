// eslint-disable-next-line no-useless-escape
export const isValidEmail = (email: string) =>
  /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

export const isValidPassword = (pwd: string) =>
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\-_"'])[A-Za-z\d@$!%*#?&\-_"']{8,}$/.test(
    pwd
  );
