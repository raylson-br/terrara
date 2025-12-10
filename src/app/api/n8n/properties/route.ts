import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scrapeRealEstateSite } from '@/services/scraper'

export const maxDuration = 60; // Allow 60 seconds for scraping (Vercel Pro/Hobby limits apply)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Fetch user data using Admin API
        const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)

        if (error || !user) {
            console.error('Error fetching user:', error)
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const websiteUrl = user.user_metadata.website

        if (!websiteUrl) {
            return NextResponse.json({ error: 'No website configured for this agent' }, { status: 400 })
        }

        console.log(`Scraping for user ${userId} at ${websiteUrl}`)

        // Run scraper
        const listings = await scrapeRealEstateSite(websiteUrl)

        return NextResponse.json({
            count: listings.length,
            website: websiteUrl,
            listings: listings
        })

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
    }
}
