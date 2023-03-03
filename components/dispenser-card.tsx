import BadgeSlider from "@/components/badge-slider";
import useGetDispenserStatus from "@/hooks/useGetDispenserStatus";
import { DispenserRow } from "@/types/interfaces";
import { Database } from "@/utils/database.types";
import { Carousel } from "@mantine/carousel";
import {
  ActionIcon,
  Button,
  Card,
  CloseButton,
  Flex,
  Group,
  LoadingOverlay,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface DispenserCardProps {
  dispenser: Database["public"]["Tables"]["dispensers"]["Row"];
  onClose: () => void;
  onDelete: (dispenserId: number) => void;
  userRole?: "admin" | "user";
  isLoading: boolean;
  onVote: (
    dispenserId: number,
    status: Database["public"]["Enums"]["DISPENSER_STATUS"]
  ) => void;
}

const DispenserCard = ({
  dispenser,
  onClose,
  onDelete,
  userRole,
  isLoading,
  onVote,
}: DispenserCardProps) => {
  const dispenserStatus = useGetDispenserStatus(dispenser.id);

  return (
    <Card
      sx={(theme) => ({
        position: "absolute",
        bottom: "calc(var(--mantine-footer-height, 0px) + 16px)",
        left: 16,
        right: 16,
        zIndex: 101,
        backgroundColor: "white",
      })}
    >
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Card.Section
        sx={(theme) => ({
          padding: theme.spacing.md,
        })}
      >
        <Flex justify="space-between" align="center">
          <Group></Group>
          <Group>
            {userRole === "admin" && (
              <ActionIcon
                color="red"
                variant="filled"
                onClick={() => onDelete(dispenser.id)}
              >
                <IconTrash size={18} />
              </ActionIcon>
            )}
            <CloseButton
              title="Close popover"
              size="xl"
              iconSize={20}
              onClick={onClose}
            />
          </Group>
        </Flex>
      </Card.Section>
      {dispenserStatus.data && dispenserStatus.data.length ? (
        <Card.Section>
          <BadgeSlider statuses={dispenserStatus.data} />
        </Card.Section>
      ) : null}
      <Card.Section
        sx={(theme) => ({
          padding: theme.spacing.md,
        })}
      >
        <Carousel
          slideSize="70%"
          height={70}
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
          <Carousel.Slide>
            <Button
              color="green"
              onClick={() => onVote(dispenser.id, "ok")}
              fullWidth
            >
              🌈 Disponible
            </Button>
          </Carousel.Slide>
          <Carousel.Slide>
            <Button
              color="dark"
              onClick={() => onVote(dispenser.id, "notfound")}
              fullWidth
            >
              👎 Introuvable
            </Button>
          </Carousel.Slide>
          <Carousel.Slide>
            <Button
              color="red"
              onClick={() => onVote(dispenser.id, "empty")}
              fullWidth
            >
              😑 Vide
            </Button>
          </Carousel.Slide>
          <Carousel.Slide>
            <Button
              color="orange"
              onClick={() => onVote(dispenser.id, "low")}
              fullWidth
            >
              🦖 Bientôt vide
            </Button>
          </Carousel.Slide>
        </Carousel>
      </Card.Section>
    </Card>
  );
};

export default DispenserCard;
