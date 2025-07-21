'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    mode: 'login' | 'register';
};

export default function AuthForm({ mode }: Props) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const label = mode === 'login' ? 'Iniciar sesión' : 'Registrarse';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        const res = await fetch(`/api/auth/${mode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        if (res.ok) {
            router.push('/dashboard');
            router.refresh();
        } else {
            const { error } = await res.json();
            setError(error ?? 'Algo salió mal');
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"
        >
            <h1 className="text-2xl font-semibold text-center">{label}</h1>
            {error && (
                <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>
            )}
            <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded border p-2"
            />
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded border p-2"
            />
            <button
                type="submit"
                className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700"
            >
                {label}
            </button>
            {mode === 'login' ? (
                <p className="text-center text-sm">
                    ¿Sin cuenta?{' '}
                    <a href="/register" className="text-blue-600 underline">
                        Regístrate
                    </a>
                </p>
            ) : (
                <p className="text-center text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <a href="/login" className="text-blue-600 underline">
                        Inicia sesión
                    </a>
                </p>
            )}
        </form>
    );
}
