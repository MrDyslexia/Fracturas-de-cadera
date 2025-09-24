"use client";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

export type PacienteHeader = {
  user_id: number;
  rut: string;
  nombre: string;
  fecha_nacimiento?: string;
  tipo_sangre?: string | null;
  edad?: number | null;
  edad_anios?: number | null;
  edad_meses?: number | null;
};
export type Muestra={
  muestra_id: string | number;
  tipo_muestra: string;
  fecha_recepcion: string;
  fecha_extraccion: string | null;
  observaciones: string | null;
  examen_id: string | number;
  profesional_id: string | number;
  Resultados: Resultados[];
}
export type Resultados={
  resultado_id: string | number;
  episodio_id: string| number;
  muestra_id: string | number;
  examen_id: string | number;
  parametro: string;
  valor: string;
  unidad: string | null;
  fecha_resultado: string;
}
export type Examen = {
  examen_id: string | number;
  tipo_examen: string;
  paciente_id: number | string;
  profesional_id: number | string;
  resultados_sin_muestra: string[];
  muestras: Muestra[];
};

type PatientContextType = {
  loading: boolean;
  error?: string | null;
  paciente?: PacienteHeader | null;
  examenes?: Examen[] | null;
  refresh: () => Promise<void>;
};

const PatientContext = createContext<PatientContextType>({
  loading: true,
  error: null,
  refresh: async () => {},
});

export const usePatient = () => useContext(PatientContext);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const data = localStorage.getItem("session_v1");
  const user = data ? JSON.parse(data).user : null;
  const token = data ? JSON.parse(data).token : null;
  const router = useRouter();
  const [paciente, setPaciente] = useState<PacienteHeader | null>(null);
  const [examenes, setExamenes] = useState<Examen[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetch_paciente = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError("No hay usuario autenticado");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/pacientes/${user.id}/datos`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.status === 401) {
        //logout();
        router.push("/login");
        console.error(
          "No autorizado: sesión expirada o credenciales inválidas."
        );
        return;
      }
      if (!response.ok) {
        throw new Error("Error fetching pacientes");
      }
      const data = await response.json();
      setPaciente(data);
      setLoading(false);
      //setPacientes(data);
    } catch (error) {
      console.error("Failed to fetch pacientes:", error);
      setLoading(false);
    }
  }, []);
  const fetch_examenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError("No hay usuario autenticado");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/examenes/paciente/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.status === 401) {
        //logout();
        router.push("/login");
        console.error(
          "No autorizado: sesión expirada o credenciales inválidas."
        );
        return;
      }
      if (!response.ok) {
        throw new Error("Error fetching pacientes");
      }
      const data = await response.json();
      setExamenes(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch pacientes:", error);
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetch_paciente();
    fetch_examenes();
  }, [fetch_paciente, fetch_examenes]);

  return (
    <PatientContext.Provider
      value={{ loading, error, paciente, examenes, refresh: fetch_examenes}}
    >
      {children}
    </PatientContext.Provider>
  );
};
