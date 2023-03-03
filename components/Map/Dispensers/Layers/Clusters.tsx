import { useMantineTheme } from "@mantine/core";
import { Layer, LayerProps } from "react-map-gl";

interface Props {
  source?: string;
}

const MapDispensersLayersClusters = (props: Props) => {
  const theme = useMantineTheme();

  return (
    <>
      <Layer
        {...props}
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
        {...props}
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
    </>
  );
};

export default MapDispensersLayersClusters;
