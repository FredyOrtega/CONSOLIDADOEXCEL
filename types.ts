
export interface ExcelRow {
  FECHA: string | number;
  DESCRIPCIÓN: string;
  VALOR: number;
  LOCAL: string;
  "RAZON SICIAL": string;
  NIT: string | number;
  "N° FACTURA": string | number;
  CONCEPTO: string;
  "RTE FTE": number;
  "RTE IVA": number;
  ICA: number;
  DSTO: number;
  "SALDO PENDIENTE": number;
  ANTICIPO: number;
  [key: string]: any;
}

export interface FileData {
  id: string;
  name: string;
  size: number;
  data: ExcelRow[];
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export const MANDATORY_COLUMNS = [
  "FECHA",
  "DESCRIPCIÓN",
  "VALOR",
  "LOCAL",
  "RAZON SICIAL",
  "NIT",
  "N° FACTURA",
  "CONCEPTO",
  "RTE FTE",
  "RTE IVA",
  "ICA",
  "DSTO",
  "SALDO PENDIENTE",
  "ANTICIPO"
];
