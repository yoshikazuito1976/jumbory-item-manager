export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

const ADMIN_PASSWORD_STORAGE_KEY = "jumbory_admin_password";

export function getStoredAdminPassword(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY);
}

export function storeAdminPassword(password: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
}

export function clearStoredAdminPassword(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
}

export function buildAdminHeaders(options?: {
  includeContentType?: boolean;
  password?: string | null;
}): Record<string, string> {
  const headers: Record<string, string> = {};
  const includeContentType = options?.includeContentType ?? true;
  const password = options?.password ?? getStoredAdminPassword();

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (password) {
    headers["X-Admin-Password"] = password;
  }

  return headers;
}

export async function authenticateAdmin(password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "管理者認証に失敗しました"));
  }
}

export async function getApiErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const payload = await response.json().catch(() => null);

  if (payload && typeof payload.detail === "string") {
    return payload.detail;
  }

  return fallbackMessage;
}