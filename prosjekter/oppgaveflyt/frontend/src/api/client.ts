import { useAuthStore } from "../stores/authStore";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

let refreshInFlight: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
  if (!res.ok) {
    useAuthStore.getState().clear();
    throw new ApiError(401, "UNAUTHORIZED", "Sesjonen er utløpt, logg inn på nytt");
  }
  const data = await res.json();
  useAuthStore.getState().setAccessToken(data.accessToken);
}

/**
 * Tynn fetch-wrapper: legger på access-token, og ved 401 prøver den å fornye
 * token via refresh-cookien én gang før den gir opp og logger ut brukeren.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401 && !retried) {
    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
    await refreshInFlight;
    return apiFetch<T>(path, init, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? `Forespørsel feilet (${res.status})`,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
