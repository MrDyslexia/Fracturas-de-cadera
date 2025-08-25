import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_DIR = path.resolve(__dirname, "../catalog");

function loadJSON(relPath) {
  const p = path.join(CATALOG_DIR, relPath);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const rangesHbA1c = loadJSON("ranges.hba1c.json");
const rangesCortAM = loadJSON("ranges.cortisol_am.json");
const rangesInsu = loadJSON("ranges.insulina_basal.json");

export function pickRange(analyteName, unit, measuredAt = new Date()) {
  const hhmm = measuredAt.toISOString().substring(11,16); // "HH:MM"
  const pickFrom = (arr) => {
    for (const r of arr) {
      if (r.analyte !== analyteName) continue;
      if (unit && r.unit && r.unit !== unit) continue;
      if (r.timeWindow) {
        const from = r.timeWindow.from, to = r.timeWindow.to;
        if (hhmm < from || hhmm > to) continue;
      }
      return { low: r.low ?? null, high: r.high ?? null };
    }
    return { low: null, high: null };
  };

  if (analyteName.startsWith("HbA1c")) return pickFrom(rangesHbA1c);
  if (/Cortisol AM/i.test(analyteName)) return pickFrom(rangesCortAM);
  if (/Insulina basal/i.test(analyteName)) return pickFrom(rangesInsu);
  return { low: null, high: null };
}

export function flagFromRange(value, low, high) {
  if (value == null || (low == null && high == null)) return null;
  if (low != null && value < low) return "L";
  if (high != null && value > high) return "H";
  return "N";
}
