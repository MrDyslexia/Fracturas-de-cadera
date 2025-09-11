"use client"
import { X, FileText, Calendar } from "lucide-react"
import { ModalProps } from "@/types/interfaces"
export default function HistoryModal({ isOpen, onClose }: Readonly<ModalProps>) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Historial de Diagnósticos</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">15/08/2024</span>
            </div>
            <h3 className="font-medium text-gray-800">Consulta General</h3>
            <p className="text-sm text-gray-600">Dolor de cabeza recurrente - Prescripción de analgésicos</p>
            <p className="text-xs text-gray-500 mt-1">Dr. Carlos Mendoza</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 rounded-r-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">10/07/2024</span>
            </div>
            <h3 className="font-medium text-gray-800">Control de Seguimiento</h3>
            <p className="text-sm text-gray-600">Seguimiento de tratamiento - Evolución favorable</p>
            <p className="text-xs text-gray-500 mt-1">Dr. Ana López</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50 rounded-r-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">22/05/2024</span>
            </div>
            <h3 className="font-medium text-gray-800">Examen Preventivo</h3>
            <p className="text-sm text-gray-600">Chequeo general anual - Todos los parámetros normales</p>
            <p className="text-xs text-gray-500 mt-1">Dr. Carlos Mendoza</p>
          </div>
        </div>
      </div>
    </div>
  )
}
