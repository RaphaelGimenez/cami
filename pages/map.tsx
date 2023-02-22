import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl, { GeoJSONSource, LngLatBounds, Map, Marker } from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  useMantineTheme,
} from "@mantine/core";
import useDispenersInBounds from "@/hooks/useDispensersInBounds";
import { MapTools } from "@/components/MapTools";
import { DispenserRow } from "@/types/interfaces";
import DispenserCard from "@/components/dispenser-card";
import useProfile from "@/hooks/useProfile";
import useDeleteDispenser from "@/hooks/useDeleteDispenser";
import { openConfirmModal, openModal, closeAllModals } from "@mantine/modals";
import { Database } from "@/utils/database.types";
import useCreateDispenserStatus from "@/hooks/useCreateDispenserStatus";
import Layout from "@/components/layout";
import { IconLocation, IconMapPin } from "@tabler/icons-react";
import getUserLocation from "@/utils/get-user-location";
import { showNotification } from "@mantine/notifications";
import useCreateDispenser from "@/hooks/useCreateDispenser";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function Home() {
  const { data, error } = useProfile();
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const [lng, setLng] = useState(3.8772);
  const [lat, setLat] = useState(43.6101);
  const [draggableMarkerLocation, setDraggableMarkerLocation] = useState<
    [number, number] | null
  >(null);
  const [zoom, setZoom] = useState(3);
  const [bounds, setBounds] = useState<LngLatBounds | undefined>();
  const { data: dispensers, status } = useDispenersInBounds(bounds);
  const [currentDispenser, setCurrentDispenser] = useState<DispenserRow | null>(
    null
  );
  const deleteDispenser = useDeleteDispenser();
  const createDispenserStatus = useCreateDispenserStatus();
  const theme = useMantineTheme();
  const createDispenser = useCreateDispenser();

  const [selectPin, setSelectPin] = useState<Marker | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

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

  const handleVote = useCallback(
    (id: number, status: Database["public"]["Enums"]["DISPENSER_STATUS"]) => {
      createDispenserStatus.mutate({
        dispenserId: id,
        status,
      });
    },
    [createDispenserStatus]
  );

  const confirmCreateDispenser = () => {
    openModal({
      centered: true,
      children: (
        <Group>
          <Button
            fullWidth
            onClick={addDraggableMarker}
            leftIcon={<IconMapPin />}
          >
            Placer un marqueur sur la carte
          </Button>
          <Button
            fullWidth
            onClick={createDispenserFromLocation}
            leftIcon={<IconLocation />}
          >
            Utiliser ma position
          </Button>
        </Group>
      ),
    });
  };

  const createDispenserFromPin = async () => {
    if (!draggableMarkerLocation) {
      return;
    }
    const location = draggableMarkerLocation;
    createDispenser.mutate({ location });
  };

  const cancelPinSelection = () => {
    setIsSelectingLocation(false);
    if (selectPin) {
      selectPin.remove();
    }
  };

  const createDispenserFromLocation = async () => {
    try {
      const location = await getUserLocation();
      createDispenser.mutate({ location });
    } catch (error) {
      showNotification({
        color: "red",
        title: "Mince",
        message: "Impossible de récupérer votre position",
      });
    }
  };

  const addDraggableMarker = () => {
    if (!map.current) {
      return;
    }
    setIsSelectingLocation(true);

    const mapCenter = map.current.getCenter();

    const marker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat(mapCenter)
      .addTo(map.current);

    function onDragEnd() {
      const lngLat = marker.getLngLat();
      setDraggableMarkerLocation([lngLat.lng, lngLat.lat]);
    }

    marker.on("dragend", onDragEnd);

    setSelectPin(marker);

    closeAllModals();
  };

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
          "circle-color": [
            "match",
            ["get", "status"],
            "notfound",
            `${theme.colors.dark[5]}`,
            "unknown",
            `${theme.colors.gray[5]}`,
            "empty",
            `${theme.colors.red[5]}`,
            "low",
            `${theme.colors.orange[5]}`,
            "ok",
            `${theme.colors.green[5]}`,
            `${theme.colors.gray[5]}`,
          ],
          "circle-radius": 6,
          "circle-stroke-width": 2,
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

  useEffect(() => {
    if (createDispenser.status === "success") {
      createDispenser.reset();
      selectPin?.remove();
      setSelectPin(null);
      setIsSelectingLocation(false);
    }
  }, [createDispenser, selectPin]);

  return (
    <Layout>
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
        <MapTools
          createDispenser={confirmCreateDispenser}
          status={createDispenser.status}
        />
      </Box>

      {currentDispenser && (
        <DispenserCard
          dispenser={currentDispenser}
          onClose={handleCloseDispenserCard}
          onDelete={handleDeleteDispenser}
          onVote={handleVote}
          userRole={data?.role}
          isLoading={
            deleteDispenser.status === "loading" ||
            createDispenserStatus.status === "loading"
          }
        />
      )}

      {isSelectingLocation && (
        <Button.Group
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "var(--mantine-footer-height, 0px)",
            zIndex: 101,
          }}
        >
          <LoadingOverlay
            visible={createDispenser.status === "loading"}
            overlayBlur={2}
          />

          <Button
            fullWidth
            onClick={createDispenserFromPin}
            sx={{ height: "100%" }}
          >
            Valider la position
          </Button>
          <Button
            fullWidth
            onClick={cancelPinSelection}
            color="red"
            sx={{ height: "100%" }}
          >
            Annuler
          </Button>
        </Button.Group>
      )}
    </Layout>
  );
}
