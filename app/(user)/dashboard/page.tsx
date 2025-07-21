'use client';

import { useState, useEffect } from 'react';

type Request = {
    id: string;
    certificate_type: string;
    status: string;
    created_at: string;
};

export default function Dashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState('');
    const [requests, setRequests] = useState<Request[]>([]);
    const [error, setError] = useState('');

    async function fetchRequests() {
        const res = await fetch('/api/requests', { credentials: 'include' });
        if (res.ok) setRequests(await res.json());
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!file) return setError('Adjunta un archivo');

        const body = new FormData();
        body.append('certificate_type', type);
        body.append('attachment', file);

        const res = await fetch('/api/requests', {
            method: 'POST',
            body,
            credentials: 'include',
        });

        if (res.ok) {
            setType('');
            setFile(null);
            fetchRequests();
        } else {
            const { error } = await res.json();
            setError(error);
        }
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Tus solicitudes</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Cerrar sesión
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-lg bg-white p-4 shadow space-y-4 max-w-md"
            >
                <input
                    type="text"
                    placeholder="Tipo de certificado"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    className="w-full rounded border p-2"
                />
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    className="w-full"
                />
                {error && (
                    <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>
                )}
                <button className="w-full rounded bg-blue-600 p-2 text-white">
                    Enviar solicitud
                </button>
            </form>

            <table className="w-full bg-white rounded shadow">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-left">Estado</th>
                        <th className="p-2 text-left">Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((r) => (
                        <tr key={r.id} className="border-t">
                            <td className="p-2">{r.certificate_type}</td>
                            <td className="p-2">{r.status}</td>
                            <td className="p-2">
                                {new Date(r.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
