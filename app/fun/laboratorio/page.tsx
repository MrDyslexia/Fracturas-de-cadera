"use client"

import type React from "react"
import { useState } from "react"
import { FlaskConical, Droplet, TestTube, Bone } from "lucide-react"

const InfoBox = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
    <div className="text-blue-600">{icon}</div>
    <div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  </div>
)

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <div className="h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">
    {children}
  </div>
)

const LaboratorioPage: React.FC = () => {
  const [labs] = useState({
    hb: 12.5,
    albumina: 3.8,
    vitD: 25.2,
  })

  return (
    <div className="p-6">
      <div className="grid gap-6">
        <div className="bg-white rounded-lg border shadow-sm">
          {/* Card Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
            <FlaskConical className="h-5 w-5 text-slate-700" />
            <div>
              <h2 className="font-semibold text-gray-900">Laboratorio</h2>
              <p className="text-sm text-gray-600">Resultados actuales y series temporales</p>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4">
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <InfoBox icon={<Droplet className="h-4 w-4" />} label="Hb" value={`${labs.hb} g/dL`} />
              <InfoBox icon={<TestTube className="h-4 w-4" />} label="Albúmina" value={`${labs.albumina} g/dL`} />
              <InfoBox icon={<Bone className="h-4 w-4" />} label="Vitamina D" value={`${labs.vitD} ng/mL`} />
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <Placeholder>Longitudinal (Hb/Alb/Vit D)</Placeholder>
              <Placeholder>Rango de normalidad</Placeholder>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LaboratorioPage
