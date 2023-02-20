import useCreateDispenser from "@/hooks/useCreateDispenser";
import { Button, LoadingOverlay, Menu, useMantineTheme } from "@mantine/core";
import { IconChevronDown, IconPennant } from "@tabler/icons-react";
import getUserLocation from "@/utils/get-user-location";
import { showNotification } from "@mantine/notifications";
import { useEffect } from "react";

export function MapTools() {
  const theme = useMantineTheme();
  const { mutate, status } = useCreateDispenser();

  const createDispenser = async () => {
    try {
      const location = await getUserLocation();
      mutate({ location });
    } catch (error) {
      showNotification({
        color: "red",
        title: "Mince",
        message: "Impossible de récupérer votre position",
      });
    }
  };

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
        <Button rightIcon={<IconChevronDown size={18} stroke={1.5} />} pr={12}>
          Ajouter
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          icon={
            <IconPennant size={16} color={theme.colors.blue[6]} stroke={1.5} />
          }
          onClick={() => createDispenser()}
        >
          Distributeur de sacs
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
