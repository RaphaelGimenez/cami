export const multipointToPoint = (geoJson: GeoJSON.FeatureCollection) => {
  let outputGeoJson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  geoJson.features.forEach((feature) => {
    if (feature.geometry.type === "MultiPoint") {
      // select only the first coordinate of the MultiPoint
      const [lon, lat] = feature.geometry.coordinates[0];

      // create a new Point feature with the first coordinate
      const pointFeature: GeoJSON.Feature = {
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
      outputGeoJson.features.push(feature);
    }
  });

  return outputGeoJson;
};

export default multipointToPoint;
