"use client"
import { useState } from "react"
import type React from "react"

import {
  FlaskConical,
  ChevronDown,
  Download,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  CircleCheck,
  CircleX,
} from "lucide-react"

const mockSolicitudes = [
  {
    solicitud: "LAB-2024-001",
    tipoMuestra: "Sangre",
    procedencia: "Urgencias",
    tipoIngreso: "Urgente",
    fechaIngreso: "2024-01-15",
    estado: "completado",
    items: [
      {
        id: 1,
        examen: "Hemoglobina",
        recepcion: "2024-01-15 08:30",
        validadoPor: "Dr. García",
        fechaValidacion: "2024-01-15 10:15",
        estado: "validado",
      },
      {
        id: 2,
        examen: "Albúmina",
        recepcion: "2024-01-15 08:30",
        validadoPor: "Dr. García",
        fechaValidacion: "2024-01-15 10:20",
        estado: "validado",
      },
    ],
  },
  {
    solicitud: "LAB-2024-002",
    tipoMuestra: "Orina",
    procedencia: "Consulta Externa",
    tipoIngreso: "Programado",
    fechaIngreso: "2024-01-16",
    estado: "pendiente",
    items: [
      {
        id: 3,
        examen: "Vitamina D",
        recepcion: "2024-01-16 09:00",
        validadoPor: null,
        fechaValidacion: null,
        estado: "pendiente",
      },
    ],
  },
  {
    solicitud: "LAB-2024-003",
    tipoMuestra: "Sangre",
    procedencia: "Hospitalización",
    tipoIngreso: "Urgente",
    fechaIngreso: "2024-01-17",
    estado: "procesando",
    items: [
      {
        id: 4,
        examen: "Glucosa",
        recepcion: "2024-01-17 07:15",
        validadoPor: null,
        fechaValidacion: null,
        estado: "procesando",
      },
    ],
  },
]

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4">{children}</div>
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pb-6">{children}</div>
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>
}

function CardHeaderWithIcon({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
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
  )
}

function Button({
  children,
  onClick,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "secondary" | "ghost"
  className?: string
}) {
  const baseClasses =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "text-gray-600 hover:bg-gray-100",
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  )
}

