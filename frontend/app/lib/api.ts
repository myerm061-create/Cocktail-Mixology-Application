const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

async function j<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw { status: r.status, data };
  return data as T;
}

export const api = {
  loginRequest: (email: string) => j<{ ok: boolean }>("/auth/login/request", { email }),
  loginFinish:  (token: string)  => j<{ ok: boolean; email: string; access_token: string; refresh_token: string }>("/auth/login/finish", { token }),
  resetRequest: (email: string) => j<{ ok: boolean }>("/auth/reset/request", { email }),
  resetConfirm: (token: string, new_password: string) => j<{ ok: boolean }>("/auth/reset/confirm", { token, new_password }),
};
