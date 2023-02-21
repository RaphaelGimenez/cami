import { useQuery } from "@tanstack/react-query";
import { Database } from "@/utils/database.types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import getDispenserStatus from "@/data-access/getDispenserStatus";
const useGetDispenserStatus = (dispenserId: number) => {
  const supabase = useSupabaseClient<Database>();

  return useQuery({
    queryKey: ["dispenser_status", dispenserId],
    queryFn: () => getDispenserStatus(supabase, dispenserId),
  });
};

export default useGetDispenserStatus;
