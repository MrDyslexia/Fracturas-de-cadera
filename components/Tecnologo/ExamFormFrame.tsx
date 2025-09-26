"use client";

import type { ReactNode } from "react";

interface ExamFormFrameProps {
  children: ReactNode;
}

export default function ExamFormFrame({ children }: ExamFormFrameProps) {
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <form className="space-y-6">
            {children}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Examen
              </button>
            </div>
          </form>
      </div>
  );
}
