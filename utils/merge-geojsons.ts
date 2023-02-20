export const mergeGeoJsons = (geoJsons: GeoJSON.FeatureCollection[]) => {
  let outputGeoJson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  geoJsons.forEach((geoJson) => {
    outputGeoJson.features.push(...geoJson.features);
  });

  return outputGeoJson;
};

export default mergeGeoJsons;
