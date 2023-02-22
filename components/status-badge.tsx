import { Database } from "@/utils/database.types";
import { Badge } from "@mantine/core";
import { useEffect, useState } from "react";
import "dayjs/locale/fr";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale("fr");
dayjs.extend(relativeTime);

interface StatusBadgeProps {
  status: Database["public"]["Enums"]["DISPENSER_STATUS"];
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const [color, setColor] = useState("green");
  const [text, setText] = useState("Disponible");
  const [date, setDate] = useState(dayjs().fromNow());

  useEffect(() => {
    switch (status) {
      case "notfound":
        setColor("dark");
        setText("👎");
        break;
      case "empty":
        setColor("red");
        setText("😑");
        break;
      case "low":
        setColor("orange");
        setText("🦖");
        break;
      case "ok":
        setColor("green");
        setText("🌈");
        break;
      default:
        setColor("gray");
        setText("Unknown");
        break;
    }
  }, [status]);

  return (
    <Badge color={color}>
      {text} {date}
    </Badge>
  );
};

export default StatusBadge;
