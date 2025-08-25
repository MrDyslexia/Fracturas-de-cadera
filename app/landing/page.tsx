// app/landing/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Activity, Info } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

// ---------- Datos DEMO (reemplaza por los tuyos) ----------
const YEARS = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025] as const;

type MonthRow = { mes: string; total: number };
type YearSeries = Record<number, MonthRow[]>;

const SERIES: YearSeries = {
  2025: [
    { mes: 'Ene', total: 24 }, { mes: 'Feb', total: 26 }, { mes: 'Mar', total: 25 },
    { mes: 'Abr', total: 27 }, { mes: 'May', total: 30 }, { mes: 'Jun', total: 29 },
    { mes: 'Jul', total: 31 }, { mes: 'Ago', total: 32 }, { mes: 'Sep', total: 33 },
    { mes: 'Oct', total: 35 }, { mes: 'Nov', total: 36 }, { mes: 'Dic', total: 39 },
  ],
  2024: [
    { mes: 'Ene', total: 18 }, { mes: 'Feb', total: 22 }, { mes: 'Mar', total: 20 },
    { mes: 'Abr', total: 21 }, { mes: 'May', total: 24 }, { mes: 'Jun', total: 23 },
    { mes: 'Jul', total: 25 }, { mes: 'Ago', total: 27 }, { mes: 'Sep', total: 26 },
    { mes: 'Oct', total: 28 }, { mes: 'Nov', total: 30 }, { mes: 'Dic', total: 34 },
  ],
};

const PIE = [
  { name: 'Fracturas Intracapsulares', value: 34 },
  { name: 'Fracturas Extracapsulares', value: 66 },
];

const PIE_COLORS = ['#10b981', '#34d399']; // emerald-500 / emerald-300
// -----------------------------------------------------------

export default function LandingPage() {
  const [year, setYear] = useState<number>(2025);
  const [expanded, setExpanded] = useState(false);

  const data = useMemo<MonthRow[]>(() => SERIES[year] ?? [], [year]);
  const totalAnual = useMemo(() => data.reduce((a, r) => a + r.total, 0), [data]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Topbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-xl bg-emerald-600" />
            <span className="text-lg font-semibold">Fracturas de Cadera</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero con imagen de fondo */}
      <section
        className="relative"
        style={{
          backgroundImage: "url('/hospital-real.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlays para legibilidad */}
        <div className="absolute inset-0 bg-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/35 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white sm:text-4xl drop-shadow"
          >
            Bienvenido/a
          </motion.h1>
          <p className="mt-2 max-w-2xl text-slate-100">
            Panel público con una mirada anual del registro institucional.
          </p>
        </div>

        {/* Selector de años */}
        <div className="relative border-t border-emerald-600/40 bg-white">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm transition ${
                  year === y
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-transparent hover:bg-slate-100'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenido */}
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* KPI + Línea */}
          <section className="col-span-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">
                {totalAnual} pacientes registrados en {year}
              </h2>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="mes" tickLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Pie con colores */}
          <section className="col-span-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-5">
            <div className="mb-6 flex items中心 gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <Activity className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">Distribución por tipo de fractura</h2>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(p) => `${Math.round((p.percent ?? 0) * 100)}%`}
                  >
                    {PIE.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Bloque informativo con cifras explicativas */}
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Info className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Panorama de las fracturas de cadera</h3>
          </div>

          {/* Cifras grandes + explicación */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              value="1.6 millones"
              headline="Casos por año en el mundo"
              context="Carga anual estimada actualmente."
              href="https://fundaciontrauma.org.ar/pasos/#estructura-colaborativa"
            />
            <Stat
              value="6.3 millones"
              headline="Casos anuales proyectados al 2050"
              context="≈4× por envejecimiento poblacional."
              href="https://fundaciontrauma.org.ar/pasos/#estructura-colaborativa"
            />
            <Stat
              value="30%"
              headline="Mayores de Chile con 80+ años en 2050"
              context="Proyección demográfica nacional."
              href="https://www.uc.cl/noticias/observatorio-del-envejecimiento-chile-tendra-a-3-de-cada-10-personas-por-sobre-los-80-anos-en-2050/"
            />
          </div>

          {/* Resumen breve */}
          <p className="mt-5 text-slate-700">
            El envejecimiento acelerado incrementa la demanda de atención geriátrica, rehabilitación
            y <span className="font-medium">prevención secundaria</span>. Las fracturas de cadera
            representan un desafío creciente para los sistemas de salud, requiriendo estrategias.
          </p>

          {/* Toggle leer más / menos */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-3 inline-flex items-center text-sm text-slate-600 underline decoration-dotted hover:text-slate-800 focus:outline-none"
            style={{ padding: 0, border: 0, background: 'transparent' }}
          >
            {expanded ? 'Leer menos' : 'Leer más'}
          </button>

          {expanded && (
            <div className="prose prose-slate mt-3 max-w-none text-sm">
              <p>
                Esta plataforma centraliza datos clínicos para análisis por cohorte o paciente,
                mejora la trazabilidad y habilita decisiones basadas en evidencia. Ofrece acceso
                segmentado y métricas clave para profesionales de salud y gestores.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Registro de Fracturas de Cadera — Hospital.
        </div>
      </footer>
    </div>
  );
}

/** ---------- UI ---------- */
function Stat({
  value, headline, context, href,
}: { value: string; headline: string; context?: string; href?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.35 }}
      className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm"
    >
      <div className="text-4xl font-bold leading-tight tracking-tight">{value}</div>
      <div className="mt-1 text-[15px] font-medium text-slate-800">{headline}</div>
      {context && <div className="text-sm text-slate-600">{context}</div>}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-slate-500 underline decoration-dotted hover:text-slate-700"
        >
          Fuente
        </a>
      )}
    </motion.div>
  );
}
