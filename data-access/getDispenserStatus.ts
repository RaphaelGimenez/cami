import { Database } from "@/utils/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
const getDispenserStatus = async (
  supabase: SupabaseClient<Database>,
  dispenserId: number
) => {
  const { data, error } = await supabase
    .from("dispenser_status")
    .select("id, status")
    .eq("dispenser_id", dispenserId)
    // in the last 3 days
    .gte(
      "created_at",
      new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return data;
};

export default getDispenserStatus;
