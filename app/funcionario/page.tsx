'use client';
import RoleGuard from '@/components/RoleGuard';

export default function FuncionarioHome() {
  return (
    <RoleGuard allow={['funcionario']}>
      <main className="p-6">
        <h1 className="text-xl font-semibold">Panel Funcionario</h1>
        <p className="mt-2">Aquí van las órdenes, exámenes, etc.</p>
      </main>
    </RoleGuard>
  );
}
