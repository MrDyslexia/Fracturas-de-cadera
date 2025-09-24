"use client"

import { useState } from "react"
import { Hospital, Calendar, Clock, PlusCircle, CircleCheck, CircleX, History, Trash2 } from "lucide-react"

function nowDate() {
  return new Date().toISOString().split("T")[0]
}
function nowTime() {
  return new Date().toTimeString().split(" ")[0].substring(0, 5)
}
function nowDateTime() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`
}

type Evento = {
  id: number
  fecha: string
  inicio: string
  fin: string
  tecnica: string
  lado: string
  reop: boolean
  compIntra: string
}

type Suspension = {
  id: number
  fecha: string
  tipo: "Clínica" | "Administrativa"
  motivo: string
  confirmado: boolean
}

type RegistroSusp = {
  id: number
  fecha: string
  tipo: string
  motivo: string
  registradoEn: string
}

export default function QuirofanoPage() {
  // ─────────────────────── Quirófano ───────────────────────
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: 1,
      fecha: "2025-03-03",
      inicio: "09:00",
      fin: "10:15",
      tecnica: "Gamma Nail",
      lado: "Derecho",
      reop: false,
      compIntra: "No",
    },
  ])

  function setCampoEvento(id: number, campo: keyof Evento, valor: any) {
    setEventos((prev) => prev.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)))
  }
  function iniciarCirugia() {
    const nuevo: Evento = {
      id: eventos.length + 1,
      fecha: nowDate(),
      inicio: nowTime(),
      fin: "",
      tecnica: "",
      lado: "",
      reop: false,
      compIntra: "",
    }
    setEventos((prev) => [...prev, nuevo])
  }
  function terminarCirugia(id: number) {
    setEventos((prev) => prev.map((e) => (e.id === id ? { ...e, fin: nowTime() } : e)))
  }

  // ───────────────────── Suspensiones ──────────────────────
  const [suspensiones, setSuspensiones] = useState<Suspension[]>([]) // empieza vacía
  const [registroSusp, setRegistroSusp] = useState<RegistroSusp[]>([])

  // Agregar: crea una fila pendiente editable de inmediato
  function agregarSuspension() {
    const nuevo: Suspension = {
      id: suspensiones.length + 1,
      fecha: nowDate(),
      tipo: "Clínica",
      motivo: "",
      confirmado: false,
    }
    setSuspensiones((prev) => [...prev, nuevo])
  }

  // Confirmar: pasa al registro y elimina de la tabla superior
  function confirmarFila(id: number) {
    const s = suspensiones.find((x) => x.id === id)
    if (!s) return
    const reg: RegistroSusp = {
      id: registroSusp.length + 1,
      fecha: s.fecha,
      tipo: s.tipo,
      motivo: s.motivo,
      registradoEn: nowDateTime(),
    }
    setRegistroSusp((prev) => [reg, ...prev])
    setSuspensiones((prev) => prev.filter((x) => x.id !== id))
  }

  // Eliminar pendiente
  function eliminarFila(id: number) {
    setSuspensiones((prev) => prev.filter((x) => x.id !== id))
  }

  function setCampoSusp(id: number, campo: keyof Suspension, valor: any) {
    setSuspensiones((prev) => prev.map((s) => (s.id === id ? { ...s, [campo]: valor } : s)))
  }

  return (
    <div className="grid gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Vista Quirófano</h1>
        <p className="text-slate-600 mt-2">Registro cirugías y suspensiones</p>
      </div>

      {/* ───────────── Panel Quirófano ───────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Hospital className="h-5 w-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quirófano</h2>
              <p className="text-sm text-gray-600">Múltiples cirugías por episodio, tiempos y eventos</p>
            </div>
          </div>
          <button
            onClick={iniciarCirugia}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Hospital className="h-4 w-4" />
            Iniciar cirugía
          </button>
        </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Inicio</th>
                  <th className="px-3 py-2 text-left">Fin</th>
                  <th className="px-3 py-2 text-left">Duración</th>
                  <th className="px-3 py-2 text-left">Técnica</th>
                  <th className="px-3 py-2 text-left">Lado</th>
                  <th className="px-3 py-2 text-left">Reop.</th>
                  <th className="px-3 py-2 text-left">Comp. Intraop</th>
                  <th className="px-3 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((e) => {
                  let duracion = ""
                  if (e.inicio && e.fin) {
                    const [h1, m1] = e.inicio.split(":").map(Number)
                    const [h2, m2] = e.fin.split(":").map(Number)
                    const t = h2 * 60 + m2 - (h1 * 60 + m1)
                    duracion = t > 0 ? `${t} min` : ""
                  }
                  return (
                    <tr key={e.id} className="border-b">
                      <td className="px-3 py-2">{e.id}</td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={e.fecha}
                          onChange={(ev) => setCampoEvento(e.id, "fecha", ev.target.value)}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          value={e.inicio}
                          onChange={(ev) => setCampoEvento(e.id, "inicio", ev.target.value)}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          value={e.fin}
                          onChange={(ev) => setCampoEvento(e.id, "fin", ev.target.value)}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">{duracion}</td>
                      <td className="px-3 py-2">
                        <select
                          value={e.tecnica}
                          onChange={(ev) => setCampoEvento(e.id, "tecnica", ev.target.value)}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">—</option>
                          <option>Gamma Nail</option>
                          <option>DHS</option>
                          <option>ATC</option>
                          <option>APC</option>
                          <option>BIP</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={e.lado}
                          onChange={(ev) => setCampoEvento(e.id, "lado", ev.target.value)}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">—</option>
                          <option>Derecho</option>
                          <option>Izquierdo</option>
                          <option>Bilateral</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={!!e.reop}
                          onChange={(ev) => setCampoEvento(e.id, "reop", ev.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={e.compIntra}
                          onChange={(ev) => setCampoEvento(e.id, "compIntra", ev.target.value)}
                          placeholder="p. ej., sangrado"
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        {!e.fin && (
                          <button
                            onClick={() => terminarCirugia(e.id)}
                            className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <Clock className="h-4 w-4" />
                            Terminar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
      </div>

      {/* ───────────── Panel Suspensiones ───────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Suspensiones ({suspensiones.length})</h2>
              <p className="text-sm text-gray-600">Clínicas o administrativas con motivo</p>
            </div>
          </div>

          {/* Botón único: agrega fila pendiente inmediata */}
          <button
            onClick={agregarSuspension}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Agregar"
          >
            <PlusCircle className="h-4 w-4" />
            Agregar
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                  <th className="px-3 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suspensiones.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={s.fecha}
                        onChange={(e) => setCampoSusp(s.id, "fecha", e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={s.tipo}
                        onChange={(e) => setCampoSusp(s.id, "tipo", e.target.value as Suspension["tipo"])}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Clínica</option>
                        <option>Administrativa</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={s.motivo}
                        onChange={(e) => setCampoSusp(s.id, "motivo", e.target.value)}
                        placeholder="Ej.: INR alto, sin pabellón"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => confirmarFila(s.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <CircleCheck className="h-4 w-4" />
                          Confirmar
                        </button>
                        <button
                          onClick={() => eliminarFila(s.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          title="Eliminar (pendiente)"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ───────────── Registro de suspensiones ───────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <History className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registro de suspensiones</h2>
            <p className="text-sm text-gray-600">Solo se muestran las confirmadas</p>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                  <th className="px-3 py-2 text-left">Registrado el</th>
                </tr>
              </thead>
              <tbody>
                {registroSusp.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={5}>
                      Sin registros aún.
                    </td>
                  </tr>
                ) : (
                  registroSusp.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="px-3 py-2">{r.id}</td>
                      <td className="px-3 py-2">{r.fecha}</td>
                      <td className="px-3 py-2">{r.tipo}</td>
                      <td className="px-3 py-2">{r.motivo}</td>
                      <td className="px-3 py-2">{r.registradoEn}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
