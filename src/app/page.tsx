'use client'

import Image from "next/image";
import { useState } from "react";
import { FiLogIn } from "react-icons/fi";

export default function LoginPage() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`RUT: ${rut} - Contraseña: ${password}`);
  };

  return (
    <div className="flex h-screen">
      {/* Imagen lado izquierdo con texto encima */}
      <div className="relative w-1/2 h-full">
        <img
          src="/hospital-real.jpg"
          alt="Hospital"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 flex flex-col justify-center px-12 z-10">
        </div>
      </div>


      {/* Panel de login */}
      <div className="w-1/2 bg-gradient-to-b from-blue-100 to-blue-400 flex flex-col justify-center px-16">
        <p className="text-sm text-blue-900 mb-4">
          ¿Tienes problemas para ingresar?{" "}
          <span className="font-bold">
            Revisa tu RUT y contraseña o contáctanos
          </span>
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-blue-900">RUT</label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              className="w-full px-3 py-2 rounded border border-blue-300"
              placeholder="12.345.678-9"
              required
            />
          </div>
          <div>
            <label className="text-sm text-blue-900">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded border border-blue-300"
              placeholder="********"
              required
            />
          </div>

          <div className="text-right text-sm text-blue-900">
            ¿Olvidaste Tu Contraseña?
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded"
          >
            <FiLogIn />
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
