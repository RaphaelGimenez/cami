import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import createDispenser from "@/data-access/createDispenser";
import { NewDispenser } from "@/types/interfaces";

const useCreateDispenser = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newDispenser: NewDispenser) =>
      createDispenser(supabase, newDispenser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispensers", "inbounds"] });
    },
  });
};

export default useCreateDispenser;
