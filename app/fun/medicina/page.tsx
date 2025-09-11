"use client";

import type React from "react";
import { useState } from "react";
import {
  ClipboardList,
  AlertTriangle,
  Activity,
  Hospital,
  HeartPulse,
  Calendar,
  Cigarette,
  Wine,
  Pill,
  Droplet,
  Clock,
  CircleCheck,
  FileText,
  CircleX,
  ChevronDown,
} from "lucide-react";
function nowDateTime() {
  return new Date().toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
import { Switch } from "@/components/ui/Switch";
function diffDays(date1: string, date2: string) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d1.getTime() - d2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const currentUser = { nombre: "Dr. García" };

function Card({
  children,
  className = "",
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="p-6 pb-4">{children}</div>;
}

function CardContent({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="px-6 pb-6">{children}</div>;
}

function CardTitle({ children }: Readonly<{ children: React.ReactNode }>) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
}

function CardDescription({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}

function Button({
  children,
  onClick,
  variant = "default",
  className = "",
}: Readonly<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "secondary" | "ghost";
  className?: string;
}>) {
  const baseClasses =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
}: Readonly<{
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
}: Readonly<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}>) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={3}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
    />
  );
}

function Label({
  children,
  className = "",
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <label className={`text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </label>
  );
}

function Select({
  value,
  onValueChange,
  children,
}: Readonly<{
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

function SelectTrigger({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

function SelectValue() {
  return null;
}

function SelectContent({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

function SelectItem({
  value,
  children,
}: Readonly<{ value: string; children: React.ReactNode }>) {
  return <option value={value}>{children}</option>;
}

function Checkbox({
  checked,
  onCheckedChange,
}: Readonly<{
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}>) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
  );
}

function Field({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function HabitRow({
  icon,
  label,
  value,
  onChange,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}>) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center justify-between gap-3">
        {icon}
        <Label>{label}</Label>
        
      </div><Switch
          checked={value}
          onCheckedChange={onChange}
          size="sm"
          color="primary"
        />
    </div>
  );
}

function CardHeaderWithIcon({
  icon,
  title,
  subtitle,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}>) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">{icon}</div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

export default function MedicinaPage() {
  const [dx, setDx] = useState({
    cie10: "S72.1",
    lado: "Derecho",
    procedencia: "Urgencia",
    fechaDx: "2025-03-01",
    notas: "Dolor y limitación funcional",
  });

  const [habitos, setHabitos] = useState({
    tabaco: false,
    alcohol: false,
    corticoides: false,
    taco: false,
  });

  const [comorb, setComorb] = useState<string[]>([]);

  const [preComp, setPreComp] = useState({
    tiene: false,
    desc: "",
  });

  const [postComp, setPostComp] = useState({
    tiene: false,
    desc: "",
  });

  const [evol, setEvol] = useState({
    transfusion: false,
    reingreso: false,
    comentarios:
      "Buena tolerancia al dolor; iniciar rehabilitación día 1 post‑op.",
  });

  const [controles, setControles] = useState([
    {
      id: 1,
      fecha: "2025-03-01 13:00",
      profesional: "Dr. Pérez",
      origen: "Ingreso",
      resumen: "Dx inicial S72.1 Pertrocantérica",
    },
  ]);

  const comorbOptions = [
    "DM2",
    "EPOC",
    "ERC",
    "ECV/ACV",
    "Parkinson",
    "Epilepsia",
  ];

  const toggleChip = (k: string) =>
    setComorb((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );

  function registrarControl(origen: string) {
    const resumen = `Dx ${dx.cie10} ${dx.lado} — ${dx.procedencia}`;
    const nuevo = {
      id: controles.length + 1,
      fecha: nowDateTime(),
      profesional: currentUser.nombre,
      origen,
      resumen,
    };
    setControles([...controles, nuevo]);
  }

  const ordenados = [...controles].sort((a, b) =>
    b.fecha.localeCompare(a.fecha)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Vista Médica</h1>
        <p className="text-slate-600 mt-2">
          Registro completo del diagnóstico y evolución del paciente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnóstico inicial */}
        <Card>
          <CardHeaderWithIcon
            icon={<ClipboardList className="h-5 w-5" />}
            title="Diagnóstico inicial y antecedentes"
            subtitle="Registrar/actualizar el diagnóstico y notas clínicas de admisión"
          />
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="CIE‑10 (tipo de fractura)">
                <Select
                  value={dx.cie10}
                  onValueChange={(value) => setDx({ ...dx, cie10: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S72.0">S72.0 — Intracapsular</SelectItem>
                    <SelectItem value="S72.1">
                      S72.1 — Pertrocantérica
                    </SelectItem>
                    <SelectItem value="S72.2">
                      S72.2 — Subtrocantérica
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Lado de la fractura">
                <Select
                  value={dx.lado}
                  onValueChange={(value) => setDx({ ...dx, lado: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Derecho">Derecho</SelectItem>
                    <SelectItem value="Izquierdo">Izquierdo</SelectItem>
                    <SelectItem value="Bilateral">Bilateral</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Procedencia">
                <Select
                  value={dx.procedencia}
                  onValueChange={(value) =>
                    setDx({ ...dx, procedencia: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urgencia">Urgencia</SelectItem>
                    <SelectItem value="Derivación APS">
                      Derivación APS
                    </SelectItem>
                    <SelectItem value="Otro centro">Otro centro</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Fecha del diagnóstico">
                <Input
                  type="date"
                  value={dx.fechaDx}
                  onChange={(e) => setDx({ ...dx, fechaDx: e.target.value })}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Notas clínicas">
                  <Textarea
                    value={dx.notas}
                    onChange={(e) => setDx({ ...dx, notas: e.target.value })}
                    placeholder="Hallazgos relevantes al ingreso, dolor, movilidad, riesgo..."
                  />
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complicaciones */}
        <Card>
          <CardHeaderWithIcon
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
            title="Complicaciones"
            subtitle="Registro binario y descripción clínica"
          />
          <CardContent>
            <div className="grid gap-4">
              <div className="rounded-xl border p-3 grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Prequirúrgicas</Label>
                  <Checkbox
                    checked={preComp.tiene}
                    onCheckedChange={(checked) =>
                      setPreComp((prev) => ({ ...prev, tiene: !!checked }))
                    }
                  />
                </div>
                <Textarea
                  disabled={!preComp.tiene}
                  value={preComp.desc}
                  onChange={(e) =>
                    setPreComp((prev) => ({ ...prev, desc: e.target.value }))
                  }
                  placeholder="Ej.: anemia, INR elevado, infección urinaria..."
                />
              </div>

              <div className="rounded-xl border p-3 grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Postquirúrgicas</Label>
                  <Checkbox
                    checked={postComp.tiene}
                    onCheckedChange={(checked) =>
                      setPostComp((prev) => ({ ...prev, tiene: !!checked }))
                    }
                  />
                </div>
                <Textarea
                  disabled={!postComp.tiene}
                  value={postComp.desc}
                  onChange={(e) =>
                    setPostComp((prev) => ({ ...prev, desc: e.target.value }))
                  }
                  placeholder="Ej.: infección de herida, neumonía, TVP..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hábitos */}
        <Card>
          <CardHeaderWithIcon
            icon={<Activity className="h-5 w-5" />}
            title="Hábitos"
            subtitle="Factores modificables que influyen en riesgo y recuperación"
          />
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <HabitRow
                icon={<Cigarette size={24}/>}
                label="Tabaco"
                value={habitos.tabaco}
                onChange={(v) => setHabitos({ ...habitos, tabaco: v })}
              />
              <HabitRow
                icon={<Wine size={24}/>}
                label="Alcohol"
                value={habitos.alcohol}
                onChange={(v) => setHabitos({ ...habitos, alcohol: v })}
              />
              <HabitRow
                icon={<Pill size={24}/>}
                label="Corticoides crónicos"
                value={habitos.corticoides}
                onChange={(v) => setHabitos({ ...habitos, corticoides: v })}
              />
              <HabitRow
                icon={<Droplet size={24}/>}
                label="Anticoagulantes orales (TACO)"
                value={habitos.taco}
                onChange={(v) => setHabitos({ ...habitos, taco: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Evolución post‑cirugía */}
        <Card>
          <CardHeaderWithIcon
            icon={<Hospital className="h-5 w-5" />}
            title="Evolución post‑cirugía"
            subtitle="Eventos clave durante la estancia y al alta"
          />
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <HabitRow
                icon={<Droplet className="h-4 w-4" />}
                label="Transfusión requerida"
                value={evol.transfusion}
                onChange={(v) =>
                  setEvol((prev) => ({ ...prev, transfusion: v }))
                }
              />
              <HabitRow
                icon={<Clock className="h-4 w-4" />}
                label="Reingreso en 30 días"
                value={evol.reingreso}
                onChange={(v) => setEvol((prev) => ({ ...prev, reingreso: v }))}
              />
            </div>
            <div className="mt-4">
              <Field label="Comentarios de evolución">
                <Textarea
                  value={evol.comentarios}
                  onChange={(e) =>
                    setEvol((prev) => ({
                      ...prev,
                      comentarios: e.target.value,
                    }))
                  }
                  placeholder="Dolor controlado, deambulación con asistencia, iniciar rehabilitación..."
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Comorbilidades */}
        <Card className="lg:col-span-2">
          <CardHeaderWithIcon
            icon={<HeartPulse className="h-5 w-5" />}
            title="Comorbilidades crónicas"
            subtitle="Selecciona todas las condiciones relevantes al riesgo"
          />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {comorbOptions.map((key) => (
                <button
                  key={key}
                  onClick={() => toggleChip(key)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    comorb.includes(key)
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registro de controles */}
        <Card className="lg:col-span-2">
          <CardHeaderWithIcon
            icon={<Calendar className="h-5 w-5" />}
            title="Registro de controles"
            subtitle="Quién, cuándo y cada cuántos días se controla"
          />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="px-3 py-2 text-left">Fecha y hora</th>
                    <th className="px-3 py-2 text-left">Profesional</th>
                    <th className="px-3 py-2 text-left">Origen</th>
                    <th className="px-3 py-2 text-left">Resumen</th>
                    <th className="px-3 py-2 text-left">Días desde previo</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenados.map((c, i, arr) => {
                    const prev = arr[i + 1];
                    const dias = prev ? diffDays(c.fecha, prev.fecha) : "—";
                    return (
                      <tr key={c.id} className="border-b">
                        <td className="px-3 py-2">{c.fecha}</td>
                        <td className="px-3 py-2">{c.profesional}</td>
                        <td className="px-3 py-2">{c.origen}</td>
                        <td className="px-3 py-2">{c.resumen}</td>
                        <td className="px-3 py-2">{dias}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="lg:col-span-2 flex flex-wrap gap-3">
          <Button onClick={() => registrarControl("Guardado")}>
            <CircleCheck className="h-4 w-4" />
            Guardar
          </Button>
          <Button
            variant="secondary"
            onClick={() => registrarControl("Minuta")}
          >
            <FileText className="h-4 w-4" />
            Guardar y generar minuta
          </Button>
          <Button variant="ghost">
            <CircleX className="h-4 w-4" />
            Descartar
          </Button>
        </div>
      </div>
    </div>
  );
}
