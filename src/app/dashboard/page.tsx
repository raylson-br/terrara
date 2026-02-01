"use client"

import { useEffect, useState } from "react"
import { QrCode, Users, MessageCircle, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectWhatsapp } from "@/components/dashboard/connect-whatsapp"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function DashboardPage() {
    const [stats, setStats] = useState({
        qualified: 0,
        inProgress: 0,
        todayQualified: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Get qualified count
        const { count: qualifiedCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'qualified')

        // Get in progress count
        const { count: inProgressCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'in_progress')

        // Get today's qualified count
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { count: todayCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'qualified')
            .gte('created_at', today.toISOString())

        setStats({
            qualified: qualifiedCount || 0,
            inProgress: inProgressCount || 0,
            todayQualified: todayCount || 0
        })
        setLoading(false)
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Visão Geral</h1>
                <p className="text-zinc-400">Acompanhe o desempenho do seu agente imobiliário.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Status Column */}
                <div className="md:col-span-1 space-y-6">
                    <ConnectWhatsapp />
                </div>

                {/* Stats Grid */}
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
                    <Card className="border-white/10 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Leads Qualificados</CardTitle>
                            <Users className="w-4 h-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '...' : stats.qualified}</div>
                            <p className="text-xs text-emerald-400 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" /> +{stats.todayQualified} hoje
                            </p>
                            <Link href="/dashboard/leads?filter=qualified">
                                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs text-zinc-400 hover:text-white">
                                    Ver todos <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Em Atendimento</CardTitle>
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '...' : stats.inProgress}</div>
                            <p className="text-xs text-zinc-500 mt-1">
                                Conversas ativas
                            </p>
                            <Link href="/dashboard/leads?filter=in_progress">
                                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs text-zinc-400 hover:text-white">
                                    Ver todos <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
