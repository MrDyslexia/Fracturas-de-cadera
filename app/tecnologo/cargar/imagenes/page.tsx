"use client";

import RoleGuard from "@/components/RoleGuard";
import ExamFormFrame from "@/components/Tecnologo/ExamFormFrame";

export default function Page() {
  return (
    <RoleGuard allow={["tecnologo"]}>
      <ExamFormFrame title="Subir imágenes diagnósticas">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Tipo de estudio</span>
            <select name="tipo_estudio" className="border rounded-lg px-3 py-2">
              <option value="Rayos X">Rayos X</option>
              <option value="Ecografía">Ecografía</option>
              <option value="TAC">TAC</option>
              <option value="RM">Resonancia Magnética</option>
              <option value="Otro">Otro</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Región anatómica</span>
            <input name="region" placeholder="p. ej. Cadera derecha" className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Fecha del estudio</span>
            <input name="fecha" type="datetime-local" className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Informe (resumen)</span>
            <input name="informe" placeholder="Descripción breve" className="border rounded-lg px-3 py-2" />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Adjuntar imágenes</span>
            <input
              name="imagenes"
              type="file"
              multiple
              accept="image/*,.dcm"
              className="border rounded-lg px-3 py-2"
            />
            <span className="text-xs text-slate-500">Acepta JPG/PNG y DICOM (.dcm)</span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Adjuntar informe (PDF opcional)</span>
            <input name="informe_pdf" type="file" accept=".pdf" className="border rounded-lg px-3 py-2" />
          </label>
        </div>
      </ExamFormFrame>
    </RoleGuard>
  );
}
