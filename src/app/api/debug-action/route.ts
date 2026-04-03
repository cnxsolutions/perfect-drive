import { NextResponse } from 'next/server';
import { getVehicles } from '@/actions/admin';

export async function GET() {
    const data = await getVehicles();
    return NextResponse.json(data);
}
