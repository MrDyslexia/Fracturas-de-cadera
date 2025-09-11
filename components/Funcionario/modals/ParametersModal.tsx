"use client"
import { X, Activity } from "lucide-react"
import { ModalProps } from "@/types/interfaces"

export default function ParametersModal({ isOpen, onClose }: Readonly<ModalProps>) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Parámetros Vitales</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">Configuración y monitoreo de parámetros vitales del paciente</p>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Presión Arterial</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  placeholder="Sistólica"
                  className="px-3 py-2 border border-gray-300 rounded-md w-24"
                />
                <span>/</span>
                <input
                  type="number"
                  placeholder="Diastólica"
                  className="px-3 py-2 border border-gray-300 rounded-md w-24"
                />
                <span className="text-sm text-gray-500">mmHg</span>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Frecuencia Cardíaca</h3>
              <div className="flex items-center space-x-4">
                <input type="number" placeholder="BPM" className="px-3 py-2 border border-gray-300 rounded-md w-24" />
                <span className="text-sm text-gray-500">latidos por minuto</span>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Temperatura</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  className="px-3 py-2 border border-gray-300 rounded-md w-24"
                />
                <span className="text-sm text-gray-500">°C</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Cancelar
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Guardar Parámetros
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
