import { NextResponse } from 'next/server';
import { verifyJwt } from '../../../lib/auth';
import { supabaseAdmin as db } from '../../../lib/supabase';

export async function GET(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+);?/i)?.[1];
    const payload = token ? await verifyJwt(token) : null;
    
    if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details from database
    const { data: user, error } = await db
        .from('users')
        .select('email, role')
        .eq('id', payload.id)
        .single();

    if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: payload.id,
        email: user.email,
        role: user.role
    });
} 