import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_ADMIN_KEY || ""
);

const multipointToPoint = (geoJson: GeoJSON.FeatureCollection) => {
  let outputGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features: [],
  };

  geoJson.features.forEach((feature) => {
    if (feature.geometry.type === "MultiPoint") {
      // select only the first coordinate of the MultiPoint
      const [lon, lat] = feature.geometry.coordinates[0];

      // create a new Point feature with the first coordinate
      const pointFeature: GeoJSON.Feature<GeoJSON.Point> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
        properties: feature.properties,
      };

      // add the new Point feature to the output GeoJson
      outputGeoJson.features.push(pointFeature);
    } else {
      // add non-MultiPoint features as-is
      outputGeoJson.features.push(feature as GeoJSON.Feature<GeoJSON.Point>);
    }
  });

  return outputGeoJson;
};

const mergeGeoJsons = (geoJsons: GeoJSON.FeatureCollection[]) => {
  let outputGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features: [],
  };

  geoJsons.forEach((geoJson) => {
    outputGeoJson.features.push(
      ...(geoJson.features as GeoJSON.Feature<GeoJSON.Point>[])
    );
  });

  return outputGeoJson;
};

const getDispensers = async () => {
  const res = await fetch(
    "https://www.data.gouv.fr/fr/datasets/r/0ad22e1b-6352-4d86-a021-075917e25e16"
  );

  const toulouse2Data = await res.json();

  const toulouse2DataFormatted = multipointToPoint(toulouse2Data);

  const mulhouseRes = await fetch(
    "https://www.data.gouv.fr/fr/datasets/r/dc7ca8ce-645a-4db4-8564-0153259357a9"
  );
  const mulhouseData = await mulhouseRes.json();

  const castelnaudaryRes = await fetch(
    "https://www.data.gouv.fr/fr/datasets/r/a17b8b62-505b-448e-81df-53d1c2c87845"
  );

  const castelnaudaryData = await castelnaudaryRes.json();
  const castelnaudaryDataFormatted = multipointToPoint(castelnaudaryData);

  const d = await fetch(
    "https://www.data.gouv.fr/fr/datasets/r/d75f05c4-f8a5-49ee-81d2-1458232286fc"
  );
  const data: GeoJSON.FeatureCollection = await d.json();

  const toulouseDataFormatted = multipointToPoint(data);

  // Pass data to the page via props
  return mergeGeoJsons([
    toulouseDataFormatted,
    toulouse2DataFormatted,
    mulhouseData,
    castelnaudaryDataFormatted,
  ]);
};

const run = async () => {
  const data = await getDispensers();

  const dispensers = data.features.map((feature) => ({
    location: `POINT(${feature.geometry.coordinates[0]} ${feature.geometry.coordinates[1]})`,
  }));
  console.log(dispensers);
  const { error } = await supabase.from("dispensers").insert(dispensers);

  console.log(error);
};

run();
