import { auth } from "./firebase";

/**
 * Get the current user's Firebase ID token for authenticating API requests.
 * Returns null if no user is signed in.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Make an authenticated fetch request to a Next.js API route.
 * Automatically attaches the Firebase ID token as a Bearer token.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getIdToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
