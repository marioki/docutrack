'use client';

import { useState } from 'react';

type Props = {
    mode: 'login' | 'register';
};

export default function AuthForm({ mode }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const label = mode === 'login' ? 'Iniciar sesión' : 'Registrarse';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        console.log('🔸 Enviando fetch…');

        const res = await fetch(`/api/auth/${mode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include', // necesario para recibir la cookie
        });

        console.log('🔹 res.ok =', res.ok, ' status =', res.status);

        if (!res.ok) {
            const { error } = await res.json().catch(() => ({ error: 'Sin cuerpo' }));
            console.log('🔻 Error JSON:', error);
            setError(error ?? 'Algo salió mal');
            return;
        }

        const data = await res.json().catch(() => null);
        console.log('🔸 data =', data);

        if (!data) return;

        // Espera breve para que el navegador persista la cookie antes de navegar
        await new Promise((r) => setTimeout(r, 100));

        const target =
            data.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

        console.log('🔸 Redirigiendo a', target);
        window.location.href = target;          // redirección completa
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
