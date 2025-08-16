'use client';

export function TopBar({ onBack }: { onBack: () => void }) {
  const handleClick = () => {
    const ok = window.confirm('¿Seguro que quieres salir y volver al login?');
    if (ok) onBack();
  };

  return (
    <header className="w-full flex items-center justify-between p-4 border-b">
      <button onClick={handleClick} className="text-blue-600 hover:underline">
        ← Volver
      </button>
      <div className="font-medium">Portal Paciente</div>
      <div />
    </header>
  );
}
