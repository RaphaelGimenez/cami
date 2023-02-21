import { DispenserRow } from "@/types/interfaces";
import { Badge, Button, Card, CloseButton, Flex, Group } from "@mantine/core";

interface DispenserCardProps {
  dispenser: DispenserRow;
  onClose: () => void;
}
const DispenserCard = ({ dispenser, onClose }: DispenserCardProps) => {
  return (
    <Card
      sx={(theme) => ({
        position: "absolute",
        bottom: "calc(var(--mantine-footer-height, 0px) + 16px)",
        left: 16,
        right: 16,
        zIndex: 1001,
        backgroundColor: "white",
      })}
    >
      <Card.Section
        sx={(theme) => ({
          padding: theme.spacing.md,
        })}
      >
        <Flex justify="space-between" align="center">
          <Badge color="orange">Badge</Badge>
          <CloseButton
            title="Close popover"
            size="xl"
            iconSize={20}
            onClick={onClose}
          />
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
