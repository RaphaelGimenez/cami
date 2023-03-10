import { useEffect, useRef, useState } from "react";
import {
  GeoJSONSource,
  LngLatBounds,
  MapboxEvent,
  MapLayerMouseEvent,
} from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import { Box, Button, Group, LoadingOverlay } from "@mantine/core";
import { MapTools } from "@/components/MapTools";
import DispenserCard from "@/components/dispenser-card";
import useProfile from "@/hooks/useProfile";
import { openModal, closeAllModals } from "@mantine/modals";
import Layout from "@/components/layout";
import { IconLocation, IconMapPin } from "@tabler/icons-react";
import getUserLocation from "@/utils/get-user-location";
import { showNotification } from "@mantine/notifications";
import useCreateDispenser from "@/hooks/useCreateDispenser";
import { useDebouncedState } from "@mantine/hooks";
import Map, {
  FullscreenControl,
  GeolocateControl,
  MapRef,
  Marker,
  MarkerDragEvent,
  ViewStateChangeEvent,
} from "react-map-gl";
import MapDispensers from "@/components/Map/Dispensers/Index";
import useDispenserCard from "@/hooks/useDispenserCard";

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

  const dispenserCard = useDispenserCard();

  const createDispenser = useCreateDispenser();

  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

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

      closeAllModals();
    } catch (error) {
      showNotification({
        color: "red",
        title: "Mince",
        message: "Impossible de r??cup??rer votre position",
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
    if (createDispenser.status === "success") {
      createDispenser.reset();
      setIsSelectingLocation(false);
    }
  }, [createDispenser]);

  const handleMapLoad = (e: MapboxEvent) => {
    setDebouncedBounds(e.target.getBounds());

    e.target.loadImage("/assets/icons/poo-bag.png", (error, image) => {
      if (error) throw error;
      if (!image) return;
      e.target.addImage("poo-bag", image, { sdf: true });
    });
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
        const created_at = feature.properties?.created_at;

        dispenserCard.open({ id, status, location, created_at });
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

          <MapDispensers bounds={debouncedBounds} />

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

      {dispenserCard.dispenser && (
        <DispenserCard
          dispenser={dispenserCard.dispenser}
          onClose={dispenserCard.close}
          onDelete={dispenserCard.delete}
          onVote={dispenserCard.addStatus}
          userRole={data?.role}
          isLoading={dispenserCard.isLoading}
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
