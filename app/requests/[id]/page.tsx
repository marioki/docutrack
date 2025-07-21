'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, ArrowLeft, Download } from 'lucide-react';

const STATUS_CONFIG = {
  RECEIVED: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'En revisión' },
  VALIDATING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En Validación' },
  ISSUED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Emitido' },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazado' },
  NEEDS_CORRECTION: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Necesita Corrección' },
};

type Request = {
  id: string;
  certificate_type: string;
  status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  personal_id: string;
  birth_date: string;
  attachment_url: string;
};

export default function RequestDetails() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRequest() {
      try {
        const res = await fetch(`/api/requests/${params.id}`, { credentials: 'include' });
        if (res.ok) {
          setRequest(await res.json());
        } else {
          setError('No se pudo cargar la solicitud');
        }
      } catch {
        setError('Error al cargar la solicitud');
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [params.id]);

  async function handleDownload() {
    if (!request) return;
    const res = await fetch(`/api/requests/${request.id}/download`, { credentials: 'include' });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${request.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      alert('Error al descargar el certificado');
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error || 'Solicitud no encontrada'}</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig?.icon || Clock;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <h1 className="text-2xl font-bold ml-2">Detalles de Solicitud</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              {statusConfig?.label}
            </CardTitle>
            <CardDescription>
              {new Date(request.created_at).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo de Certificado</label>
              <p className="text-sm text-gray-900">{request.certificate_type}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-sm text-gray-900">{request.first_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Apellido</label>
                <p className="text-sm text-gray-900">{request.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Identificación Personal</label>
                <p className="text-sm text-gray-900">{request.personal_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                <p className="text-sm text-gray-900">{request.birth_date}</p>
              </div>
            </div>
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-500">Archivo subido</label>
              <div className="flex items-center gap-3 mt-1">
                <FileText className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-900 break-all">
                  {request.attachment_url?.split('/').pop() || 'Archivo'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const res = await fetch(`/api/requests/${request.id}/download`, { credentials: 'include' });
                    if (res.ok) {
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = request.attachment_url?.split('/').pop() || 'archivo';
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } else {
                      alert('Error al descargar el archivo');
                    }
                  }}
                >
                  Descargar archivo
                </Button>
              </div>
            </div>
            {request.status === 'ISSUED' && (
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 w-full mt-4"
              >
                <Download className="h-4 w-4" /> Descargar certificado
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 