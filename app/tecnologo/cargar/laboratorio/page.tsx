"use client";

import RoleGuard from "@/components/RoleGuard";
import ExamFormFrame from "@/components/Tecnologo/ExamFormFrame";

export default function Page() {
  return (
    <RoleGuard allow={["tecnologo"]}>
      <ExamFormFrame title="Subir examen de laboratorio">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Tipo de examen</span>
            <select name="tipo_examen" className="border rounded-lg px-3 py-2">
              <option value="LABORATORIO">Laboratorio</option>
              <option value="Hematología">Hematología</option>
              <option value="Química">Química</option>
              <option value="Hormonas">Hormonas</option>
              <option value="Vitaminas">Vitaminas</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Tipo de muestra</span>
            <select name="tipo_muestra" className="border rounded-lg px-3 py-2">
              <option value="SANGRE">Sangre</option>
              <option value="ORINA">Orina</option>
              <option value="SUERO">Suero</option>
              <option value="PLASMA">Plasma</option>
              <option value="OTRO">Otro</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Fecha de recepción</span>
            <input name="fecha_recepcion" type="datetime-local" className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Validador</span>
            <input name="validado_por" placeholder="Nombre del tecnólogo" className="border rounded-lg px-3 py-2" />
          </label>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium text-slate-800 mb-2">Resultados (genéricos)</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <input name="resultado_1_parametro" placeholder="Parámetro (p. ej. GLUCOSA)" className="border rounded-lg px-3 py-2" />
            <input name="resultado_1_valor" placeholder="Valor (p. ej. 95)" className="border rounded-lg px-3 py-2" />
            <input name="resultado_1_unidad" placeholder="Unidad (mg/dL)" className="border rounded-lg px-3 py-2" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3 mt-2">
            <input name="resultado_2_parametro" placeholder="Parámetro" className="border rounded-lg px-3 py-2" />
            <input name="resultado_2_valor" placeholder="Valor" className="border rounded-lg px-3 py-2" />
            <input name="resultado_2_unidad" placeholder="Unidad" className="border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Observaciones</span>
            <textarea name="observaciones" rows={3} className="border rounded-lg px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Adjunto (PDF/TXT/JSON opcional)</span>
            <input name="archivo" type="file" accept=".pdf,.txt,.json" className="border rounded-lg px-3 py-2" />
          </label>
        </div>
      </ExamFormFrame>
    </RoleGuard>
  );
}
