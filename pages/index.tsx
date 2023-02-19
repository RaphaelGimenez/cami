import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
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
  const [zoom, setZoom] = useState(6);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("load", () => {
      map.current?.addSource("earthquakes", {
        type: "geojson",
        // Use a URL for the value for the `data` property.
        data,
      });

      map.current?.addLayer({
        id: "earthquakes-layer",
        type: "circle",
        source: "earthquakes",
        paint: {
          "circle-radius": 4,
          "circle-stroke-width": 2,
          "circle-color": "red",
          "circle-stroke-color": "white",
        },
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

export async function getServerSideProps() {
  // Fetch data from external API
  const d = await fetch(
    "https://www.data.gouv.fr/fr/datasets/r/d75f05c4-f8a5-49ee-81d2-1458232286fc"
  );
  const data = await d.json();

  // Pass data to the page via props
  return { props: { data } };
}
