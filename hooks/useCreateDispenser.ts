import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation } from "@tanstack/react-query";
import createDispenser from "@/data-access/createDispenser";
import { NewDispenser } from "@/types/interfaces";

const useCreateDispenser = () => {
  const supabase = useSupabaseClient();

  return useMutation({
    mutationFn: (newDispenser: NewDispenser) =>
      createDispenser(supabase, newDispenser),
  });
};

export default useCreateDispenser;
