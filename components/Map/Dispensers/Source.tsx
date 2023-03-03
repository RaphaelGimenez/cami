import { Source } from "react-map-gl";

interface Props {
  dispensers?: GeoJSON.FeatureCollection<
    GeoJSON.Point,
    GeoJSON.GeoJsonProperties
  >;
  children?: React.ReactNode;
}

const MapDispensersSource = (props: Props) => {
  return (
    <Source
      id="dispensers"
      type="geojson"
      cluster
      clusterMaxZoom={14}
      clusterRadius={50}
      data={props.dispensers}
    >
      {props.children}
    </Source>
  );
};

export default MapDispensersSource;
