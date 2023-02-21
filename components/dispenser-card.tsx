import useProfile from "@/hooks/useProfile";
import { DispenserRow } from "@/types/interfaces";
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
}
const DispenserCard = ({
  dispenser,
  onClose,
  onDelete,
  userRole,
  isLoading,
}: DispenserCardProps) => {
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
          <Badge color="orange">Badge</Badge>
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
      <Card.Section
        sx={(theme) => ({
          padding: theme.spacing.md,
        })}
      >
        <Group>
          <Button color="dark">👎 Introuvable</Button>
          <Button color="red">😑 Vide</Button>
          <Button color="orange">🦖 Bientôt vide</Button>
          <Button color="green">🌈 Disponible</Button>
        </Group>
      </Card.Section>
    </Card>
  );
};

export default DispenserCard;
