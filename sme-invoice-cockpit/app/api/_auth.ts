// app/api/_auth.ts
import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/auth";
import type { User } from "@/lib/types";

export async function requireUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) {
      console.debug("No session token found in cookies");
      return null;
    }
    const user = await getUserBySessionToken(token);
    if (!user) {
      console.debug("User not found for token");
    }
    return user;
  } catch (error) {
    console.error("Error in requireUser:", error);
    return null;
  }
}
