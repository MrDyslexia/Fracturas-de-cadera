export interface Paciente {
  rut: string;
  nombres: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
}
export interface Examen {
  id: number;
  nombre: string;
  fecha: string;
  tipo: ".txt" | ".xlsx" | ".doc" | ".pdf" | ".csv"|".jpg"|".png";
  url: string;
}
export interface DetallesPaciente {
  rut: string;
  nombres: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
  fechaNacimiento: string;
  tipoSangre: string;
  peso: number;
  altura: number;
  examenes: Examen[];
  num_indicador: number;
  riesgo: "bajo" | "medio" | "alto";
  comentario: string;
}
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}