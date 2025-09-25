"use client";

import RoleGuard from "@/components/RoleGuard";
import ExamFormFrame from "@/components/Tecnologo/ExamFormFrame";

export default function Page() {
  return (
    <RoleGuard allow={["tecnologo"]}>
      <ExamFormFrame title="Subir biopsia / anatomía patológica">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Tipo de muestra</span>
            <select name="tipo_muestra" className="border rounded-lg px-3 py-2">
              <option value="Biopsia ósea">Biopsia ósea</option>
              <option value="Tejido blando">Tejido blando</option>
              <option value="Otro">Otro</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Sitio anatómico</span>
            <input name="sitio" placeholder="p. ej. Cabeza femoral" className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Fecha de extracción</span>
            <input name="fecha_extraccion" type="datetime-local" className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Patólogo/Validador</span>
            <input name="validado_por" placeholder="Nombre" className="border rounded-lg px-3 py-2" />
          </label>
        </div>

        <div className="mt-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Diagnóstico / Informe histopatológico</span>
            <textarea name="diagnostico" rows={5} className="border rounded-lg px-3 py-2" />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Adjuntar informe (PDF)</span>
            <input name="informe_pdf" type="file" accept=".pdf" className="border rounded-lg px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Adjuntar imágenes microscópicas (opcional)</span>
            <input name="imagenes" type="file" multiple accept="image/*" className="border rounded-lg px-3 py-2" />
          </label>
        </div>
      </ExamFormFrame>
    </RoleGuard>
  );
}
