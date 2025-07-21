'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, LogOut, Filter, FileText, Clock, CheckCircle, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';

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
    VALIDATING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    ISSUED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
    NEEDS_CORRECTION: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
};

export default function AdminDashboard() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [filter, setFilter] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    async function load() {
        const res = await fetch('/api/admin/requests', { credentials: 'include' });
        if (res.ok) {
            setRequests(await res.json());
        } else {
            setError('No autorizado o error de servidor');
        }
    }

    useEffect(() => {
        load();
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

    async function changeStatus(id: string, status: string) {
        const res = await fetch(`/api/admin/requests/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
            credentials: 'include',
        });
        if (res.ok) load();
        else alert('Error al cambiar estado');
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

    const visible = filter
        ? filter === 'VALIDATING'
            ? requests.filter((r) => r.status === 'VALIDATING' || r.status === 'RECEIVED')
            : requests.filter((r) => r.status === filter)
        : requests;

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
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Panel Administrador</h1>
                        <p className="text-gray-600">Gestiona las solicitudes de certificados</p>
                        {userEmail && (
                            <p className="text-sm text-gray-500 mt-1">Usuario: {userEmail}</p>
                        )}
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

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 items-center">
                            <Button
                                onClick={() => setFilter(null)}
                                variant={filter === null ? "default" : "outline"}
                                size="sm"
                            >
                                Todos ({requests.length})
                            </Button>
                            <Button
                                onClick={() => setFilter('VALIDATING')}
                                variant={filter === 'VALIDATING' ? "default" : "outline"}
                                size="sm"
                            >
                                En revisión ({requests.filter(r => r.status === 'RECEIVED' || r.status === 'VALIDATING').length})
                            </Button>
                            <Button
                                onClick={() => setFilter('ISSUED')}
                                variant={filter === 'ISSUED' ? "default" : "outline"}
                                size="sm"
                            >
                                Emitidos ({requests.filter(r => r.status === 'ISSUED').length})
                            </Button>
                            <Button
                                onClick={() => setFilter('REJECTED')}
                                variant={filter === 'REJECTED' ? "default" : "outline"}
                                size="sm"
                            >
                                Rechazados ({requests.filter(r => r.status === 'REJECTED').length})
                            </Button>
                            <Button
                                onClick={() => setFilter('NEEDS_CORRECTION')}
                                variant={filter === 'NEEDS_CORRECTION' ? "default" : "outline"}
                                size="sm"
                            >
                                Necesita corrección ({requests.filter(r => r.status === 'NEEDS_CORRECTION').length})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <p className="text-red-600">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Requests Table */}
                <Card>
                    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle>Solicitudes</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={load}
                                title="Refrescar"
                            >
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <Button
                                onClick={() => setFilter(null)}
                                variant={filter === null ? "default" : "outline"}
                                size="sm"
                            >
                                Todos ({requests.length})
                            </Button>
                            <Button
                                onClick={() => setFilter('VALIDATING')}
                                variant={filter === 'VALIDATING' ? "default" : "outline"}
                                size="sm"
                            >
                                En revisión ({requests.filter(r => r.status === 'RECEIVED' || r.status === 'VALIDATING').length})
                            </Button>
                            <Button
                                onClick={() => setFilter('ISSUED')}
                                variant={filter === 'ISSUED' ? "default" : "outline"}
                                size="sm"
                            >
                                Emitidos ({requests.filter(r => r.status === 'ISSUED').length})
                            </Button>
                            <Button
                                onClick={() => setFilter('REJECTED')}
                                variant={filter === 'REJECTED' ? "default" : "outline"}
                                size="sm"
                            >
                                Rechazados ({requests.filter(r => r.status === 'REJECTED').length})
                            </Button>
                            <Button
                                onClick={() => setFilter('NEEDS_CORRECTION')}
                                variant={filter === 'NEEDS_CORRECTION' ? "default" : "outline"}
                                size="sm"
                            >
                                Necesita corrección ({requests.filter(r => r.status === 'NEEDS_CORRECTION').length})
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {visible.map((request) => {
                                const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];
                                const StatusIcon = statusConfig?.icon || Clock;
                                
                                return (
                                    <div key={request.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig?.color}`}>
                                                    <StatusIcon className="mr-1 h-3 w-3" />
                                                    {request.status}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{request.users.email}</p>
                                                <p className="text-sm text-gray-500">{request.certificate_type}</p>
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
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                onClick={() => window.location.href = `/admin/requests/${request.id}`}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Ver detalles
                                            </Button>
                                            <Select onValueChange={(value) => changeStatus(request.id, value)}>
                                                <SelectTrigger className="w-32 bg-white">
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    {STATUS_OPTIONS.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
