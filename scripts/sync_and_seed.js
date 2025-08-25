import { sequelize, Examen, Muestra, LabResultItem } from "../models/index.js";
import { pickRange, flagFromRange } from "../services/ranges.js";

async function seed() {
  // 1) Sincroniza (¡CUIDADO! force:true borra tablas)
  await sequelize.sync({ force: true });

  // 2) Crea un Examen general LAB (cabecera del informe)
  const ex = await Examen.create({
    tipo_examen: "LAB",
    paciente_id: 123,            // <- id de paciente
    fuente: "Laboratorio S.A.",
    informado_en: new Date("2025-05-29T00:06:00-04:00")
  });

  // 3) Muestra (suero/sangre)
  const muestra = await Muestra.create({
    examen_id: ex.examen_id,
    tipo_muestra: "Suero",
    fecha_extraccion: new Date("2025-05-28T07:41:00-04:00"),
    fecha_recepcion: new Date("2025-05-29T00:06:00-04:00"),
    profesional_id: 456
  });

  // Helper para insertar con rango/bandera
  async function put(analyte_name, value_num, unit, opts = {}) {
    const measured_at = opts.measured_at ?? ex.informado_en;
    const { low, high } = pickRange(analyte_name, unit, measured_at);
    const flag = value_num != null ? flagFromRange(value_num, low, high) : null;

    return LabResultItem.create({
      examen_id: ex.examen_id,
      muestra_id: muestra.muestra_id,
      analyte_name,
      value_num,
      unit,
      ref_low: low,
      ref_high: high,
      flag,
      metodo: opts.metodo ?? null,
      measured_at
    });
  }

  // === HbA1c (HPLC) con 3 ítems
  await put("HbA1c", 4.6, "%", { metodo: "HPLC", measured_at: new Date("2025-05-28T23:37:00-04:00") });
  await put("HbA1c (IFCC)", 26, "mmol/mol", { metodo: "HPLC", measured_at: new Date("2025-05-28T23:37:00-04:00") });
  await put("Promedio estimado de glucosa (eAG)", 85, "mg/dL", { metodo: "HPLC", measured_at: new Date("2025-05-28T23:37:00-04:00") });

  // === Prolactina (sin rango en JSON — queda sin bandera)
  await put("Prolactina", 14.7, "ng/mL", { metodo: "Quimioluminiscencia" });

  // === Cortisol AM (5.3–22.5 ug/dL)
  await put("Cortisol AM", 14.9, "ug/dL", { metodo: "Quimioluminiscencia", measured_at: new Date("2025-05-28T08:00:00-04:00") });

  // === Insulina basal (1.9–15.0 uU/mL → HIGH)
  await put("Insulina basal", 20.9, "uU/mL", { metodo: "Quimioluminiscencia" });

  console.log("✓ Tablas sincronizadas y datos de ejemplo insertados.");
}

seed()
  .then(() => sequelize.close())
  .catch((e) => { console.error(e); process.exitCode = 1; });
