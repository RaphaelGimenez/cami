import { useCallback, useEffect, useRef, useState } from "react";
import {
  GeoJSONSource,
  LngLatBounds,
  MapboxEvent,
  MapLayerMouseEvent,
} from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
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
import { useDebouncedState } from "@mantine/hooks";
import Map, {
  FullscreenControl,
  GeolocateControl,
  Layer,
  MapRef,
  Marker,
  MarkerDragEvent,
  Source,
  ViewStateChangeEvent,
} from "react-map-gl";

export default function Home() {
  const { data, error } = useProfile();
  const mapRef = useRef<MapRef | undefined>();
  const [lng, setLng] = useState(3.8772);
  const [lat, setLat] = useState(43.6101);
  const [draggableMarkerLocation, setDraggableMarkerLocation] = useState<
    [number, number]
  >([lng, lat]);
  const [zoom, setZoom] = useState(3);
  const [debouncedBounds, setDebouncedBounds] = useDebouncedState<
    LngLatBounds | undefined
  >(undefined, 300);
  const { data: dispensersData, status } =
    useDispenersInBounds(debouncedBounds);
  const [dispensers, setDispensers] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Point>>();
  const [currentDispenser, setCurrentDispenser] = useState<DispenserRow | null>(
    null
  );
  const deleteDispenser = useDeleteDispenser();
  const createDispenserStatus = useCreateDispenserStatus();
  const theme = useMantineTheme();
  const createDispenser = useCreateDispenser();

  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  useEffect(() => {
    if (status === "success") {
      setDispensers(dispensersData);
    }
  }, [dispensersData, status]);

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
    if (!mapRef.current) {
      return;
    }
    setIsSelectingLocation(true);

    const mapCenter = mapRef.current?.getCenter();

    setDraggableMarkerLocation([mapCenter.lng, mapCenter.lat]);

    closeAllModals();
  };

  const handleMarkerDragEnd = (e: MarkerDragEvent) => {
    const lngLat = e.target.getLngLat();
    setDraggableMarkerLocation([lngLat.lng, lngLat.lat]);
  };

  useEffect(() => {
    if (deleteDispenser.status === "success") {
      handleCloseDispenserCard();
      deleteDispenser.reset();
    }
  }, [deleteDispenser, handleCloseDispenserCard]);

  useEffect(() => {
    if (createDispenser.status === "success") {
      createDispenser.reset();
      setIsSelectingLocation(false);
    }
  }, [createDispenser]);

  const handleMapLoad = (e: MapboxEvent) => {
    setDebouncedBounds(e.target.getBounds());
  };

  const handleMoveEnd = (e: ViewStateChangeEvent) => {
    const nextBounds = e.target.getBounds();
    setDebouncedBounds(nextBounds);
  };

  const handleMapClick = (e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) {
      return;
    }

    switch (feature.layer.id) {
      case "dispensers-clusters":
        const clusterId = feature.properties?.cluster_id;
        (
          mapRef.current?.getSource(feature.source) as GeoJSONSource
        ).getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          mapRef.current?.easeTo({
            center: (feature.geometry as GeoJSON.Point).coordinates as [
              number,
              number
            ],
            zoom,
          });
        });
        break;
      case "dispensers-points":
        const id = feature.properties?.id;
        const status = feature.properties?.status;
        const location = feature.properties?.location;

        setCurrentDispenser({ id, status, location });
        break;
    }
  };

  return (
    <Layout>
      <Box sx={{ height: "100%" }}>
        <Map
          // @ts-ignore
          ref={mapRef}
          initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: zoom,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          reuseMaps
          interactiveLayerIds={["dispensers-clusters", "dispensers-points"]}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          onMoveEnd={handleMoveEnd}
        >
          <GeolocateControl
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
            showUserHeading={true}
          />
          <FullscreenControl />
          <Source
            id="dispensers"
            type="geojson"
            cluster
            clusterMaxZoom={14}
            clusterRadius={50}
            data={dispensers}
          >
            <Layer
              id="dispensers-clusters"
              type="circle"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": theme.colors.blue[7],
                "circle-stroke-width": 5,
                "circle-stroke-color": theme.colors.blue[2],

                "circle-radius": ["case", ["get", "cluster"], 12, 5],
              }}
            />

            <Layer
              id="dispensers-clusters-count"
              type="symbol"
              filter={["has", "point_count"]}
              layout={{
                "text-field": ["get", "point_count_abbreviated"],
                "text-font": ["Open Sans Bold"],
                "text-size": 12,
              }}
              paint={{
                "text-color": theme.colors.gray[0],
              }}
            />
            <Layer
              id="dispensers-points"
              type="circle"
              filter={["!", ["has", "point_count"]]}
              paint={{
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
                "circle-stroke-color": theme.colors.gray[0],
              }}
            />
          </Source>

          {isSelectingLocation && (
            <Marker
              longitude={draggableMarkerLocation[0]}
              latitude={draggableMarkerLocation[1]}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </Map>
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
