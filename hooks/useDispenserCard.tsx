import useCreateDispenserStatus from "@/hooks/useCreateDispenserStatus";
import useDeleteDispenser from "@/hooks/useDeleteDispenser";
import { Database } from "@/utils/database.types";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { useCallback, useEffect, useMemo, useState } from "react";

const useDispenserCard = () => {
  const deleteDispenser = useDeleteDispenser();
  const createDispenserStatus = useCreateDispenserStatus();
  const [dispenser, setDispenser] = useState<
    Database["public"]["Tables"]["dispensers"]["Row"] | null
  >(null);

  const handleDeleteDispenser = useCallback(
    (id: number) => {
      openConfirmModal({
        title: "Supprimer le distributeur ?",
        centered: true,
        labels: { confirm: "Supprimer", cancel: "Annuler" },
        confirmProps: { color: "red" },
        onCancel: () => console.log("Cancel"),
        onConfirm: () => deleteDispenser.mutate(id),
      });
    },
    [deleteDispenser]
  );

  const addStatus = useCallback(
    (id: number, status: Database["public"]["Enums"]["DISPENSER_STATUS"]) => {
      createDispenserStatus.mutate({
        dispenserId: id,
        status,
      });
    },
    [createDispenserStatus]
  );

  const close = useCallback(() => {
    setDispenser(null);
  }, []);

  const open = (
    dispenser: Database["public"]["Tables"]["dispensers"]["Row"]
  ) => {
    setDispenser(dispenser);
  };

  useEffect(() => {
    if (deleteDispenser.status === "success") {
      close();
      deleteDispenser.reset();
    }
  }, [deleteDispenser, close]);

  const isLoading = useMemo(() => {
    return (
      deleteDispenser.status === "loading" ||
      createDispenserStatus.status === "loading"
    );
  }, [deleteDispenser, createDispenserStatus]);

  return {
    open,
    close,
    delete: handleDeleteDispenser,
    addStatus,
    dispenser,
    isLoading,
  };
};

export default useDispenserCard;
