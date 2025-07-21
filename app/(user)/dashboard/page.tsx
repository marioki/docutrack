// app/dashboard/page.tsx  o /user/dashboard si lo devolviste
import { cookies } from 'next/headers';
import { verifyJwt } from '../../lib/auth';

export default async function Dashboard() {
    const token = (await cookies()).get('token')?.value;
    console.log('SERVER TOKEN:', token?.slice(0, 15));
    const payload = token && verifyJwt(token);
    console.log('PAYLOAD:', payload);

    if (!payload) {
        return <h1>No autorizado</h1>;
    }
    return <h1>Bienvenido, {payload.id}</h1>;
}
