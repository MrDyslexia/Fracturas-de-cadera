// data/pacientes.ts
export type Paciente = {
  rut: string;
  nombres: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
};

const PACIENTES: Paciente[] = [
  {
    rut: "12.345.678-9",
    ApellidoPaterno: "Olivares",
    ApellidoMaterno: "Bustos",
    nombres: "Juan Alberto",
  },
  {
    rut: "13.345.678-4",
    ApellidoPaterno: "Carrasco",
    ApellidoMaterno: "Fuentes",
    nombres: "María Angélica",
  },
  {
    rut: "14.345.678-5",
    ApellidoPaterno: "bustos",
    ApellidoMaterno: "Rojas",
    nombres: "Paola Andrea",
  },
  {
    rut: "17.345.678-6",
    ApellidoPaterno: "López",
    ApellidoMaterno: "Muñoz",
    nombres: "Lorenzo Adrián",
  },
  {
    rut: "4.345.678-9",
    ApellidoPaterno: "Bustos",
    ApellidoMaterno: "Vega",
    nombres: "Camila Sofía",
  },
  {
    rut: "5.345.678-9",
    ApellidoPaterno: "Cereceda",
    ApellidoMaterno: "Araya",
    nombres: "Diego Ignacio",
  },
  {
    rut: "6.345.678-9",
    ApellidoPaterno: "Carvajal",
    ApellidoMaterno: "Pizarro",
    nombres: "Valentina Paz",
  },
];

export default PACIENTES;
