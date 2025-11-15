let pending: { email: string; password: string } | null = null;

export const SignupFlowStore = {
  set(email: string, password: string) { pending = { email, password }; },
  get() { return pending; },
  clear() { pending = null; },
};