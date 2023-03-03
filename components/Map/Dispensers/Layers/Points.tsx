import { useMantineTheme } from "@mantine/core";
import { Layer } from "react-map-gl";

interface Props {
  source?: string;
}

const MapDispensersLayersPoints = (props: Props) => {
  const theme = useMantineTheme();

  return (
    <>
      <Layer
        {...props}
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
          "circle-radius": 11,
          "circle-stroke-width": 3,
          "circle-stroke-color": theme.colors.gray[0],
        }}
      />

      <Layer
        {...props}
        id="dispensers-points-icon"
        type="symbol"
        filter={["!", ["has", "point_count"]]}
        layout={{
          "icon-image": "poo-bag",
          "icon-size": 0.6,
        }}
        paint={{
          "icon-color": [
            "match",
            ["get", "status"],
            "notfound",
            `${theme.colors.gray[0]}`,
            "unknown",
            `${theme.colors.dark[9]}`,
            "empty",
            `${theme.colors.dark[9]}`,
            "low",
            `${theme.colors.dark[9]}`,
            "ok",
            `${theme.colors.dark[9]}`,
            `${theme.colors.dark[9]}`,
          ],
        }}
      />
    </>
  );
};

export default MapDispensersLayersPoints;
