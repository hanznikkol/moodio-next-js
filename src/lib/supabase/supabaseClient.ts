import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = (jwt: string | null) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: jwt ? `Bearer ${jwt}` : "",
        },
      },
    }
  );
};
