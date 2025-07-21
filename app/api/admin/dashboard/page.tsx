'use client';

import { useEffect, useState } from 'react';

type Request = {
    id: string;
    certificate_type: string;
    status: string;
    created_at: string;
    users: { email: string };
};

const STATUS_OPTIONS = [
    'VALIDATING',
    'ISSUED',
    'REJECTED',
    'NEEDS_CORRECTION',
];

export default function AdminDashboard() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [error, setError] = useState('');

    async function load() {
        const res = await fetch('/api/admin/requests', { credentials: 'include' });
        if (res.ok) setRequests(await res.json());
        else setError('No autorizado o error de servidor');
    }

    useEffect(() => {
        load();
    }, []);

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

    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Panel Admin</h1>
            <table className="w-full rounded bg-white shadow">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Correo</th>
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-left">Estado</th>
                        <th className="p-2 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((r) => (
                        <tr key={r.id} className="border-t">
                            <td className="p-2">{r.users.email}</td>
                            <td className="p-2">{r.certificate_type}</td>
                            <td className="p-2">{r.status}</td>
                            <td className="p-2 space-x-2">
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => changeStatus(r.id, s)}
                                        className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
