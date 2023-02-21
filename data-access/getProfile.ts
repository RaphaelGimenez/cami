import { Database } from "@/utils/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

const getProfile = async (
  supabase: SupabaseClient<Database>,
  userId: string
) => {
  try {
    if (!userId) throw new Error("Missing user id!");

    let { data, error, status } = await supabase
      .from("profiles")
      .select(`role`)
      .eq("id", userId)
      .single();

    if (error && status !== 406) {
      throw error;
    }

    if (!data) throw new Error("User not found!");

    return data;
  } catch (error) {
    throw new Error("Error loading user data!");
  }
};

export default getProfile;
