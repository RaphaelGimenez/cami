import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/utils/database.types";

const createDispenserStatus = async (
  supabase: SupabaseClient<Database>,
  dispenserId: number,
  status: Database["public"]["Enums"]["DISPENSER_STATUS"]
) => {
  const { data, error } = await supabase
    .from("dispenser_status")
    .insert({ dispenser_id: dispenserId, status })
    .select();

  if (error) {
    throw error;
  }

  return data[0];
};

export default createDispenserStatus;
