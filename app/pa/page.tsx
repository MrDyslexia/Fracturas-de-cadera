"use client";
import { useState } from "react";
import type React from "react";
import {
  ChevronDown,
  Download,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react";
import { usePatient } from "../../contexts/PatientContext";

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4">{children}</div>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pb-6">{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}

function CardHeaderWithIcon({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">{icon}</div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

function Button({
  children,
  onClick,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "secondary" | "ghost";
  className?: string;
}) {
  const baseClasses =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

const PacientePage = () => {
  const { paciente, examenes, loading } = usePatient();
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());
  const [filtros, setFiltros] = useState({
    tipoMuestra: "",
    tipoExamen: "",
    busqueda: "",
  });

  const StatusBadge = ({ estado }: { estado: string }) => {
    const getStatusConfig = (estado: string) => {
      switch (estado) {
        case "completado":
          return {
            icon: CheckCircle,
            color: "bg-green-600 text-white",
            label: "Completado",
          };
        case "procesando":
          return {
            icon: Clock,
            color: "bg-blue-600 text-white",
            label: "Procesando",
          };
        case "pendiente":
          return {
            icon: AlertCircle,
            color: "bg-gray-500 text-white",
            label: "Pendiente",
          };
        case "validado":
          return {
            icon: CheckCircle,
            color: "bg-green-600 text-white",
            label: "Validado",
          };
        default:
          return {
            icon: AlertCircle,
            color: "bg-gray-500 text-white",
            label: "Desconocido",
          };
      }
    };

    const { icon: Icon, color, label } = getStatusConfig(estado);
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}
      >
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  // Determinar el estado del examen basado en los resultados
  const determinarEstado = (examen: any) => {
    if (!examen.muestra || examen.muestra.length === 0) {
      return "pendiente";
    }
    
    const tieneResultados = examen.muestra.some((muestra: any) => 
      muestra.resultados && muestra.resultados.length > 0
    );
    
    return tieneResultados ? "completado" : "procesando";
  };

  // Obtener opciones para los filtros
  const optsTipoMuestra = [
    "",
    ...new Set(
      examenes?.flatMap(examen => 
        examen.muestras?.map(muestra => muestra.tipo_muestra) || []
      ) || []
    ),
  ];

  const optsTipoExamen = [
    "",
    ...new Set(examenes?.map(examen => examen.tipo_examen) || []),
  ];

  // Filtrar exámenes
  const examenesFiltrados = examenes?.filter((examen) => {
    const cumpleTipoExamen = !filtros.tipoExamen || examen.tipo_examen === filtros.tipoExamen;
    
    const cumpleTipoMuestra = !filtros.tipoMuestra || 
      examen.muestras?.some(muestra => muestra.tipo_muestra === filtros.tipoMuestra);
    
    const cumpleBusqueda = !filtros.busqueda ||
      examen.examen_id.toString().includes(filtros.busqueda) ||
      examen.tipo_examen.toLowerCase().includes(filtros.busqueda.toLowerCase());

    return cumpleTipoExamen && cumpleTipoMuestra && cumpleBusqueda;
  }) || [];

  const toggle = (examenId: string) => {
    const nuevas = new Set(abiertas);
    if (nuevas.has(examenId)) {
      nuevas.delete(examenId);
    } else {
      nuevas.add(examenId);
    }
    setAbiertas(nuevas);
  };

  const descargarExamenCompleto = (examen: any) => {
    console.log("Descargando examen completo:", examen.examen_id);
    const fetchPacientes = async () => {
      try {
        const user = localStorage.getItem("session_v1");
        const token = user ? JSON.parse(user).token : null;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/examenes/${examen.examen_id}/muestras`,
          {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
          }
        );
        if (!response.ok) {
          throw new Error("Error fetching descarga de examen");
        }
      } catch (error) {
        console.error("Failed to fetch pacientes:", error);
      }
    };
    fetchPacientes();
  };

  const descargarResultado = (resultado: any) => {
    console.log("Descargando resultado:", resultado.resultado_id);
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando exámenes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Exámenes de Laboratorio
        </h1>
        <p className="text-slate-600 mt-2">
          Gestión completa de resultados de laboratorio
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                {paciente?.nombre || "Paciente"}
              </h1>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800">
                    {paciente?.rut
                      ? paciente.rut.replace(
                          /^(\d{1,2})(\d{3})(\d{3})([0-9kK])$/,
                          "$1.$2.$3-$4"
                        )
                      : "—"}
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800">
                    {paciente?.fecha_nacimiento || "—"}
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800">
                    {paciente?.edad_anios || 0} años{" "}
                    {paciente?.edad_meses || 0} meses
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-red-600">
                    {paciente?.tipo_sangre || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeaderWithIcon
            icon={<Filter className="h-5 w-5" />}
            title="Filtros y Búsqueda"
            subtitle="Encuentra exámenes específicos"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID o tipo..."
                  value={filtros.busqueda}
                  onChange={(e) =>
                    setFiltros({ ...filtros, busqueda: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filtros.tipoExamen}
                onChange={(e) =>
                  setFiltros({ ...filtros, tipoExamen: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tipo de examen</option>
                {optsTipoExamen.slice(1).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                value={filtros.tipoMuestra}
                onChange={(e) =>
                  setFiltros({ ...filtros, tipoMuestra: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tipo de muestra</option>
                {optsTipoMuestra.slice(1).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeaderWithIcon
            icon={<Calendar className="h-5 w-5" />}
            title={`Exámenes de Laboratorio (${examenesFiltrados.length})`}
            subtitle="Lista expandible de exámenes"
          />
          <CardContent>
            <div className="space-y-4">
              {examenesFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron exámenes
                </div>
              ) : (
                examenesFiltrados.map((examen) => {
                  const examenId = examen.examen_id.toString();
                  const abierto = abiertas.has(examenId);
                  const estado = determinarEstado(examen);
                  const totalMuestras = examen.muestras?.length || 0;
                  const totalResultados = examen.muestras?.reduce((total, muestra) => 
                    total + (muestra.Resultados?.length || 0), 0) || 0;

                  return (
                    <div
                      key={examenId}
                      className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => toggle(examenId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <div className="font-semibold text-gray-900">
                                Examen #{examen.examen_id} - {examen.tipo_examen}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {totalMuestras > 0 && examen.muestras?.[0]?.fecha_recepcion 
                                  ? formatearFecha(examen.muestras[0].fecha_recepcion)
                                  : "Sin fecha"}
                              </div>
                            </div>
                            <div className="hidden md:flex flex-col gap-1">
                              <div className="text-sm font-medium">
                                {totalMuestras} muestra(s)
                              </div>
                              <div className="text-xs text-gray-600">
                                {totalResultados} resultado(s)
                              </div>
                            </div>
                            <StatusBadge estado={estado} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              {totalMuestras} muestra(s)
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                abierto ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {abierto && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">
                              Muestras y Resultados
                            </h4>
                            <Button onClick={() => descargarExamenCompleto(examen)}>
                              <Download className="h-4 w-4" />
                              Descargar todo
                            </Button>
                          </div>
                          <div className="space-y-4">
                            {examen.muestras?.map((muestra, index) => (
                              <div key={muestra.muestra_id} className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="font-medium text-gray-900 mb-2">
                                  Muestra #{muestra.muestra_id} - {muestra.tipo_muestra}
                                </div>
                                <div className="text-sm text-gray-600 mb-3">
                                  Extracción: {muestra.fecha_extraccion ? formatearFecha(muestra.fecha_extraccion) : "—"} | 
                                  Recepción: {formatearFecha(muestra.fecha_recepcion)}
                                  {muestra.observaciones && ` | ${muestra.observaciones}`}
                                </div>

                                {muestra.Resultados && muestra.Resultados.length > 0 ? (
                                  <div className="space-y-2">
                                    {muestra.Resultados.map((resultado) => (
                                      <div key={resultado.resultado_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center gap-4">
                                          <div className="flex flex-col">
                                            <div className="font-medium text-gray-900">
                                              {resultado.parametro}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              Valor: {resultado.valor} {resultado.unidad || ""}
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {formatearFecha(resultado.fecha_resultado)}
                                          </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          onClick={() => descargarResultado(resultado)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-2 text-gray-500 text-sm">
                                    No hay resultados disponibles para esta muestra
                                  </div>
                                )}
                              </div>
                            )) || (
                              <div className="text-center py-4 text-gray-500">
                                No hay muestras para este examen
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PacientePage;