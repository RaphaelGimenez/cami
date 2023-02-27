import { LngLatBounds } from "mapbox-gl";
import getDispensersInBounds from "@/data-access/getDispensersInBounds";
import { NewDispenser } from "@/types/interfaces";
import { Database } from "@/utils/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import bbox from "@turf/bbox";
import circle from "@turf/circle";

const createDispenser = async (
  supabase: SupabaseClient<Database>,
  data: NewDispenser
) => {
  const c = circle([data.location[0], data.location[1]], 0.01, {
    units: "kilometers",
  });
  const perimeter = bbox(c) as [number, number, number, number];

  const d = await getDispensersInBounds(supabase, new LngLatBounds(perimeter));

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
