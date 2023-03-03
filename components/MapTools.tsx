import useCreateDispenser from "@/hooks/useCreateDispenser";
import {
  ActionIcon,
  LoadingOverlay,
  Menu,
  useMantineTheme,
} from "@mantine/core";
import { IconPennant, IconTools } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { useEffect } from "react";
import { MutationStatus } from "@tanstack/react-query";
import IconPooBag from "@/components/icons/IconPooBag";

interface MapToolsProps {
  createDispenser: () => void;
  status: MutationStatus;
}

export function MapTools({ createDispenser, status }: MapToolsProps) {
  const theme = useMantineTheme();

  useEffect(() => {
    if (status === "error") {
      showNotification({
        color: "red",
        title: "Mince",
        message: "Impossible de créer le distributeur",
      });
    }
  }, [status]);

  return (
    <Menu
      transition="pop-top-right"
      position="top-end"
      width={220}
      withinPortal
    >
      <LoadingOverlay visible={status === "loading"} overlayBlur={2} />
      <Menu.Target>
        <ActionIcon color="blue" size="lg" variant="filled">
          <IconTools size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Ajouter</Menu.Label>
        <Menu.Item
          icon={<IconPooBag size={18} color={theme.colors.blue[6]} />}
          onClick={() => createDispenser()}
        >
          Distributeur de sacs
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
