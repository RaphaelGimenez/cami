import { LngLatBounds, Point } from "mapbox-gl";
function boundingBoxFromPoint(
  longitude: number,
  latitude: number,
  radiusInMeters: number
) {
  const earthRadiusInMeters = 6371000; // approximate radius of the earth in meters
  const latDistance = radiusInMeters / earthRadiusInMeters;
  const lonDistance =
    radiusInMeters /
    (earthRadiusInMeters * Math.cos((Math.PI / 180) * latitude));

  const minLat = latitude - (latDistance * 180) / Math.PI;
  const maxLat = latitude + (latDistance * 180) / Math.PI;
  const minLon = longitude - (lonDistance * 180) / Math.PI;
  const maxLon = longitude + (lonDistance * 180) / Math.PI;

  // return a bounding box
  return new LngLatBounds([minLon, minLat, maxLon, maxLat]);
}
export default boundingBoxFromPoint;
