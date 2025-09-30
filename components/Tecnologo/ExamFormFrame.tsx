"use client";

import type { ReactNode } from "react";

interface ExamFormFrameProps {
  children: ReactNode
}
export default function ExamFormFrame({ children }: ExamFormFrameProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, FormDataEntryValue> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Agrupar resultados
    const resultados: Array<{ id: number, valor: string, parametro: string, unidad: string }> = [];
    for (let i = 1; i <= 3; i++) {
      resultados.push({
      id: i,
      valor: String(data[`resultado_${i}_valor`] ?? ""),
      parametro: String(data[`resultado_${i}_parametro`] ?? ""),
      unidad: String(data[`resultado_${i}_unidad`] ?? "")
      });
    }

    // El resto de los datos
    const {
      fecha_recepcion,
      observaciones,
      tipo_examen,
      tipo_muestra,
      validado_por
    } = data;

    console.log("Form Data Submitted:", {
      fecha_recepcion,
      observaciones,
      tipo_examen,
      tipo_muestra,
      validado_por,
      resultados
    });
  };
  
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
            {children}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Examen
              </button>
            </div>
          </form>
      </div>
  );
}
