
import * as XLSX from 'xlsx';
import { ExcelRow, MANDATORY_COLUMNS } from '../types';

/**
 * Parsea un archivo Excel y extrae las filas mapeándolas a la estructura requerida.
 */
export const parseExcelFile = async (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Asumimos que queremos la primera hoja de cada archivo
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertimos a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        // Normalizamos las columnas para que coincidan exactamente con lo solicitado
        const normalizedData: ExcelRow[] = jsonData.map((row: any) => {
          const newRow: any = {};
          MANDATORY_COLUMNS.forEach(col => {
            // Buscamos coincidencia aproximada de nombres (case-insensitive)
            const actualKey = Object.keys(row).find(k => k.trim().toUpperCase() === col.toUpperCase());
            newRow[col] = actualKey ? row[actualKey] : "";
          });
          return newRow as ExcelRow;
        });

        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Crea un archivo Excel a partir de una lista de filas y lo descarga.
 */
export const downloadMergedExcel = (data: ExcelRow[], fileName: string = 'consolidado_excel.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data, { header: MANDATORY_COLUMNS });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidado");
  
  XLSX.writeFile(workbook, fileName);
};
