"use client"
import { X, Droplets, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { DetallesPaciente } from "@/types/interfaces"

interface BloodModalProps {
  isOpen: boolean
  onClose: () => void
  paciente: DetallesPaciente | null
}

export default function BloodModal({ isOpen, onClose, paciente }: Readonly<BloodModalProps>) {
  if (!isOpen || !paciente) return null

  const analisisSangre = paciente.general?.analisis_sangre

  if (!analisisSangre) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Droplets className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold">Análisis de Sangre</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-500 text-center py-8">No hay datos de análisis de sangre disponibles</p>
        </div>
      </div>
    )
  }

  const getStatusInfo = (value: number, normalMin: number, normalMax: number) => {
    if (value < normalMin) {
      return {
        color: "blue",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-800",
        valueColor: "text-blue-600",
        icon: TrendingDown,
        status: "Bajo",
      }
    } else if (value > normalMax) {
      return {
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        valueColor: "text-red-600",
        icon: TrendingUp,
        status: "Alto",
      }
    } else {
      return {
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        valueColor: "text-green-600",
        icon: Minus,
        status: "Normal",
      }
    }
  }

  const parametros = [
    {
      nombre: analisisSangre.hemoglobina.nombre,
      valor: analisisSangre.hemoglobina.valor,
      unidad: analisisSangre.hemoglobina.unidad,
      fecha: analisisSangre.hemoglobina.fecha,
      normalMin: 12,
      normalMax: 16,
      rango: "12-16 g/dL",
    },
    {
      nombre: analisisSangre.glucosa.nombre,
      valor: analisisSangre.glucosa.valor,
      unidad: analisisSangre.glucosa.unidad,
      fecha: analisisSangre.glucosa.fecha,
      normalMin: 70,
      normalMax: 100,
      rango: "70-100 mg/dL",
    },
    {
      nombre: analisisSangre.colesterol_total.nombre,
      valor: analisisSangre.colesterol_total.valor,
      unidad: analisisSangre.colesterol_total.unidad,
      fecha: analisisSangre.colesterol_total.fecha,
      normalMin: 0,
      normalMax: 200,
      rango: "<200 mg/dL",
    },
    {
      nombre: analisisSangre.trigliceridos.nombre,
      valor: analisisSangre.trigliceridos.valor,
      unidad: analisisSangre.trigliceridos.unidad,
      fecha: analisisSangre.trigliceridos.fecha,
      normalMin: 0,
      normalMax: 150,
      rango: "<150 mg/dL",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Droplets className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold">Análisis de Sangre</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {parametros.map((param) => {
              const statusInfo = getStatusInfo(param.valor, param.normalMin, param.normalMax)
              const StatusIcon = statusInfo.icon

              return (
                <div
                  key={param.nombre}
                  className={`p-4 ${statusInfo.bgColor} rounded-lg border ${statusInfo.borderColor}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${statusInfo.textColor}`}>{param.nombre}</h3>
                    <StatusIcon className={`w-4 h-4 ${statusInfo.valueColor}`} />
                  </div>
                  <p className={`text-2xl font-bold ${statusInfo.valueColor}`}>
                    {param.valor} {param.unidad}
                  </p>
                  <p className={`text-sm ${statusInfo.valueColor}`}>
                    {statusInfo.status} ({param.rango})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(param.fecha).toLocaleDateString("es-CL")}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Información del Paciente</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Tipo de sangre</span>
                <span className="text-sm font-medium">{paciente.general.tipo_sangre}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Edad</span>
                <span className="text-sm font-medium">{paciente.general.edad} años</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
