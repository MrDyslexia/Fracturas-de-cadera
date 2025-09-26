"use client";

import type React from "react";

import RoleGuard from "@/components/RoleGuard";
import ExamFormFrame from "@/components/Tecnologo/ExamFormFrame";
import { useState } from "react";
import { Upload, FileText, X, Plus } from "lucide-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState<"manual" | "archivo">("manual");
  const [manualRows, setManualRows] = useState([
    { id: 1, parametro: "", valor: "", unidad: "" },
  ]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addManualRow = () => {
    const newId = Math.max(...manualRows.map((row) => row.id)) + 1;
    setManualRows([
      ...manualRows,
      { id: newId, parametro: "", valor: "", unidad: "" },
    ]);
  };

  const removeManualRow = (id: number) => {
    if (manualRows.length > 1) {
      setManualRows(manualRows.filter((row) => row.id !== id));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (
        file.type === "application/pdf" ||
        file.type === "text/plain" ||
        file.type === "application/json"
      ) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <RoleGuard allow={["tecnologo"]}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Subir examen de laboratorio{" "}
        </h1>
        <p className="text-slate-600 mt-2">
          Gestión completa de resultados de laboratorio
        </p>
      </div>
      <ExamFormFrame>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "manual"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Ingreso Manual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("archivo")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "archivo"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Subir Archivo
          </button>
        </div>
        {activeTab === "manual" && (
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-700">Tipo de examen</span>
                <select
                  name="tipo_examen"
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="LABORATORIO">Laboratorio</option>
                  <option value="Hematología">Hematología</option>
                  <option value="Química">Química</option>
                  <option value="Hormonas">Hormonas</option>
                  <option value="Vitaminas">Vitaminas</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-700">Tipo de muestra</span>
                <select
                  name="tipo_muestra"
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="SANGRE">Sangre</option>
                  <option value="ORINA">Orina</option>
                  <option value="SUERO">Suero</option>
                  <option value="PLASMA">Plasma</option>
                  <option value="OTRO">Otro</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-700">
                  Fecha/hora de recepción
                </span>
                <input
                  name="fecha_recepcion"
                  type="datetime-local"
                  className="border rounded-lg px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-700">
                  Fecha/hora de extracción
                </span>
                <input
                  name="fecha_recepcion"
                  type="datetime-local"
                  className="border rounded-lg px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-700">Validador</span>
                <input
                  name="validado_por"
                  placeholder="Nombre del tecnólogo"
                  className="border rounded-lg px-3 py-2"
                />
              </label>
            </div>
            <div className="text-sm text-slate-600 mb-2">
              Ingrese los resultados manualmente:
            </div>
            <div className="space-y-3">
              {manualRows.map((row, index) => (
                <div key={row.id} className="flex items-center gap-2">
                  <div className="grid gap-2 sm:grid-cols-3 flex-1">
                    <select
                      name={`resultado_${row.id}_parametro`}
                      className="border rounded-lg px-3 py-2"
                      defaultValue={row.parametro}
                    >
                      <option value="">Seleccionar parámetro</option>
                      <option value="SANGRE">Sangre (mg/dL)</option>
                      <option value="ORINA">Orina</option>
                      <option value="SUERO">Suero</option>
                      <option value="PLASMA">Plasma</option>
                      <option value="OTRO">Otro</option>
                    </select>
                    <input
                      name={`resultado_${row.id}_valor`}
                      placeholder="Resultado (p. ej. 95)"
                      className="border rounded-lg px-3 py-2"
                      defaultValue={row.valor}
                    />
                    <input
                      name={`resultado_${row.id}_unidad`}
                      placeholder="Unidad (mg/dL)"
                      className="border rounded-lg px-3 py-2"
                      defaultValue={row.unidad}
                    />
                  </div>
                  {manualRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeManualRow(row.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Eliminar fila"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addManualRow}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
              >
                <Plus className="w-4 h-4" />
                Agregar fila
              </button>
            </div>

            <div className="mt-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-700">Observaciones</span>
                <textarea
                  name="observaciones"
                  rows={3}
                  className="border rounded-lg px-3 py-2"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === "archivo" && (
          <div>
            <div className="text-sm text-slate-600 mb-2">
              Suba un archivo con los resultados:
            </div>

            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-blue-400 bg-blue-50"
                  : selectedFile
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.txt,.json"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                name="archivo"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        {selectedFile.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remover archivo"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    Archivo seleccionado correctamente
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Upload
                    className={`w-12 h-12 ${
                      isDragOver ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      {isDragOver
                        ? "Suelte el archivo aquí"
                        : "Arrastra y suelta tu archivo"}
                    </p>
                    <p className="text-sm text-gray-500">
                      o{" "}
                      <span className="text-blue-600 font-medium">
                        haz clic para seleccionar
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span>PDF, TXT, JSON • Máximo 10MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </ExamFormFrame>
    </RoleGuard>
  );
}
