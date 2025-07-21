'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, FileText, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar } from 'lucide-react';

type Request = {
    id: string;
    certificate_type: string;
    status: string;
    created_at: string;
    attachment_url: string;
    users: { email: string };
};

const STATUS_OPTIONS = [
    'VALIDATING',
    'ISSUED',
    'REJECTED',
    'NEEDS_CORRECTION',
];

const STATUS_CONFIG = {
    VALIDATING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En Validación' },
    ISSUED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Emitido' },
    REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazado' },
    NEEDS_CORRECTION: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Necesita Corrección' },
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
                const res = await fetch(`/api/admin/requests/${params.id}`, { 
                    credentials: 'include' 
                });
                if (res.ok) {
                    const data = await res.json();
                    setRequest(data);
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

    async function changeStatus(status: string) {
        if (!request) return;
        
        const res = await fetch(`/api/admin/requests/${request.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
            credentials: 'include',
        });
        
        if (res.ok) {
            setRequest(prev => prev ? { ...prev, status } : null);
        } else {
            alert('Error al cambiar el estado');
        }
    }

    async function downloadAttachment() {
        if (!request?.attachment_url) return;
        
        try {
            const res = await fetch(`/api/admin/requests/${request.id}/download`, {
                credentials: 'include'
            });
            
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `attachment-${request.id}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Error al descargar el archivo');
            }
        } catch {
            alert('Error al descargar el archivo');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-4xl">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-4xl">
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <p className="text-red-600">{error || 'Solicitud no encontrada'}</p>
                            <Button 
                                onClick={() => router.push('/admin/dashboard')}
                                className="mt-4"
                            >
                                Volver al dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];
    const StatusIcon = statusConfig?.icon || Clock;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button 
                            onClick={() => router.push('/admin/dashboard')}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Detalles de Solicitud</h1>
                            <p className="text-gray-600">ID: {request.id}</p>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <StatusIcon className="h-5 w-5" />
                            Estado Actual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusConfig?.color}`}>
                                <StatusIcon className="mr-2 h-4 w-4" />
                                {statusConfig?.label}
                            </div>
                            <Select onValueChange={changeStatus} value={request.status}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Request Details */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Usuario
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-sm text-gray-900">{request.users.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tipo de Certificado</label>
                                <p className="text-sm text-gray-900">{request.certificate_type}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Información Temporal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                                <p className="text-sm text-gray-900">
                                    {new Date(request.created_at).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Hace</label>
                                <p className="text-sm text-gray-900">
                                    {Math.floor((Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24))} días
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Attachment */}
                {request.attachment_url && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Archivo Adjunto
                            </CardTitle>
                            <CardDescription>
                                Documento enviado por el usuario
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {request.attachment_url.split('/').pop() || 'Archivo'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Archivo adjunto
                                        </p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={downloadAttachment}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Descargar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Acciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-4">
                            <Button 
                                onClick={() => router.push('/admin/dashboard')}
                                variant="outline"
                            >
                                Volver al Dashboard
                            </Button>
                            {request.attachment_url && (
                                <Button 
                                    onClick={downloadAttachment}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Descargar Archivo
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 