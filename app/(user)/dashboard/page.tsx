'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, LogOut, FileText, Clock, CheckCircle, XCircle, AlertCircle, Plus, RefreshCcw } from 'lucide-react';

type Request = {
    id: string;
    certificate_type: string;
    status: string;
    created_at: string;
};

const STATUS_CONFIG = {
    RECEIVED: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'En revisión' },
    VALIDATING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En Validación' },
    ISSUED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Emitido' },
    REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazado' },
    NEEDS_CORRECTION: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Necesita Corrección' },
};

export default function Dashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [personalId, setPersonalId] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [requests, setRequests] = useState<Request[]>([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    async function fetchRequests() {
        const res = await fetch('/api/requests', { credentials: 'include' });
        if (res.ok) setRequests(await res.json());
    }

    useEffect(() => {
        fetchRequests();
        loadUserEmail();
    }, []);

    async function loadUserEmail() {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setUserEmail(data.email);
            }
        } catch {
            // Silently fail, user email is not critical
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!file) return setError('Adjunta un archivo');
        if (!firstName.trim()) return setError('El nombre es requerido');
        if (!lastName.trim()) return setError('El apellido es requerido');
        if (!personalId.trim()) return setError('La identificación personal es requerida');
        if (!birthDate) return setError('La fecha de nacimiento es requerida');

        setIsSubmitting(true);
        const body = new FormData();
        body.append('certificate_type', type);
        body.append('attachment', file);
        body.append('first_name', firstName);
        body.append('last_name', lastName);
        body.append('personal_id', personalId);
        body.append('birth_date', birthDate);

        const res = await fetch('/api/requests', {
            method: 'POST',
            body,
            credentials: 'include',
        });

        if (res.ok) {
            setType('');
            setFile(null);
            setFirstName('');
            setLastName('');
            setPersonalId('');
            setBirthDate('');
            fetchRequests();
        } else {
            const { error } = await res.json();
            setError(error);
        }
        setIsSubmitting(false);
    }

    async function handleLogout() {
        const res = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        if (res.ok) {
            window.location.href = '/login';
        }
    }

    const stats = {
        total: requests.length,
        validating: requests.filter(r => r.status === 'VALIDATING').length,
        issued: requests.filter(r => r.status === 'ISSUED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-gray-900">Mis Solicitudes</h1>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En Validación</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.validating}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Emitidos</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.issued}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* New Request Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Nueva Solicitud
                        </CardTitle>
                        <CardDescription>
                            Envía una nueva solicitud de certificado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Tu nombre"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Apellido</label>
                                    <input
                                        type="text"
                                        placeholder="Tu apellido"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Identificación Personal</label>
                                    <input
                                        type="text"
                                        placeholder="Número de identificación"
                                        value={personalId}
                                        onChange={(e) => setPersonalId(e.target.value)}
                                        required
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        required
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Tipo de Certificado</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    required
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Selecciona un tipo de certificado</option>
                                    <option value="Certificado de estudios">Certificado de estudios</option>
                                    <option value="Certificado de trabajo">Certificado de trabajo</option>
                                    <option value="Certificado de nacimiento">Certificado de nacimiento</option>
                                    <option value="Certificado de matrimonio">Certificado de matrimonio</option>
                                    <option value="Certificado de defunción">Certificado de defunción</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Archivo Adjunto</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    required
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Formatos permitidos: PDF, JPG, JPEG, PNG
                                </p>
                            </div>
                            {error && (
                                <div className="rounded-md bg-red-50 p-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex items-center gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Requests List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle>Mis Solicitudes</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={fetchRequests}
                                title="Refrescar"
                            >
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription>
                            {requests.length} solicitud{requests.length !== 1 ? 'es' : ''} en total
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Comienza creando tu primera solicitud de certificado.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((request) => {
                                    const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];
                                    const StatusIcon = statusConfig?.icon || Clock;

                                    async function handleDownload() {
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

                                    return (
                                        <div key={request.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig?.color}`}>
                                                        <StatusIcon className="mr-1 h-3 w-3" />
                                                        {statusConfig?.label}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{request.certificate_type}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(request.created_at).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.location.href = `/requests/${request.id}`}
                                                    className="flex items-center gap-2"
                                                >
                                                    Ver detalles
                                                </Button>
                                                {request.status === 'ISSUED' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                const res = await fetch(`/api/requests/${request.id}/certificate`, { credentials: 'include' });
                                                                if (res.ok && res.headers.get('content-type')?.includes('application/pdf')) {
                                                                    const blob = await res.blob();
                                                                    const url = window.URL.createObjectURL(blob);
                                                                    const a = document.createElement('a');
                                                                    a.href = url;
                                                                    a.download = `certificado-${request.id}.pdf`;
                                                                    document.body.appendChild(a);
                                                                    a.click();
                                                                    window.URL.revokeObjectURL(url);
                                                                    document.body.removeChild(a);
                                                                } else {
                                                                    const text = await res.text();
                                                                    alert('Error al descargar el certificado: ' + text);
                                                                }
                                                            } catch (err) {
                                                                alert('Error al descargar el certificado');
                                                            }
                                                        }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        Descargar certificado
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
