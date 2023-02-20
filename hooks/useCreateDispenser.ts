import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { PostgrestError } from "@supabase/supabase-js";

interface MutationData {
  location: [number, number];
}

const getUserLocation = async (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude]);
      },
      (error) => {
        reject(error);
      }
    );
  });
};

const useCreateDispenser = () => {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  const mutate = async () => {
    setStatus("loading");

    const location = await getUserLocation();

    const { data: dispenser, error } = await supabase
      .from("dispensers")
      .insert({
        location: `POINT(${location[0]} ${location[1]})`,
      });

    if (error) {
      setError(error);
      setStatus("error");
    }

    if (dispenser) {
      setData(dispenser);
      setStatus("success");
    }
  };

  return {
    data,
    error,
    status,
    mutate,
  };
};

export default useCreateDispenser;
