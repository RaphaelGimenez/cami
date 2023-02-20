import getDispensersInBounds from "@/data-access/getDispensersInBounds";
import { NewDispenser } from "@/types/interfaces";
import boundingBoxFromPoint from "@/utils/bounding-box-from-point";
import { Database } from "@/utils/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

const createDispenser = async (
  supabase: SupabaseClient<Database>,
  data: NewDispenser
) => {
  const perimeter = boundingBoxFromPoint(
    data.location[0],
    data.location[1],
    10
  );

  const d = await getDispensersInBounds(supabase, perimeter);

  if (d.features.length > 0) {
    throw new Error(
      "Dispenser already exists within 10 meters of this location"
    );
  }

  const { data: dispenser, error } = await supabase.from("dispensers").insert({
    location: `POINT(${data.location[0]} ${data.location[1]})`,
  });

  if (error) {
    throw error;
  }

  return dispenser;
};

export default createDispenser;
