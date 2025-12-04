import { supabase } from "@/lib/supabase/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();  
    const { spotify_id, display_name, avatar_url } = body;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const { data, error: upsertError } = await supabase
      .from("users")
      .upsert({
        user_id: user.id,
        spotify_id,
        display_name,
        avatar_url
      }, { onConflict: "user_id" });

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify(data));
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to upsert user" }), { status: 500 });
  }
}
