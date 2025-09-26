"use client"

import type React from "react"

import RoleGuard from "@/components/RoleGuard"
import ExamFormFrame from "@/components/Tecnologo/ExamFormFrame"
import { useState } from "react"
import { Upload, FileText, X, ImageIcon, FileImage } from "lucide-react"

export default function Page() {
  const [isDragOverImages, setIsDragOverImages] = useState(false)
  const [isDragOverPdf, setIsDragOverPdf] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)

  const handleDragOverImages = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverImages(true)
  }

  const handleDragLeaveImages = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverImages(false)
  }

  const handleDropImages = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverImages(false)

    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter((file) => file.type.startsWith("image/") || file.name.endsWith(".dcm"))
    setSelectedImages((prev) => [...prev, ...validFiles])
  }

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles = Array.from(files).filter(
        (file) => file.type.startsWith("image/") || file.name.endsWith(".dcm"),
      )
      setSelectedImages((prev) => [...prev, ...validFiles])
    }
  }

  const handleDragOverPdf = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverPdf(true)
  }

  const handleDragLeavePdf = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverPdf(false)
  }

  const handleDropPdf = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverPdf(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === "application/pdf") {
        setSelectedPdf(file)
      }
    }
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedPdf(files[0])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removePdf = () => {
    setSelectedPdf(null)
  }

  return (
    <RoleGuard allow={["tecnologo"]}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Subir imagenes de diagnósticos </h1>
        <p className="text-slate-600 mt-2">Gestión completa de resultados de laboratorio</p>
      </div>
      <ExamFormFrame>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Tipo de estudio</span>
            <select name="tipo_estudio" className="border rounded-lg px-3 py-2">
              <option value="Rayos X">Rayos X</option>
              <option value="Ecografía">Ecografía</option>
              <option value="TAC">TAC</option>
              <option value="RM">Resonancia Magnética</option>
              <option value="Otro">Otro</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Región anatómica</span>
            <input name="region" placeholder="p. ej. Cadera derecha" className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Fecha del estudio</span>
            <input name="fecha" type="datetime-local" className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Informe (resumen)</span>
            <input name="informe" placeholder="Descripción breve" className="border rounded-lg px-3 py-2" />
          </label>
        </div>

        <div className="mt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Images Upload Zone */}
            <div className="flex-1 space-y-2">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Adjuntar imágenes
              </span>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragOverImages
                    ? "border-blue-400 bg-blue-50 scale-105"
                    : selectedImages.length > 0
                      ? "border-green-400 bg-green-50"
                      : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
                }`}
                onDragOver={handleDragOverImages}
                onDragLeave={handleDragLeaveImages}
                onDrop={handleDropImages}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,.dcm"
                  onChange={handleImagesSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  name="imagenes"
                />

                {selectedImages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedImages.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-200 shadow-sm"
                        >
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileImage className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate">{file.name}</div>
                            <div className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-all"
                            title="Remover imagen"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-green-600 font-medium">
                      {selectedImages.length} imagen{selectedImages.length !== 1 ? "es" : ""} seleccionada
                      {selectedImages.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${isDragOverImages ? "bg-blue-100" : "bg-slate-100"} transition-colors`}
                    >
                      <Upload className={`w-8 h-8 ${isDragOverImages ? "text-blue-500" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-1">
                        {isDragOverImages ? "Suelte las imágenes aquí" : "Arrastra y suelta tus imágenes"}
                      </p>
                      <p className="text-sm text-slate-500">
                        o{" "}
                        <span className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer">
                          haz clic para seleccionar
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <FileImage className="w-3 h-3" />
                      <span>JPG, PNG, DICOM (.dcm)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PDF Upload Zone */}
            <div className="flex-1 space-y-2">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Adjuntar informe (PDF opcional)
              </span>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragOverPdf
                    ? "border-blue-400 bg-blue-50 scale-105"
                    : selectedPdf
                      ? "border-green-400 bg-green-50"
                      : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
                }`}
                onDragOver={handleDragOverPdf}
                onDragLeave={handleDragLeavePdf}
                onDrop={handleDropPdf}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  name="informe_pdf"
                />

                {selectedPdf ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-green-200 shadow-sm">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-slate-900">{selectedPdf.name}</div>
                        <div className="text-sm text-slate-500">{(selectedPdf.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button
                        type="button"
                        onClick={removePdf}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Remover archivo"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-green-600 font-medium">Informe PDF seleccionado</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${isDragOverPdf ? "bg-blue-100" : "bg-slate-100"} transition-colors`}
                    >
                      <Upload className={`w-8 h-8 ${isDragOverPdf ? "text-blue-500" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-1">
                        {isDragOverPdf ? "Suelte el PDF aquí" : "Arrastra y suelta tu PDF"}
                      </p>
                      <p className="text-sm text-slate-500">
                        o{" "}
                        <span className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer">
                          haz clic para seleccionar
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <FileText className="w-3 h-3" />
                      <span>Solo archivos PDF</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ExamFormFrame>
    </RoleGuard>
  )
}
