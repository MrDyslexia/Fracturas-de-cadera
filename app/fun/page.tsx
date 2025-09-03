'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '../../components/RoleGuard';

import PACIENTES, { Paciente } from '../../data/pacientes';
import { norm } from '../../utils/text';

import PacienteSearch from '../../components/Funcionario/PacienteSearch';
import PacienteTable from '../../components/Funcionario/PacienteTable';

// Componente Modal
interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly paciente: Paciente | null;
  readonly children: React.ReactNode;
}

function Modal({ isOpen, onClose, paciente, children }: ModalProps) {
  if (!isOpen || !paciente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Información del Paciente
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function FuncionarioHome() {
  const [rutInput, setRutInput] = useState('');
  const [q, setQ] = useState('');
  
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);

  // Nueva función para abrir modal con información del paciente
  const abrirModal = (rut: string) => {
    const paciente = PACIENTES.find(p => p.rut === rut);
    if (paciente) {
      setSelectedPaciente(paciente);
      setIsModalOpen(true);
    }
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setSelectedPaciente(null);
  };

  // filtro de la tabla a partir de q
  const filtrados = useMemo<Paciente[]>(() => {
    const s = norm(q.trim());
    if (!s) return PACIENTES;
    return PACIENTES.filter((p) => {
      const full = `${p.rut} ${p.nombres} ${p.ApellidoPaterno} ${p.ApellidoMaterno}`;
      return norm(full).includes(s);
    });
  }, [q]);

  const recientes = ['12.345.678-9', '13.345.678-4', '14.345.678-5'];

  return (
    <RoleGuard allow={['funcionario']}>
      <div className="px-6 py-6 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-900 mb-6">
          Panel del Funcionario
        </h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-12 items-start z-2 bg-trasparent">
          <PacienteSearch
            value={rutInput}
            onChange={setRutInput}
            onOpen={abrirModal}
            recientes={recientes}
          />

          <PacienteTable
            pacientes={filtrados}
            q={q}
            onQChange={setQ}
            onVerPerfil={abrirModal}
            // Agregar nueva prop para abrir modal si quieres
            // onVerModal={abrirModal}
          />
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={cerrarModal}
          paciente={selectedPaciente}
          
        >
          {selectedPaciente && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label htmlFor="paciente-rut" className="font-medium text-gray-700">RUT:</label>
                  <p id="paciente-rut" className="text-gray-900">{selectedPaciente.rut}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Nombres:</span>
                  <p className="text-gray-900">{selectedPaciente.nombres}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Apellido Paterno:</span>
                  <p className="text-gray-900">{selectedPaciente.ApellidoPaterno}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Apellido Materno:</span>
                  <p className="text-gray-900">{selectedPaciente.ApellidoMaterno}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 flex gap-3 justify-end">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    cerrarModal();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Ver Perfil Completo
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RoleGuard>
  );
}