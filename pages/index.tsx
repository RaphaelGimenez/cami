import { useEffect, useRef, useState } from "react";
import mapboxgl, { GeoJSONSource, Map } from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface Props {
  data: GeoJSON.FeatureCollection;
}

export default function Home({ data }: Props) {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const [lng, setLng] = useState(3.8772);
  const [lat, setLat] = useState(43.6101);
  const [zoom, setZoom] = useState(3);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("load", () => {
      map.current?.addSource("distributeurs", {
        type: "geojson",
        // Use a URL for the value for the `data` property.
        data,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      });

      map.current?.addLayer({
        id: "distributeurs-layer",
        type: "circle",
        source: "distributeurs",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "hsla(0,0%,0%,0.75)",
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "white",

          "circle-radius": ["case", ["get", "cluster"], 10, 5],
        },
      });

      map.current?.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "distributeurs",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      map.current?.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "distributeurs",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      map.current?.on("click", "distributeurs-layer", (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ["distributeurs-layer"],
        });

        if (!features) {
          return;
        }

        const clusterId = features[0].properties?.cluster_id;

        (
          map.current?.getSource("distributeurs") as GeoJSONSource
        ).getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.current?.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [
              number,
              number
            ],
            zoom,
          });
        });
      });
    });
  });

  return (
    <>
      <div style={{ height: "100vh", width: "100%" }}>
        <div
          style={{ height: "100%" }}
          ref={mapContainer}
          className="map-container"
        />
      </div>
    </>
  );
}

const multipointToPoint = (geoJson: GeoJSON.FeatureCollection) => {
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

const mergeGeoJsons = (geoJsons: GeoJSON.FeatureCollection[]) => {
  let outputGeoJson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  geoJsons.forEach((geoJson) => {
    outputGeoJson.features.push(...geoJson.features);
  });

  return outputGeoJson;
};

export async function getServerSideProps() {
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
  return {
    props: {
      data: mergeGeoJsons([
        toulouseDataFormatted,
        toulouse2DataFormatted,
        mulhouseData,
        castelnaudaryDataFormatted,
      ]),
    },
  };
}
