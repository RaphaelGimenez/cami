import { useEffect, useRef, useState } from "react";
import mapboxgl, { GeoJSONSource, LngLatBounds, Map } from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/utils/database.types";
import { Box } from "@mantine/core";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface Dispenser {
  location: any;
}

export default function Home() {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const [lng, setLng] = useState(3.8772);
  const [lat, setLat] = useState(43.6101);
  const [zoom, setZoom] = useState(3);
  const [bounds, setBounds] = useState<LngLatBounds | undefined>();
  const supabase = useSupabaseClient<Database>();

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      })
    );

    map.current.on("idle", () => {
      const nextBounds = map.current?.getBounds();
      setBounds(nextBounds);
    });

    map.current.on("load", () => {
      map.current?.addSource("distributeurs", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
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
              return {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: d.location
                    .match(regex)[1]
                    .split(" ") as GeoJSON.Position,
                },
              };
            }) || [],
        };

        (map.current?.getSource("distributeurs") as GeoJSONSource).setData(
          outputGeoJson
        );
      };
      getDispensers();
    }
  }, [supabase, bounds]);

  return (
    <>
      <Box sx={{ height: "100%" }}>
        <Box
          sx={{ height: "100%" }}
          ref={mapContainer}
          className="map-container"
        />
      </Box>
    </>
  );
}
