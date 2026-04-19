import { cookies } from "next/headers";

export async function auth() {
  const cookieStore = await cookies();
  const firebaseId = cookieStore.get("firebase-session")?.value;
  
  if (firebaseId) {
    return {
      user: {
        id: firebaseId
      }
    };
  }
  
  return null;
}

export function signIn() {
  // Mock function if any code still uses it
}

export function signOut() {
  // Mock function if any code still uses it
}
