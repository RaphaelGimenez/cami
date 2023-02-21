import { Dispenser } from "@/types/interfaces";
import { Database } from "@/utils/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

const updateDispenser = async (
  supabase: SupabaseClient<Database>,
  dispenserId: number,
  update: Database["public"]["Tables"]["dispensers"]["Update"]
) => {
  const { data, error } = await supabase
    .from("dispensers")
    .update(update)
    .eq("id", dispenserId)
    .select();

  if (error) {
    throw error;
  }

  return data;
};

export default updateDispenser;