const LaboratorioPage = () => {
  const [solicitudes] = useState(mockSolicitudes)
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set())
  const [filtros, setFiltros] = useState({
    tipoMuestra: "",
    procedencia: "",
    tipoIngreso: "",
    fechaIngreso: "",
    busqueda: "",
  })

  const StatusBadge = ({ estado }: { estado: string }) => {
    const getStatusConfig = (estado: string) => {
      switch (estado) {
        case "completado":
          return { icon: CheckCircle, color: "bg-green-600 text-white", label: "Completado" }
        case "procesando":
          return { icon: Clock, color: "bg-blue-600 text-white", label: "Procesando" }
        case "pendiente":
          return { icon: AlertCircle, color: "bg-gray-500 text-white", label: "Pendiente" }
        case "validado":
          return { icon: CheckCircle, color: "bg-green-600 text-white", label: "Validado" }
        default:
          return { icon: AlertCircle, color: "bg-gray-500 text-white", label: "Desconocido" }
      }
    }

    const { icon: Icon, color, label } = getStatusConfig(estado)
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    )
  }

  const optsTipoMuestra = ["", ...new Set(solicitudes.map((s) => s.tipoMuestra))]
  const optsProcedencia = ["", ...new Set(solicitudes.map((s) => s.procedencia))]
  const optsTipoIngreso = ["", ...new Set(solicitudes.map((s) => s.tipoIngreso))]
  const optsFechaIng = ["", ...new Set(solicitudes.map((s) => s.fechaIngreso))]

  const filtradas = solicitudes.filter((s) => {
    return (
      (!filtros.tipoMuestra || s.tipoMuestra === filtros.tipoMuestra) &&
      (!filtros.procedencia || s.procedencia === filtros.procedencia) &&
      (!filtros.tipoIngreso || s.tipoIngreso === filtros.tipoIngreso) &&
      (!filtros.fechaIngreso || s.fechaIngreso === filtros.fechaIngreso) &&
      (!filtros.busqueda || s.solicitud.toLowerCase().includes(filtros.busqueda.toLowerCase()))
    )
  })

  const toggle = (solicitud: string) => {
    const nuevas = new Set(abiertas)
    if (nuevas.has(solicitud)) {
      nuevas.delete(solicitud)
    } else {
      nuevas.add(solicitud)
    }
    setAbiertas(nuevas)
  }

  const descargarSolicitud = (solicitud: any) => {
    console.log("Descargando solicitud completa:", solicitud.solicitud)
  }

  const descargarExamen = (examen: any) => {
    console.log("Descargando examen:", examen.examen)
  }

  return (
      <div className="p-6 max-w-7xl mx-auto relative">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Exámenes de Laboratorio</h1>
          <p className="text-slate-600 mt-2">Gestión completa de solicitudes y resultados de laboratorio</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeaderWithIcon
              icon={<FlaskConical className="h-5 w-5" />}
              title="Resumen de Exámenes"
              subtitle="Estado actual de las solicitudes de laboratorio"
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {solicitudes.filter((s) => s.estado === "completado").length}
                  </div>
                  <div className="text-green-700 font-medium">Completados</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {solicitudes.filter((s) => s.estado === "procesando").length}
                  </div>
                  <div className="text-blue-700 font-medium">En proceso</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="text-3xl font-bold text-gray-600">
                    {solicitudes.filter((s) => s.estado === "pendiente").length}
                  </div>
                  <div className="text-gray-700 font-medium">Pendientes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderWithIcon
              icon={<Filter className="h-5 w-5" />}
              title="Filtros y Búsqueda"
              subtitle="Encuentra solicitudes específicas"
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por número..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filtros.tipoMuestra}
                  onChange={(e) => setFiltros({ ...filtros, tipoMuestra: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tipo de muestra</option>
                  {optsTipoMuestra.slice(1).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <select
                  value={filtros.procedencia}
                  onChange={(e) => setFiltros({ ...filtros, procedencia: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Procedencia</option>
                  {optsProcedencia.slice(1).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <select
                  value={filtros.tipoIngreso}
                  onChange={(e) => setFiltros({ ...filtros, tipoIngreso: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tipo de ingreso</option>
                  {optsTipoIngreso.slice(1).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderWithIcon
              icon={<Calendar className="h-5 w-5" />}
              title={`Solicitudes de Laboratorio (${filtradas.length})`}
              subtitle="Lista expandible de solicitudes con exámenes individuales"
            />
            <CardContent>
              <div className="space-y-4">
                {filtradas.map((solicitud) => {
                  const abierto = abiertas.has(solicitud.solicitud)
                  return (
                    <div
                      key={solicitud.solicitud}
                      className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 cursor-pointer" onClick={() => toggle(solicitud.solicitud)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <div className="font-semibold text-gray-900">{solicitud.solicitud}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {solicitud.fechaIngreso}
                              </div>
                            </div>
                            <div className="hidden md:flex flex-col gap-1">
                              <div className="text-sm font-medium">{solicitud.tipoMuestra}</div>
                              <div className="text-xs text-gray-600">{solicitud.procedencia}</div>
                            </div>
                            <div className="hidden md:block">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  solicitud.tipoIngreso === "Urgente"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {solicitud.tipoIngreso}
                              </span>
                            </div>
                            <StatusBadge estado={solicitud.estado} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">{solicitud.items.length} exámenes</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${abierto ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                      </div>

                      {abierto && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Exámenes individuales</h4>
                            <Button onClick={() => descargarSolicitud(solicitud)}>
                              <Download className="h-4 w-4" />
                              Descargar todo
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {solicitud.items.map((examen) => (
                              <div
                                key={examen.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col">
                                    <div className="font-medium text-gray-900">{examen.examen}</div>
                                    <div className="text-sm text-gray-600">Recepción: {examen.recepcion || "—"}</div>
                                  </div>
                                  <div className="hidden md:flex flex-col">
                                    <div className="text-sm">
                                      {examen.validadoPor ? `Validado por ${examen.validadoPor}` : "Sin validar"}
                                    </div>
                                    <div className="text-xs text-gray-600">{examen.fechaValidacion || "—"}</div>
                                  </div>
                                  <StatusBadge estado={examen.estado} />
                                </div>
                                <Button variant="ghost" onClick={() => descargarExamen(examen)} className="h-8 w-8 p-0">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button>
              <CircleCheck className="h-4 w-4" />
              Guardar
            </Button>
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Exportar resultados
            </Button>
            <Button variant="ghost">
              <CircleX className="h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>
  )
}

export default LaboratorioPage
