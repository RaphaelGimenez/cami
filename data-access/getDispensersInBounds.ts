import { LngLatBounds } from "mapbox-gl";
import { SupabaseClient } from "@supabase/supabase-js";
import { DispenserRow } from "@/types/interfaces";
import { Database } from "@/utils/database.types";

const getDispensersInBounds = async (
  supabase: SupabaseClient<Database>,
  bounds: LngLatBounds | undefined
): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>> => {
  if (!bounds) {
    // return empty geojson
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const { data, error } = await supabase.rpc("dispensers_in_view", {
    min_lat: bounds!.getSouth(),
    min_long: bounds!.getWest(),
    max_lat: bounds!.getNorth(),
    max_long: bounds!.getEast(),
  });

  if (error) {
    throw error;
  }

  const regex = /\(([^)]+)\)/;

  const outputGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features:
      (data as unknown as DispenserRow[])?.map((d) => {
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
          properties: {
            id: d.id,
            status: d.status,
          },
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

  return outputGeoJson;
};

export default getDispensersInBounds;
