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
  createdAt: string;
}

const StatusBadge = ({ status, createdAt }: StatusBadgeProps) => {
  const [color, setColor] = useState("green");
  const [text, setText] = useState("Disponible");
  const [date, setDate] = useState(dayjs(createdAt).fromNow());

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
    <Badge color={color} fullWidth>
      {text} {date}
    </Badge>
  );
};

export default StatusBadge;
