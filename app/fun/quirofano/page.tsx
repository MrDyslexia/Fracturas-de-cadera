"use client"

import { useState } from "react"
import { Hospital, Calendar, Clock, PlusCircle, CircleCheck, CircleX } from "lucide-react"

function nowDate() {
  return new Date().toISOString().split("T")[0]
}

function nowTime() {
  return new Date().toTimeString().split(" ")[0].substring(0, 5)
}

export default function QuirofanoPage() {
  const [eventos, setEventos] = useState([
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

  const [suspensiones, setSuspensiones] = useState([
    { id: 1, fecha: "2025-03-02", tipo: "Clínica", motivo: "INR alto" },
    { id: 2, fecha: "2025-03-05", tipo: "Administrativa", motivo: "Falta pabellón" },
  ])

  const [nuevaSusp, setNuevaSusp] = useState({ fecha: nowDate(), tipo: "Clínica", motivo: "" })

  function setCampoEvento(id: number, campo: string, valor: any) {
    setEventos(eventos.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)))
  }

  function setCampoSusp(id: number, campo: string, valor: any) {
    setSuspensiones(suspensiones.map((s) => (s.id === id ? { ...s, [campo]: valor } : s)))
  }

  function iniciarCirugia() {
    const nuevo = {
      id: eventos.length + 1,
      fecha: nowDate(),
      inicio: nowTime(),
      fin: "",
      tecnica: "",
      lado: "",
      reop: false,
      compIntra: "",
    }
    setEventos([...eventos, nuevo])
  }

  function terminarCirugia(id: number) {
    setEventos(eventos.map((e) => (e.id === id ? { ...e, fin: nowTime() } : e)))
  }

  function agregarSuspension() {
    const nuevo = { id: suspensiones.length + 1, ...nuevaSusp }
    setSuspensiones([...suspensiones, nuevo])
    setNuevaSusp({ fecha: nowDate(), tipo: "Clínica", motivo: "" })
  }

  function eliminarSusp(id: number) {
    setSuspensiones(suspensiones.filter((s) => s.id !== id))
  }

  return (
    <div className="grid gap-6 p-6">
      <div className="">
        <h1 className="text-3xl font-bold text-slate-900">Vista Quirófano</h1>
        <p className="text-slate-600 mt-2">
          Registro completo del cirugías y evolución del paciente
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Hospital className="h-5 w-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quirófano (registro ligero)</h2>
              <p className="text-sm text-gray-600">Múltiples cirugías por episodio; tiempos y eventos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <CircleCheck className="h-4 w-4" />
              Guardar
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <CircleX className="h-4 w-4" />
              Descartar
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-3">
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
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Suspensiones ({suspensiones.length})</h2>
              <p className="text-sm text-gray-600">Clínicas o administrativas con motivo (editable)</p>
            </div>
          </div>
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
                        onChange={(e) => setCampoSusp(s.id, "tipo", e.target.value)}
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
                      <button
                        onClick={() => eliminarSusp(s.id)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={nuevaSusp.fecha}
                      onChange={(e) => setNuevaSusp({ ...nuevaSusp, fecha: e.target.value })}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={nuevaSusp.tipo}
                      onChange={(e) => setNuevaSusp({ ...nuevaSusp, tipo: e.target.value })}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Clínica</option>
                      <option>Administrativa</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={nuevaSusp.motivo}
                      onChange={(e) => setNuevaSusp({ ...nuevaSusp, motivo: e.target.value })}
                      placeholder="Motivo"
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={agregarSuspension}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Agregar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
