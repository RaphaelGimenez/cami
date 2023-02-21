import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl, { GeoJSONSource, LngLatBounds, Map } from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import { Badge, Box } from "@mantine/core";
import useDispenersInBounds from "@/hooks/useDispensersInBounds";
import { MapTools } from "@/components/MapTools";
import { DispenserRow } from "@/types/interfaces";
import DispenserCard from "@/components/dispenser-card";
import useProfile from "@/hooks/useProfile";
import useDeleteDispenser from "@/hooks/useDeleteDispenser";
import { openConfirmModal } from "@mantine/modals";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function Home() {
  const { data, error } = useProfile();
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const [lng, setLng] = useState(3.8772);
  const [lat, setLat] = useState(43.6101);
  const [zoom, setZoom] = useState(3);
  const [bounds, setBounds] = useState<LngLatBounds | undefined>();
  const { data: dispensers, status } = useDispenersInBounds(bounds);
  const [currentDispenser, setCurrentDispenser] = useState<DispenserRow | null>(
    null
  );
  const deleteDispenser = useDeleteDispenser();

  const handleMoveEnd = useCallback(() => {
    const nextBounds = map.current?.getBounds();
    setBounds(nextBounds);
  }, []);

  const handleCloseDispenserCard = useCallback(() => {
    setCurrentDispenser(null);
  }, []);

  const handleDeleteDispenser = useCallback(
    (id: number) => {
      openConfirmModal({
        title: "Supprimer le distributeur ?",
        centered: true,
        labels: { confirm: "Supprimer", cancel: "Annuler" },
        confirmProps: { color: "red" },
        onCancel: () => console.log("Cancel"),
        onConfirm: () => deleteDispenser.mutate(id),
      });
    },
    [deleteDispenser]
  );

  useEffect(() => {
    if (map.current) {
      return;
    } // initialize map only once
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

    map.current.addControl(new mapboxgl.FullscreenControl());

    map.current.on("load", () => {
      handleMoveEnd();
      map.current?.addSource("distributeurs", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 40, // Radius of each cluster when clustering points (defaults to 50)
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
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      map.current?.on("click", "unclustered-point", (e) => {
        if (!e.features) {
          return;
        }

        const id = e.features[0].properties?.id;
        const status = e.features[0].properties?.status;
        const location = e.features[0].properties?.location;

        setCurrentDispenser({ id, status, location });
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
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.on("moveend", handleMoveEnd);
      return;
    }
  }, [handleMoveEnd]);

  useEffect(() => {
    if (map.current && dispensers) {
      (map.current.getSource("distributeurs") as GeoJSONSource)?.setData(
        dispensers
      );
    }
  }, [dispensers]);

  useEffect(() => {
    if (deleteDispenser.status === "success") {
      handleCloseDispenserCard();
      deleteDispenser.reset();
    }
  }, [deleteDispenser, handleCloseDispenserCard]);

  return (
    <>
      <Box sx={{ height: "100%" }}>
        <Box
          sx={{ height: "100%" }}
          ref={mapContainer}
          className="map-container"
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "calc(var(--mantine-footer-height, 0px) + 16px)",
          right: 16,
          zIndex: 100,
        }}
      >
        <MapTools />
      </Box>

      {currentDispenser && (
        <DispenserCard
          dispenser={currentDispenser}
          onClose={handleCloseDispenserCard}
          onDelete={handleDeleteDispenser}
          userRole={data?.role}
          isLoading={deleteDispenser.status === "loading"}
        />
      )}
    </>
  );
}
