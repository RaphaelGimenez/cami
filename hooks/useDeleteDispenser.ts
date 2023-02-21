import deleteDispenser from "@/data-access/deleteDispenser";
import { Database } from "@/utils/database.types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteDispenser = () => {
  const supabase = useSupabaseClient<Database>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDispenser(supabase, id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispensers", "inbounds"] });
    },
  });
};

export default useDeleteDispenser;
