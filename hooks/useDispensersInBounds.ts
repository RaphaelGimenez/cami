import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useState } from "react";
import { LngLatBounds } from "mapbox-gl";

interface Dispenser {
  location: string;
}

const useDispenersInBounds = (bounds: LngLatBounds | undefined) => {
  const [dispensers, setDispensers] = useState<GeoJSON.FeatureCollection>();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (bounds) {
      const getDispensers = async () => {
        const { data, error } = await supabase.rpc("dispensers_in_view", {
          min_lat: bounds.getSouth(),
          min_long: bounds.getWest(),
          max_lat: bounds.getNorth(),
          max_long: bounds.getEast(),
        });

        const regex = /\(([^)]+)\)/;

        const outputGeoJson: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features:
            (data as unknown as Dispenser[])?.map((d) => {
              const matches = d.location.match(regex);
              if (!matches) {
                return {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Point",
                    coordinates: [],
                  },
                };
              }
              const coordinates = matches[1].split(" ");

              return {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: [
                    parseFloat(coordinates[0]),
                    parseFloat(coordinates[1]),
                  ],
                },
              };
            }) || [],
        };

        setDispensers(outputGeoJson);
      };
      getDispensers();
    }
  }, [bounds, supabase]);

  return dispensers;
};

export default useDispenersInBounds;
