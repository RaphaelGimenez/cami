import { Database } from "@/utils/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

const deleteDispenser = async (
  supabase: SupabaseClient<Database>,
  id: number
) => {
  const { data, error } = await supabase
    .from("dispensers")
    .delete()
    .match({ id });

  if (error) throw error;
  return data;
};

export default deleteDispenser;
