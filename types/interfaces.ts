export interface Row {
  id: number;
}
export interface Dispenser {
  location: string;
  status: "unknown" | "ok" | "low" | "empty";
}

export interface DispenserRow extends Row, Dispenser {}
export interface NewDispenser {
  location: [number, number];
}
