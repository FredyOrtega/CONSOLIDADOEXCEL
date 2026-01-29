
import { GoogleGenAI, Type } from "@google/genai";
import { ExcelRow } from "../types";

export const analyzeDataWithGemini = async (data: ExcelRow[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const sample = data.slice(0, 50);
  const prompt = `Analiza los siguientes datos contables (muestra de ${sample.length} filas de un total de ${data.length}).
  
  Las columnas exactas son: FECHA, DESCRIPCIÓN, VALOR, LOCAL, RAZON SICIAL, NIT, N° FACTURA, CONCEPTO, RTE FTE, RTE IVA, ICA, DSTO, SALDO PENDIENTE, ANTICIPO.
  
  Por favor, proporciona:
  1. Un resumen de los totales (Suma de VALOR, RTE FTE, RTE IVA, ICA, SALDO PENDIENTE).
  2. Identifica posibles inconsistencias (ej. NITs mal formateados, facturas duplicadas, o valores de ICA/Retenciones que no parezcan proporcionales).
  3. Sugerencias para mejorar la calidad de los datos.
  
  Datos: ${JSON.stringify(sample)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con la inteligencia artificial para el análisis.";
  }
};
