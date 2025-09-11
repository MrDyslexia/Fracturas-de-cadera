"use client"
import { X, AlertTriangle, Clock, TrendingUp } from "lucide-react"

interface AlertsModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export default function AlertsModal({ isOpen, onClose }: AlertsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold">Alertas Médicas</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Presión arterial elevada</h3>
            </div>
            <p className="text-sm text-yellow-700">Última medición: 145/90 mmHg</p>
            <p className="text-sm text-yellow-600">Monitorear en próximas consultas</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-red-800">Medicación pendiente</h3>
            </div>
            <p className="text-sm text-red-700">Renovación de receta vencida</p>
            <p className="text-sm text-red-600">Contactar al paciente para nueva prescripción</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Próximo control</h3>
            </div>
            <p className="text-sm text-blue-700">Fecha programada: 20/10/2024</p>
            <p className="text-sm text-blue-600">Recordatorio enviado al paciente</p>
          </div>
        </div>
      </div>
    </div>
  )
}
