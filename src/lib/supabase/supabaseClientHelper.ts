import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseClientWithJWT(jwt: string): SupabaseClient {
  if (!jwt) throw new Error("Missing JWT");

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );
}

// Optional: helper to get user_id from JWT
export async function getUserIdFromJWT(jwt: string): Promise<string> {
  const client = getSupabaseClientWithJWT(jwt);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error("No authenticated user found");
  return user.id;
}
