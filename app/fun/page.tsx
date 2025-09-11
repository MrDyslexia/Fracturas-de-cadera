"use client";
import { useState } from "react";
import {
  Droplets,
  Activity,
  FileText,
  AlertTriangle,
  User,
  Ruler,
  Weight,
} from "lucide-react";
import MinutaModal from "@/components/Funcionario/modals/MinutaModal";
import BloodModal from "@/components/Funcionario/modals/BloodModal";
import ParametersModal from "@/components/Funcionario/modals/ParametersModal";
import HistoryModal from "@/components/Funcionario/modals/HistoryModal";
import AlertsModal from "@/components/Funcionario/modals/AlertsModal";
import RoleGuard from "@/components/RoleGuard";
export default function FuncionarioHome() {
  const [selectedPatient] = useState({
    nombre: "María González Pérez",
    rut: "12.345.678-9",
    fechaNacimiento: "15/03/1979",
    edad: { años: 45, meses: 7 },
    sexo: "Femenino",
    tipoSangre: "O+",
    altura: 165,
    peso: 68,
  });
  const [showMinutaModal, setShowMinutaModal] = useState(false);
  const [showBloodModal, setShowBloodModal] = useState(false);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  return (
    <RoleGuard allow={["funcionario"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                  {selectedPatient.nombre}
                </h1>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800">{selectedPatient.rut}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800">
                      {selectedPatient.fechaNacimiento}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800">
                      {selectedPatient.edad.años} años{" "}
                      {selectedPatient.edad.meses} meses
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">

                    <span className="text-gray-800">
                      {selectedPatient.sexo}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-red-600">
                      {selectedPatient.tipoSangre}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowMinutaModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>Generar Minuta</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Bloque izquierdo - Figura humana con altura y peso */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Datos Físicos
            </h2>
            <div className="grid grid-cols-3 gap-4 items-start">
              {/* Altura a la izquierda */}
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <Ruler className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xs font-medium text-blue-800 mb-1">
                    Altura
                  </div>
                  <div className="font-semibold text-blue-800">
                    {selectedPatient.altura} cm
                  </div>
                </div>
              </div>

              {/* Imagen del humano al centro con peso debajo */}
              <div className="flex flex-col items-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1BNespmUlaZAEjDWxZ5jPQDAJYW5XU.png"
                  alt="Figura humana anatómica"
                  className="w-20 h-auto drop-shadow-sm mb-3"
                />
                {/* Peso debajo de la imagen */}
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <Weight className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xs font-medium text-green-800 mb-1">
                    Peso
                  </div>
                  <div className="font-semibold text-green-800">
                    {selectedPatient.peso} kg
                  </div>
                </div>
              </div>

              {/* IMC a la derecha */}
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-xs font-medium text-purple-800 mb-1">
                    IMC
                  </div>
                  <div className="font-semibold text-purple-800">
                    {(
                      selectedPatient.peso /
                      Math.pow(selectedPatient.altura / 100, 2)
                    ).toFixed(1)}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">Normal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bloque derecho - 4 botones con iconos */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Médicas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Botón 1: Información de sangre */}
              <button
                onClick={() => setShowBloodModal(true)}
                className="p-6 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <Droplets className="w-12 h-12 text-red-600 group-hover:text-red-700" />
                  <span className="font-medium text-gray-900">
                    Análisis de Sangre
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    Ver resultados y parámetros sanguíneos
                  </span>
                </div>
              </button>

              {/* Botón 2: Parámetros */}
              <button
                onClick={() => setShowParametersModal(true)}
                className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <Activity className="w-12 h-12 text-blue-600 group-hover:text-blue-700" />
                  <span className="font-medium text-gray-900">
                    Parámetros Vitales
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    Monitoreo de signos vitales
                  </span>
                </div>
              </button>

              {/* Botón 3: Historial de diagnósticos */}
              <button
                onClick={() => setShowHistoryModal(true)}
                className="p-6 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <FileText className="w-12 h-12 text-green-600 group-hover:text-green-700" />
                  <span className="font-medium text-gray-900">
                    Historial Médico
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    Diagnósticos y tratamientos previos
                  </span>
                </div>
              </button>

              {/* Botón 4: Alertas */}
              <button
                onClick={() => setShowAlertsModal(true)}
                className="p-6 border-2 border-yellow-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <AlertTriangle className="w-12 h-12 text-yellow-600 group-hover:text-yellow-700" />
                  <span className="font-medium text-gray-900">
                    Alertas Médicas
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    Avisos y parámetros críticos
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* TDC (Dx→Cx) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">5.2</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                TDC (Dx→Cx)
              </div>
              <div className="text-xs text-gray-500">días</div>
            </div>
          </div>

          {/* TPO (Cx→Alta) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">3.8</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                TPO (Cx→Alta)
              </div>
              <div className="text-xs text-gray-500">días</div>
            </div>
          </div>

          {/* TTH (Dx→Alta) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">9.0</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                TTH (Dx→Alta)
              </div>
              <div className="text-xs text-gray-500">días</div>
            </div>
          </div>

          {/* Dx actual */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600 mb-1">
                C78.9
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Dx actual
              </div>
              <div className="text-xs text-gray-500">Metástasis</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Evolución de Parámetros Sanguíneos por Año
          </h2>
          <div className="h-80 border border-gray-200 rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid */}
              <defs>
                <pattern
                  id="grid"
                  width="80"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 80 0 L 0 0 0 30"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Ejes */}
              <line
                x1="60"
                y1="250"
                x2="740"
                y2="250"
                stroke="#374151"
                strokeWidth="2"
              />
              <line
                x1="60"
                y1="250"
                x2="60"
                y2="50"
                stroke="#374151"
                strokeWidth="2"
              />

              {/* Línea de hemoglobina */}
              <polyline
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                points="100,200 180,190 260,185 340,180 420,175 500,170 580,165 660,160 740,155"
              />

              {/* Línea de glucosa */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                points="100,220 180,210 260,205 340,200 420,195 500,190 580,185 660,180 740,175"
              />

              {/* Puntos de datos */}
              {[100, 180, 260, 340, 420, 500, 580, 660, 740].map((x, i) => (
                <g key={x}>
                  <circle cx={x} cy={200 - i * 5} r="4" fill="#dc2626" />
                  <circle cx={x} cy={220 - i * 5} r="4" fill="#2563eb" />
                </g>
              ))}

              {/* Etiquetas de años */}
              {[
                "2016",
                "2017",
                "2018",
                "2019",
                "2020",
                "2021",
                "2022",
                "2023",
                "2024",
              ].map((year, i) => (
                <text
                  key={year}
                  x={100 + i * 80}
                  y={270}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {year}
                </text>
              ))}

              {/* Leyenda */}
              <g transform="translate(600, 80)">
                <rect
                  x="0"
                  y="0"
                  width="120"
                  height="60"
                  fill="white"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  rx="4"
                />
                <line
                  x1="10"
                  y1="20"
                  x2="30"
                  y2="20"
                  stroke="#dc2626"
                  strokeWidth="3"
                />
                <text x="35" y="24" className="text-xs fill-gray-700">
                  Hemoglobina
                </text>
                <line
                  x1="10"
                  y1="40"
                  x2="30"
                  y2="40"
                  stroke="#2563eb"
                  strokeWidth="3"
                />
                <text x="35" y="44" className="text-xs fill-gray-700">
                  Glucosa
                </text>
              </g>
            </svg>
          </div>
        </div>

        <MinutaModal
          isOpen={showMinutaModal}
          onClose={() => setShowMinutaModal(false)}
        />
        <BloodModal
          isOpen={showBloodModal}
          onClose={() => setShowBloodModal(false)}
        />
        <ParametersModal
          isOpen={showParametersModal}
          onClose={() => setShowParametersModal(false)}
        />
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
        <AlertsModal
          isOpen={showAlertsModal}
          onClose={() => setShowAlertsModal(false)}
        />
      </div>
    </RoleGuard>
  );
}
