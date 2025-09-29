import axios, { AxiosError } from 'axios';
import { API_URL, ENDPOINTS } from './config';

export const api = axios.create({
  baseURL: API_URL,       // teraz ENDPOINTS są względne
  timeout: 12000,
});

// warunek: kiedy traktować błąd jako „zimny start / sieć”
function isColdStartError(err: unknown) {
  const e = err as AxiosError;
  const s = e?.response?.status;
  return !s || s === 0 || s === 502 || s === 503 || s === 504;
}

// prosty backoff: 0.5s, 1s, 1.5s, ...
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function warmup(maxTries = 6) {
  for (let i = 0; i < maxTries; i++) {
    try {
      // parametr t=… omija cache
      await api.get(ENDPOINTS.health, { params: { t: Date.now() } });
      return true;
    } catch {
      await sleep(400 * (i + 1));
    }
  }
  return false;
}

export async function withWakeup<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isColdStartError(err)) {
      const ok = await warmup();
      if (ok) return await fn();   // druga próba po „rozgrzaniu”
    }
    throw err;
  }
}

// Przykładowe API
export const AuthAPI = {
  login: (email: string, password: string) =>
    withWakeup(() => api.post(ENDPOINTS.login, { email, password }).then(r => r.data)),
  register: (payload: {
    email: string; password: string; fullName: string;
    street: string; houseNumber: string; postalCode: string; city: string;
    companyName?: string; nip?: string; bank?: string; account?: string; phoneNumber?: string;
  }) =>
    withWakeup(() => api.post(ENDPOINTS.register, payload).then(r => r.data)),
  me: () => withWakeup(() => api.get(ENDPOINTS.me).then(r => r.data)),
};
