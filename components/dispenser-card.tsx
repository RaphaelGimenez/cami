import BadgeSlider from "@/components/badge-slider";
import StatusBadge from "@/components/status-badge";
import useGetDispenserStatus from "@/hooks/useGetDispenserStatus";
import useProfile from "@/hooks/useProfile";
import { DispenserRow } from "@/types/interfaces";
import { Database } from "@/utils/database.types";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  CloseButton,
  Flex,
  Group,
  LoadingOverlay,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface DispenserCardProps {
  dispenser: DispenserRow;
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
        <Group>
          <Button color="dark" onClick={() => onVote(dispenser.id, "notfound")}>
            👎 Introuvable
          </Button>
          <Button color="red" onClick={() => onVote(dispenser.id, "empty")}>
            😑 Vide
          </Button>
          <Button color="orange" onClick={() => onVote(dispenser.id, "low")}>
            🦖 Bientôt vide
          </Button>
          <Button color="green" onClick={() => onVote(dispenser.id, "ok")}>
            🌈 Disponible
          </Button>
        </Group>
      </Card.Section>
    </Card>
  );
};

export default DispenserCard;
