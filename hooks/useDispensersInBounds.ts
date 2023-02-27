import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { LngLatBounds } from "mapbox-gl";
import { useQuery } from "@tanstack/react-query";
import getDispensersInBounds from "@/data-access/getDispensersInBounds";

const useDispensersInBounds = (bounds: LngLatBounds | undefined) => {
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: ["dispensers", "inbounds", `${bounds}`],
    queryFn: () => getDispensersInBounds(supabase, bounds),
  });
};

export default useDispensersInBounds;
