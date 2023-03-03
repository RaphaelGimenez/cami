import MapDispensersLayersClusters from "@/components/Map/Dispensers/Layers/Clusters";
import MapDispensersLayersPoints from "@/components/Map/Dispensers/Layers/Points";
import MapDispensersSource from "@/components/Map/Dispensers/Source";
import useDispensersInBounds from "@/hooks/useDispensersInBounds";
import { DispenserRow } from "@/types/interfaces";
import { useMantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { Layer, LngLatBounds } from "react-map-gl";

interface Props {
  bounds: LngLatBounds | undefined;
}

const MapDispensers = (props: Props) => {
  const theme = useMantineTheme();
  const { data: dispensersData, status } = useDispensersInBounds(props.bounds);
  const [dispensers, setDispensers] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Point>>();
  const [currentDispenser, setCurrentDispenser] = useState<DispenserRow | null>(
    null
  );

  useEffect(() => {
    if (status === "success") {
      setDispensers(dispensersData);
    }
  }, [dispensersData, status]);

  return (
    <MapDispensersSource dispensers={dispensers}>
      <MapDispensersLayersClusters />

      <MapDispensersLayersPoints />
    </MapDispensersSource>
  );
};

export default MapDispensers;
