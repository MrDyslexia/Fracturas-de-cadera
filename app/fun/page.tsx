"use client"

import type React from "react"

import { useMemo, useState } from "react"
import RoleGuard from "@/components/RoleGuard"

import { PACIENTES, DETALLES_PACIENTES } from "@/data/pacientes"
import type { Paciente, DetallesPaciente } from "@/types/interfaces"
import { norm } from "@/utils/text"

import PacienteSearch from "@/components/Funcionario/PacienteSearch"
import PacienteTable from "@/components/Funcionario/PacienteTable"

// Componente Modal
interface ModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly paciente: Paciente | null
  readonly detallesPaciente: DetallesPaciente | null
  readonly children: React.ReactNode
}

function Modal({ isOpen, onClose, paciente, detallesPaciente, children }: ModalProps) {
  if (!isOpen || !paciente) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900/60 via-blue-900/40 to-indigo-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Información del Paciente</h2>
            <p className="text-blue-100 text-sm mt-1">Detalles completos y exámenes médicos</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-full hover:rotate-90 transform"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function FuncionarioHome() {
  const [rutInput, setRutInput] = useState("")
  const [q, setQ] = useState("")

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [selectedDetalles, setSelectedDetalles] = useState<DetallesPaciente | null>(null)

  const abrirModal = (rut: string) => {
    const paciente = PACIENTES.find((p) => p.rut === rut)
    const detalles = DETALLES_PACIENTES.find((d) => d.rut === rut)

    if (paciente) {
      setSelectedPaciente(paciente)
      setSelectedDetalles(detalles || null)
      setIsModalOpen(true)
    }
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
    setSelectedPaciente(null)
    setSelectedDetalles(null)
  }

  // filtro de la tabla a partir de q
  const filtrados = useMemo<Paciente[]>(() => {
    const s = norm(q.trim())
    if (!s) return PACIENTES
    return PACIENTES.filter((p) => {
      const full = `${p.rut} ${p.nombres} ${p.ApellidoPaterno} ${p.ApellidoMaterno}`
      return norm(full).includes(s)
    })
  }, [q])

  const recientes = ["12.345.678-9", "13.345.678-4", "14.345.678-5"]

  const getRiskColor = (riesgo: string) => {
    switch (riesgo) {
      case "bajo":
        return "text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
      case "medio":
        return "text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
      case "alto":
        return "text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
      default:
        return "text-slate-700 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200"
    }
  }

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case ".pdf":
        return "📄"
      case ".xlsx":
        return "📊"
      case ".doc":
        return "📝"
      case ".txt":
        return "📋"
      case ".csv":
        return "📈"
      case ".jpg":
      case ".png":
        return "🖼️"
      default:
        return "📁"
    }
  }

  return (
    <RoleGuard allow={["funcionario"]}>
      <div className="px-6 py-6 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-900 mb-6">Panel del Funcionario</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-12 items-start z-2 bg-trasparent">
          <PacienteSearch value={rutInput} onChange={setRutInput} onOpen={abrirModal} recientes={recientes} />

          <PacienteTable pacientes={filtrados} q={q} onQChange={setQ} onVerPerfil={abrirModal} />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={cerrarModal}
          paciente={selectedPaciente}
          detallesPaciente={selectedDetalles}
        >
          {selectedPaciente && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-6 rounded-xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Datos Personales</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="paciente-rut" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">RUT</label>
                    <p id="paciente-rut" className="text-lg font-mono text-slate-900 bg-white px-3 py-2 rounded-lg border-2 border-blue-200">
                      {selectedPaciente.rut}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="paciente-nombres" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Nombres</label>
                    <p id="paciente-nombres" className="text-lg text-slate-900 bg-white px-3 py-2 rounded-lg border-2 border-blue-200">
                      {selectedPaciente.nombres}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="paciente-apellido-paterno" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                      Apellido Paterno
                    </label>
                    <p id="paciente-apellido-paterno" className="text-lg text-slate-900 bg-white px-3 py-2 rounded-lg border-2 border-blue-200">
                      {selectedPaciente.ApellidoPaterno}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="paciente-apellido-materno" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                      Apellido Materno
                    </label>
                    <p id="paciente-apellido-materno" className="text-lg text-slate-900 bg-white px-3 py-2 rounded-lg border-2 border-blue-200">
                      {selectedPaciente.ApellidoMaterno}
                    </p>
                  </div>
                  {selectedDetalles && (
                    <div className="space-y-2 md:col-span-2">
                      <label
                        htmlFor="fecha-nacimiento"
                        className="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >
                        Fecha de Nacimiento
                      </label>
                      <span
                        id="fecha-nacimiento"
                        className="text-lg text-slate-900 bg-white px-3 py-2 rounded-lg inline-block"
                        aria-labelledby="fecha-nacimiento"
                      >
                        {new Date(selectedDetalles.fechaNacimiento).toLocaleDateString("es-CL")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedDetalles && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 rounded-xl border border-blue-200/60 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Información Médica</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                      <label htmlFor="tipo-sangre" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                        Tipo de Sangre
                      </label>
                      <p id="tipo-sangre" className="text-xl font-bold text-red-600 bg-white px-4 py-3 rounded-lg border-2 border-red-200 text-center">
                        {selectedDetalles.tipoSangre}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="paciente-peso" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Peso</label>
                      <p id="paciente-peso" className="text-xl font-bold text-blue-700 bg-white px-4 py-3 rounded-lg border-2 border-blue-200 text-center">
                        {selectedDetalles.peso} kg
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="paciente-altura" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Altura</label>
                      <p id="paciente-altura" className="text-xl font-bold text-green-700 bg-white px-4 py-3 rounded-lg border-2 border-green-200 text-center">
                        {selectedDetalles.altura} cm
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label htmlFor="numero-indicador" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                        Número Indicador
                      </label>
                      <p
                        id="numero-indicador"
                        className="text-2xl font-bold font-mono text-blue-700 bg-white px-4 py-3 rounded-lg border-2 border-blue-200 text-center"
                        aria-labelledby="numero-indicador"
                      >
                        {selectedDetalles.num_indicador}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nivel-riesgo" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                        Nivel de Riesgo
                      </label>
                      <div className="py-6 rounded-lg">
                        <span
                          id="nivel-riesgo"
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide border ${getRiskColor(selectedDetalles.riesgo)} animate-pulse`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                          {selectedDetalles.riesgo}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedDetalles?.comentario && (
                    <div className="space-y-3">
                      <label htmlFor="comentarios-medicos" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                        Comentarios Médicos
                      </label>
                      <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-inner">
                        <p id="comentarios-medicos" className="text-slate-800 leading-relaxed">{selectedDetalles.comentario}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedDetalles?.examenes && selectedDetalles.examenes.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 rounded-xl border border-emerald-200/60 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Exámenes Médicos</h3>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedDetalles.examenes.length} archivo{selectedDetalles.examenes.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {selectedDetalles.examenes.map((examen, index) => (
                      <div
                        key={examen.id}
                        className="bg-white p-4 rounded-xl border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group animate-in slide-in-from-left"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="text-2xl">{getFileIcon(examen.tipo)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                  {examen.nombre}
                                </h4>
                                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-mono border">
                                  {examen.tipo}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(examen.fecha).toLocaleDateString("es-CL")}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(examen.url, "_blank")}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Ver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </RoleGuard>
  )
}
