import StatusBadge from "@/components/status-badge";
import { Database } from "@/utils/database.types";
import { Carousel } from "@mantine/carousel";

interface BadgeSliderProps {
  statuses: {
    status: Database["public"]["Enums"]["DISPENSER_STATUS"];
    id: number;
    created_at: string | null;
  }[];
}
const BadgeSlider = ({ statuses }: BadgeSliderProps) => {
  return (
    <Carousel
      slideSize="70%"
      height={50}
      slideGap="xs"
      loop
      withControls={false}
      withIndicators
      styles={{
        indicator: {
          background: "gray",
        },
      }}
    >
      {statuses.map((status, index) => (
        <Carousel.Slide key={status.id}>
          <StatusBadge
            status={status.status}
            createdAt={status.created_at || ""}
          />
        </Carousel.Slide>
      ))}
    </Carousel>
  );
};

export default BadgeSlider;
