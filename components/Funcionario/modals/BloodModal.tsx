"use client"
import { X, Droplets } from "lucide-react"
import {ModalProps} from '@/types/interfaces';

export default function BloodModal({ isOpen, onClose }: Readonly<ModalProps>) {
  if (!isOpen) return null

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
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800">Hemoglobina</h3>
              <p className="text-2xl font-bold text-red-600">14.2 g/dL</p>
              <p className="text-sm text-red-600">Normal (12-16 g/dL)</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800">Glucosa</h3>
              <p className="text-2xl font-bold text-blue-600">95 mg/dL</p>
              <p className="text-sm text-blue-600">Normal (70-100 mg/dL)</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800">Colesterol Total</h3>
              <p className="text-2xl font-bold text-green-600">180 mg/dL</p>
              <p className="text-sm text-green-600">Normal (&lt;200 mg/dL)</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-800">Triglicéridos</h3>
              <p className="text-2xl font-bold text-purple-600">120 mg/dL</p>
              <p className="text-sm text-purple-600">Normal (&lt;150 mg/dL)</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Historial de Resultados</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Última actualización</span>
                <span className="text-sm font-medium">15/09/2024</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Próximo control</span>
                <span className="text-sm font-medium">15/12/2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
