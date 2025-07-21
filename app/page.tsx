'use client';

import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
          DocuTrack
        </h1>
        <p className="text-lg leading-8 text-gray-600 mb-10">
          Sistema para la gestión de solicitudes de certificados
        </p>
        <Button size="lg" className="flex items-center gap-2 mx-auto" onClick={() => window.location.href = '/login'}>
          <LogIn className="h-4 w-4" />
          Iniciar sesión
        </Button>
      </div>
    </div>
  );
}
