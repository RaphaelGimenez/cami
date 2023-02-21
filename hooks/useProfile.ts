import { useQuery } from "@tanstack/react-query";
import { Database } from "@/utils/database.types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import getProfile from "@/data-access/getProfile";

const useProfile = () => {
  const user = useUser();
  const supabase = useSupabaseClient<Database>();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(supabase, user?.id as string),
    enabled: !!user?.id,
  });
};

export default useProfile;
