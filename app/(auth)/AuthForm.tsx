'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

type Props = {
    mode: 'login' | 'register';
};

export default function AuthForm({ mode }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const label = mode === 'login' ? 'Iniciar sesión' : 'Registrarse';
    const Icon = mode === 'login' ? LogIn : UserPlus;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const res = await fetch(`/api/auth/${mode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });

        if (!res.ok) {
            const { error } = await res.json().catch(() => ({ error: 'Sin cuerpo' }));
            setError(error ?? 'Algo salió mal');
            setIsSubmitting(false);
            return;
        }

        const data = await res.json().catch(() => null);

        if (!data) {
            setIsSubmitting(false);
            return;
        }

        // Espera breve para que el navegador persista la cookie antes de navegar
        await new Promise((r) => setTimeout(r, 100));

        const target = data.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
        window.location.href = target;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                        <Icon className="h-6 w-6" />
                        {label}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {mode === 'login' 
                            ? 'Ingresa a tu cuenta para gestionar tus solicitudes'
                            : 'Crea una cuenta para comenzar a solicitar certificados'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-red-50 p-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center gap-2"
                        >
                            <Icon className="h-4 w-4" />
                            {isSubmitting ? 'Procesando...' : label}
                        </Button>

                        <div className="text-center text-sm">
                            {mode === 'login' ? (
                                <p>
                                    ¿Sin cuenta?{' '}
                                    <a href="/register" className="text-blue-600 hover:text-blue-700 underline font-medium">
                                        Regístrate
                                    </a>
                                </p>
                            ) : (
                                <p>
                                    ¿Ya tienes cuenta?{' '}
                                    <a href="/login" className="text-blue-600 hover:text-blue-700 underline font-medium">
                                        Inicia sesión
                                    </a>
                                </p>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
