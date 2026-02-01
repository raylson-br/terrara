import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, name, phone, status } = body

        if (!userId || !name || !phone) {
            return NextResponse.json({ error: 'userId, name, and phone are required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Upsert lead (update if exists by phone, insert if new)
        const { data, error } = await supabase
            .from('leads')
            .upsert({
                user_id: userId,
                name,
                phone,
                status: status || 'in_progress',
                last_interaction: new Date().toISOString()
            }, {
                onConflict: 'user_id,phone',
                ignoreDuplicates: false
            })
            .select()
            .single()

        if (error) {
            console.error('Error upserting lead:', error)
            return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
        }

        return NextResponse.json({ success: true, lead: data })

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
