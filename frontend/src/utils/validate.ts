export const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
};

export const isStrongPassword = (password: string): boolean => {
  // At least 8 chars, one number, one uppercase letter
  return /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 6;
};

export const doPasswordsMatch = (p1: string, p2: string): boolean => {
  return p1 === p2;
};
