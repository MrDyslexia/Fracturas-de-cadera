"use client";
import { useState, useEffect, useRef } from "react";
import {
  Droplets,
  Activity,
  FileText,
  AlertTriangle,
  User,
  Ruler,
  Weight,
  UserSearch,
  TrendingUp,
} from "lucide-react";
// import MinutaModal from "@/components/Funcionario/modals/MinutaModal";
import BloodModal from "@/components/Funcionario/modals/BloodModal";
import ParametersModal from "@/components/Funcionario/modals/ParametersModal";
import HistoryModal from "@/components/Funcionario/modals/HistoryModal";
import IndicatorsModal from "@/components/Funcionario/modals/IndicatorsModal";
import AlertsModal from "@/components/Funcionario/modals/AlertsModal";
import RoleGuard from "@/components/RoleGuard";
import Body from "@/components/Funcionario/body";
import { useFuncionario } from "@/contexts/FuncionarioContext";
import type { DetallesPaciente } from "@/types/interfaces";
import * as echarts from "echarts";
import { generarMinutaPDF } from "@/components/Funcionario/modals/MinutaModal";
import { useAuth } from "@/contexts/AuthContext";

export default function FuncionarioHome() {
  const { seleccionado, setSeleccionado } = useFuncionario() as {
    seleccionado: DetallesPaciente | undefined;
    setSeleccionado: (paciente: DetallesPaciente | undefined) => void;
  };
  // const [showMinutaModal, setShowMinutaModal] = useState(false);
  const [showBloodModal, setShowBloodModal] = useState(false);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Función para determinar la severidad máxima de las alertas activas
  const getMaxAlertSeverity = () => {
    if (!seleccionado?.general?.alertas_medicas?.length) return null;

    const activeAlerts = seleccionado.general.alertas_medicas.filter(
      (alerta) => alerta.activa
    );
    if (activeAlerts.length === 0) return null;

    const severityOrder = { ALTA: 3, MEDIA: 2, BAJA: 1 };

    const maxSeverity = activeAlerts.reduce((max, alerta) => {
      return severityOrder[alerta.severidad as keyof typeof severityOrder] >
        severityOrder[max as keyof typeof severityOrder]
        ? alerta.severidad
        : max;
    }, activeAlerts[0].severidad);

    return maxSeverity;
  };

  // Función para obtener los estilos según la severidad de alertas
  const getAlertButtonStyles = () => {
    const maxSeverity = getMaxAlertSeverity();

    switch (maxSeverity) {
      case "ALTA":
        return {
          border:
            "border-2 border-red-200 hover:border-red-300 hover:bg-red-50",
          icon: "text-red-600 group-hover:text-red-700",
        };
      case "MEDIA":
        return {
          border:
            "border-2 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50",
          icon: "text-yellow-600 group-hover:text-yellow-700",
        };
      case "BAJA":
        return {
          border:
            "border-2 border-green-200 hover:border-green-300 hover:bg-green-50",
          icon: "text-green-600 group-hover:text-green-700",
        };
      default:
        return {
          border:
            "border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          icon: "text-gray-600 group-hover:text-gray-700",
        };
    }
  };

  // Función para obtener los estilos según el nivel de indicadores
  const getIndicatorsButtonStyles = () => {
    const nivel = seleccionado?.indicadores?.nivel;

    switch (nivel) {
      case "ALTO":
        return {
          border:
            "border-2 border-red-200 hover:border-red-300 hover:bg-red-50",
          icon: "text-red-600 group-hover:text-red-700",
        };
      case "MEDIO":
        return {
          border:
            "border-2 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50",
          icon: "text-yellow-600 group-hover:text-yellow-700",
        };
      case "BAJO":
        return {
          border:
            "border-2 border-green-200 hover:border-green-300 hover:bg-green-50",
          icon: "text-green-600 group-hover:text-green-700",
        };
      default:
        return {
          border:
            "border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50",
          icon: "text-indigo-600 group-hover:text-indigo-700",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return "Bajo peso";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Sobrepeso";
    return "Obesidad";
  };

  const processLabData = () => {
    if (!seleccionado?.laboratorio?.solicitudes?.[0]?.muestras) return null;

    const muestras = seleccionado.laboratorio.solicitudes[0].muestras;
    const dates: string[] = [];
    const hemoglobina: number[] = [];
    const glucosa: number[] = [];
    const colesterol: number[] = [];
    const trigliceridos: number[] = [];

    // Sort samples by date
    const sortedMuestras = [...muestras].sort(
      (a, b) =>
        new Date(a.fecha_recepcion).getTime() -
        new Date(b.fecha_recepcion).getTime()
    );

    sortedMuestras.forEach((muestra) => {
      const date = new Date(muestra.fecha_recepcion).toLocaleDateString(
        "es-ES",
        {
          month: "short",
          day: "numeric",
        }
      );
      dates.push(date);

      muestra.resultados.forEach(
        (resultado: { parametro: any; valor: number }) => {
          switch (resultado.parametro) {
            case "HB":
              hemoglobina.push(resultado.valor);
              break;
            case "GLUCOSA":
              glucosa.push(resultado.valor);
              break;
            case "COLESTEROL_TOTAL":
              colesterol.push(resultado.valor);
              break;
            case "TRIGLICERIDOS":
              trigliceridos.push(resultado.valor);
              break;
          }
        }
      );
    });

    return { dates, hemoglobina, glucosa, colesterol, trigliceridos };
  };

  useEffect(() => {
    if (!chartRef.current || !seleccionado) return;

    // Initialize chart if not exists
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const labData = processLabData();
    if (!labData) return;

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            const unit = param.seriesName === "Hemoglobina" ? "g/dL" : "mg/dL";
            result += `${param.marker} ${param.seriesName}: ${param.value} ${unit}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ["Hemoglobina", "Glucosa", "Colesterol Total", "Triglicéridos"],
        top: 10,
      },
      grid: {
        left: "12%",
        right: "12%",
        bottom: "8%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labData.dates,
        axisLabel: {
          color: "#6B7280",
        },
      },
      yAxis: [
        {
          type: "value",
          name: "Hemoglobina (g/dL)",
          position: "left",
          axisLabel: {
            color: "#6B7280",
            formatter: "{value}",
          },
          nameTextStyle: {
            color: "#6B7280",
            fontSize: 12,
            padding: [0, 0, 0, 10],
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#F3F4F6",
            },
          },
        },
        {
          type: "value",
          name: "Otros parámetros (mg/dL)",
          position: "right",
          axisLabel: {
            color: "#6B7280",
            formatter: "{value}",
          },
          nameTextStyle: {
            color: "#6B7280",
            fontSize: 12,
            padding: [0, 10, 0, 0],
          },
        },
      ],
      series: [
        {
          name: "Hemoglobina",
          type: "line",
          yAxisIndex: 0,
          data: labData.hemoglobina,
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: "#DC2626",
          },
          itemStyle: {
            color: "#DC2626",
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(220, 38, 38, 0.3)",
                },
                {
                  offset: 1,
                  color: "rgba(220, 38, 38, 0.05)",
                },
              ],
            },
          },
        },
        {
          name: "Glucosa",
          type: "line",
          yAxisIndex: 1,
          data: labData.glucosa,
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: "#2563EB",
          },
          itemStyle: {
            color: "#2563EB",
          },
        },
        {
          name: "Colesterol Total",
          type: "line",
          yAxisIndex: 1,
          data: labData.colesterol,
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: "#059669",
          },
          itemStyle: {
            color: "#059669",
          },
        },
        {
          name: "Triglicéridos",
          type: "line",
          yAxisIndex: 1,
          data: labData.trigliceridos,
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: "#7C3AED",
          },
          itemStyle: {
            color: "#7C3AED",
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [seleccionado]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  if (!seleccionado) {
    return (
      <RoleGuard allow={["funcionario"]}>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No hay paciente seleccionado
            </h2>
            <p className="text-gray-600 mb-6">
              Selecciona un paciente para ver su información
            </p>
            <button
              onClick={() => setSeleccionado(undefined)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Seleccionar Paciente
            </button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  const alertStyles = getAlertButtonStyles();
  const indicatorsStyles = getIndicatorsButtonStyles();
  
  // quién está logueado (si no tienes user, igual funciona con fallbacks)
const { user } = useAuth() as any;

const onGenerarMinuta = async () => {
  if (!seleccionado) return;

  const autor = {
    nombre: user?.name || user?.nombre || user?.fullName || "Funcionario",
    cargo:  user?.cargo || user?.role || "Funcionario",
    rut:    user?.rut || undefined,
    unidad: user?.unidad || user?.department || undefined,
  };

  // si no usas modal para escribir texto, deja los bloques vacíos (o usa prompts)
  const blocks = {
    motivo: "",              // por ejemplo: window.prompt("Motivo de consulta") ?? ""
    diagnosticoLibre: "",    // si quieres sobreescribir el dx actual
    tratamiento: "",         // por ejemplo: window.prompt("Tratamiento") ?? ""
  };

  try {
    await generarMinutaPDF(seleccionado, autor, blocks, { maxExamenes: 5 });
  } catch (err) {
    console.error(err);
    alert("No se pudo generar la minuta.");
  }
};
 
  return (
    <RoleGuard allow={["funcionario"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Vista general del paciente
            </h1>
            <p className="text-slate-600 mt-2">
              Resumen rápido del estado y acciones médicas disponibles
            </p>
          </div>
          <button
            onClick={() => setSeleccionado(undefined)}
            className="px-4 py-2 bg-white text-blue-600 rounded-xl border-2 hover:bg-blue-700 hover:text-white transition-colors flex items-center space-x-2"
          >
            <UserSearch size={24} />
            <span>Seleccionar paciente</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                  {seleccionado.general.nombre}
                </h1>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800">
                      {seleccionado.general.rut}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800">
                      {formatDate(seleccionado.general.fecha_nacimiento)}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800">
                      {seleccionado.general.edad} años{" "}
                      {seleccionado.general.edad_meses} meses
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-red-600">
                      {seleccionado.general.tipo_sangre}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onGenerarMinuta}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-100 hover:text-blue-600 hover:border-2 border-2 border-blue-600 transition-colors flex items-center space-x-2"
            >
              <FileText size={24} />
              <span>Generar Minuta</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Left column - Medical Actions Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Médicas
            </h2>
            <div className="flex flex-col space-y-4">
              {/* Botón de Indicadores - CON COLOR DINÁMICO */}
              <button
                onClick={() => setShowIndicatorsModal(true)}
                className={`p-4 rounded-lg transition-colors group text-left ${indicatorsStyles.border}`}
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className={`w-8 h-8 ${indicatorsStyles.icon}`} />
                  <div>
                    <div className="font-medium text-gray-900">
                      Indicadores
                    </div>
                    <div className="text-sm text-gray-500">
                      Riesgo de refractura:{" "}
                      {seleccionado.indicadores?.suma}
                    </div>
                  </div>
                </div>
              </button>

              {/* Botón 1: Información de sangre */}
              <button
                onClick={() => setShowBloodModal(true)}
                className="p-4 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group text-left"
              >
                <div className="flex items-center space-x-3">
                  <Droplets className="w-8 h-8 text-red-600 group-hover:text-red-700" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Análisis de Sangre
                    </div>
                    <div className="text-sm text-gray-500">
                      Ver resultados y parámetros sanguíneos
                    </div>
                  </div>
                </div>
              </button>

              {/* Botón 2: Parámetros */}
              <button
                onClick={() => setShowParametersModal(true)}
                className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group text-left"
              >
                <div className="flex items-center space-x-3">
                  <Activity className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Parámetros Vitales
                    </div>
                    <div className="text-sm text-gray-500">
                      Monitoreo de signos vitales
                    </div>
                  </div>
                </div>
              </button>

              {/* Botón 3: Historial de diagnósticos */}
              <button
                onClick={() => setShowHistoryModal(true)}
                className="p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group text-left"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-green-600 group-hover:text-green-700" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Historial Médico
                    </div>
                    <div className="text-sm text-gray-500">
                      Diagnósticos y tratamientos previos
                    </div>
                  </div>
                </div>
              </button>

              {/* Botón 4: Alertas - CON COLOR DINÁMICO */}
              <button
                onClick={() => setShowAlertsModal(true)}
                className={`p-4 rounded-lg transition-colors group text-left ${alertStyles.border}`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`w-8 h-8 ${alertStyles.icon}`} />
                  <div>
                    <div className="font-medium text-gray-900">
                      Alertas Médicas
                    </div>
                    <div className="text-sm text-gray-500">
                      Avisos y parámetros críticos
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Resto del código permanece igual... */}
          {/* Right columns - Physical Data */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Datos Físicos del Paciente
            </h2>

            <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl p-8 border-2 border-blue-200/50 shadow-inner min-h-[400px]">
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <Body className="w-56 h-96 text-blue-300/30" />
              </div>

              <div className="relative z-10 h-[400px] flex flex-col justify-between items-start py-4">
                {/* Altura positioned at head level */}
                <div className="flex justify-center">
                  <div className="group bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200/60 transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    {/* Compact version - only value and unit */}
                    <div className="group-hover:hidden px-4 py-2">
                      <div className="text-lg font-bold text-blue-900">
                        {Math.round(seleccionado.general.altura? seleccionado.general.altura : 0)}cm
                      </div>
                    </div>
                    {/* Expanded version on hover */}
                    <div className="hidden group-hover:block px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Ruler className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                            Altura
                          </div>
                          <div className="text-xl font-bold text-blue-900">
                            {Math.round(seleccionado.general.altura? seleccionado.general.altura : 0)}
                          </div>
                          <div className="text-xs text-blue-600">
                            centímetros
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Peso positioned at torso level */}
                <div className="flex justify-start ">
                  <div className="group bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-green-200/60 transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    {/* Compact version - only value and unit */}
                    <div className="group-hover:hidden px-4 py-2">
                      <div className="text-lg font-bold text-green-900">
                        {seleccionado.general.peso? seleccionado.general.peso : 0}kg
                      </div>
                    </div>
                    {/* Expanded version on hover */}
                    <div className="hidden group-hover:block px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Weight className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-green-700 uppercase tracking-wide">
                            Peso
                          </div>
                          <div className="text-xl font-bold text-green-900">
                            {seleccionado.general.peso? seleccionado.general.peso : 0}
                          </div>
                          <div className="text-xs text-green-600">
                            kilogramos
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IMC positioned at lower torso level */}
                <div className="flex justify-end ">
                  <div className="group bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-purple-200/60 transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    {/* Compact version - only value and unit */}
                    <div className="group-hover:hidden px-4 py-2">
                      <div className="text-lg font-bold text-purple-900">
                        {(
                          seleccionado.general.IMC? seleccionado.general.IMC : 0
                        ).toFixed(1)}
                      </div>
                    </div>
                    {/* Expanded version on hover */}
                    <div className="hidden group-hover:block px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                            IMC
                          </div>
                          <div className="text-xl font-bold text-purple-900">
                            {(
                              seleccionado.general.IMC? seleccionado.general.IMC : 0
                            ).toFixed(1)}
                          </div>
                          <div className="text-xs text-purple-600">
                            {getBMIStatus(
                              seleccionado.general.IMC? seleccionado.general.IMC : 0
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* TDC (Dx→Cx) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {seleccionado.general.tdc_dias}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                TDC (Dx→Cx)
              </div>
              <div className="text-xs text-gray-500">días</div>
            </div>
          </div>

          {/* TPO (Cx→Alta) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {seleccionado.general.tpo_dias}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                TPO (Cx→Alta)
              </div>
              <div className="text-xs text-gray-500">días</div>
            </div>
          </div>

          {/* TTH (Dx→Alta) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {seleccionado.general.tth_dias}
              </div>
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
                {seleccionado.general.dx_actual?.cie10}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Dx actual
              </div>
              <div className="text-xs text-gray-500">
                {seleccionado.general.dx_actual?.tipo_fractura}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div ref={chartRef} className="h-96 w-full p-4"></div>
        </div>

        {/* Existing modals */}
        <BloodModal
          isOpen={showBloodModal}
          onClose={() => setShowBloodModal(false)}
          paciente={seleccionado}
        />
        <ParametersModal
          isOpen={showParametersModal}
          onClose={() => setShowParametersModal(false)}
          paciente={seleccionado}
        />
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          paciente={seleccionado}
        />
        <AlertsModal
          isOpen={showAlertsModal}
          onClose={() => setShowAlertsModal(false)}
          paciente={seleccionado}
        />
        <IndicatorsModal
          isOpen={showIndicatorsModal}
          onClose={() => setShowIndicatorsModal(false)}
          paciente={seleccionado}
        />
      </div>
    </RoleGuard>
  );
}
