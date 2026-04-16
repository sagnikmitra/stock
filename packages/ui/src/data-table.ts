/** Generic typed column definition for data tables */
export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
  align?: "left" | "center" | "right";
  width?: string;
  sortable?: boolean;
}

/** Build Tailwind alignment class */
export function alignClass(align?: "left" | "center" | "right"): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

/** Placeholder — actual React DataTable component lives in apps/web */
export const DataTable = { alignClass } as const;
