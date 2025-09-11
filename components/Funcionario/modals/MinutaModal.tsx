"use client"
import { X } from "lucide-react"
import { ModalProps } from "@/types/interfaces"
export default function MinutaModal({ isOpen, onClose }: Readonly<ModalProps>) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generar Minuta</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de consulta</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnóstico</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Generar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
