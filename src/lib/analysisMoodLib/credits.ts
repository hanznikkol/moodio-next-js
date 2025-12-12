import { supabaseAdmin } from "../supabase/supabaseServer";

const MAX_DAILY_CREDITS = 2;

export async function canUseCredit(userId: string) {
  if (!userId) return { allowed: false, credits: 0 };

  const now = new Date();

  // Try to get user row
  let { data, error } = await supabaseAdmin
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // Insert first-time user if no row exists
  if (!data) {
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("user_credits")
      .insert({ user_id: userId, credits: MAX_DAILY_CREDITS, last_reset: now });
    
    if (insertError) throw insertError;
    return { allowed: true, credits: MAX_DAILY_CREDITS };
  }

  if (error) throw error;

  // Reset if >24h
  const lastReset = new Date(data.last_reset);
  if (now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000) {
    const { data: resetData, error: resetError } = await supabaseAdmin
      .from("user_credits")
      .update({ credits: MAX_DAILY_CREDITS, last_reset: now })
      .eq("user_id", userId);
    if (resetError) throw resetError;
    return { allowed: true, credits: MAX_DAILY_CREDITS };
  }

  return { allowed: data.credits > 0, credits: data.credits };
}

export async function useCredit(userId: string) {
  // Ensure row exists first
  await canUseCredit(userId);

  const { data, error } = await supabaseAdmin
    .from("user_credits")
    .select("credits")
    .eq("user_id", userId)
    .single();
  if (error || !data) throw error || new Error("User credits not found");

  const newCredits = Math.max(data.credits - 1, 0);

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("user_credits")
    .update({ credits: newCredits })
    .eq("user_id", userId)
    .select()
    .single();
  if (updateError) throw updateError;

  return updated.credits;
}

