import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Fetch user data using Admin API (bypass RLS)
        const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)

        if (error || !user) {
            console.error('Error fetching user:', error)
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Extract relevant context
        const context = {
            profile: {
                name: user.user_metadata.full_name,
                phone: user.user_metadata.phone,
                website: user.user_metadata.website,
                email: user.email
            },
            agent: user.user_metadata.agent_config || {}
        }

        return NextResponse.json(context)

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
