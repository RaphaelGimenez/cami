import createDispenserStatus from "@/data-access/createDispenserStatus";
import { Database } from "@/utils/database.types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useCreateDispenserStatus = () => {
  const supabase = useSupabaseClient<Database>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dispenserId,
      status,
    }: {
      dispenserId: number;
      status: Database["public"]["Enums"]["DISPENSER_STATUS"];
    }) => createDispenserStatus(supabase, dispenserId, status),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["dispenser_status", data.dispenser_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["dispensers", "inbounds"],
      });
    },
  });
};

export default useCreateDispenserStatus;
