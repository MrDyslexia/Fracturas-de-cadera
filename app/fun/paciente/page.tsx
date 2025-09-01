'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
export default function PacientePage() {
    const RUT = useSearchParams().get('RUT');
    
    return (
        <div>
            <h1>Paciente</h1>
            <p>RUT del paciente: {RUT}</p>
        </div>
    );
}