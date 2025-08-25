import { sequelize, Examen, Muestra, LabResultItem } from "../models/index.js";
import { pickRange, flagFromRange } from "../services/ranges.js";

async function seed() {

  await sequelize.sync({ force: true });


  const ex = await Examen.create({
    tipo_examen: "LAB",
    paciente_id: 123,       
    fuente: "Laboratorio S.A.",
    informado_en: new Date("2025-05-29T00:06:00-04:00")
  });


  const muestra = await Muestra.create({
    examen_id: ex.examen_id,
    tipo_muestra: "Suero",
    fecha_extraccion: new Date("2025-05-28T07:41:00-04:00"),
    fecha_recepcion: new Date("2025-05-29T00:06:00-04:00"),
    profesional_id: 456
  });


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


  await put("HbA1c", 4.6, "%", { metodo: "HPLC", measured_at: new Date("2025-05-28T23:37:00-04:00") });
  await put("HbA1c (IFCC)", 26, "mmol/mol", { metodo: "HPLC", measured_at: new Date("2025-05-28T23:37:00-04:00") });
  await put("Promedio estimado de glucosa (eAG)", 85, "mg/dL", { metodo: "HPLC", measured_at: new Date("2025-05-28T23:37:00-04:00") });


  await put("Prolactina", 14.7, "ng/mL", { metodo: "Quimioluminiscencia" });


  await put("Cortisol AM", 14.9, "ug/dL", { metodo: "Quimioluminiscencia", measured_at: new Date("2025-05-28T08:00:00-04:00") });


  await put("Insulina basal", 20.9, "uU/mL", { metodo: "Quimioluminiscencia" });

  console.log("✓ Tablas sincronizadas y datos de ejemplo insertados.");
}

seed()
  .then(() => sequelize.close())
  .catch((e) => { console.error(e); process.exitCode = 1; });
