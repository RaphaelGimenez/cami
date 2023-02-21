import updateDispenser from "@/data-access/updateDispenser";
import { Dispenser } from "@/types/interfaces";
import { Database } from "@/utils/database.types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateDispenser = () => {
  const supabase = useSupabaseClient<Database>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dispenserId,
      update,
    }: {
      dispenserId: number;
      update: Database["public"]["Tables"]["dispensers"]["Update"];
    }) => updateDispenser(supabase, dispenserId, update),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispensers", "inbounds"] });
    },
  });
};

export default useUpdateDispenser;
