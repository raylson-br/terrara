"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, MessageCircle, Phone, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Lead {
    id: string
    name: string
    phone: string
    status: string
    last_interaction: string
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'qualified' | 'in_progress'>('all')

    useEffect(() => {
        fetchLeads()
    }, [filter])

    const fetchLeads = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        let query = supabase
            .from('leads')
            .select('*')
            .eq('user_id', user.id)
            .order('last_interaction', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('status', filter)
        }

        const { data, error } = await query

        if (!error && data) {
            setLeads(data)
        }

        setLoading(false)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins}m atrás`
        if (diffHours < 24) return `${diffHours}h atrás`
        return `${diffDays}d atrás`
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            qualified: 'bg-emerald-500/10 text-emerald-400',
            in_progress: 'bg-blue-500/10 text-blue-400',
            disqualified: 'bg-zinc-500/10 text-zinc-400'
        }
        const labels = {
            qualified: 'Qualificado',
            in_progress: 'Em Atendimento',
            disqualified: 'Desqualificado'
        }
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        )
    }

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Leads</h1>
                <p className="text-zinc-400">Gerencie os contatos qualificados pelo seu agente.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-white text-black' : 'bg-transparent border-white/10'}
                >
                    Todos
                </Button>
                <Button
                    variant={filter === 'qualified' ? 'default' : 'outline'}
                    onClick={() => setFilter('qualified')}
                    className={filter === 'qualified' ? 'bg-white text-black' : 'bg-transparent border-white/10'}
                >
                    Qualificados
                </Button>
                <Button
                    variant={filter === 'in_progress' ? 'default' : 'outline'}
                    onClick={() => setFilter('in_progress')}
                    className={filter === 'in_progress' ? 'bg-white text-black' : 'bg-transparent border-white/10'}
                >
                    Em Atendimento
                </Button>
            </div>

            {/* Leads List */}
            {loading ? (
                <div className="text-center py-12 text-zinc-400">Carregando...</div>
            ) : leads.length === 0 ? (
                <Card className="border-white/10 bg-zinc-900/50">
                    <CardContent className="py-12 text-center">
                        <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Nenhum lead ainda</h3>
                        <p className="text-zinc-400 text-sm">
                            Quando o agente qualificar leads, eles aparecerão aqui.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {leads.map((lead) => (
                        <Card key={lead.id} className="border-white/10 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-medium text-white">{lead.name}</h3>
                                            {getStatusBadge(lead.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {lead.phone}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="w-3 h-3" />
                                                {formatDate(lead.last_interaction)}
                                            </span>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-4"
                                    >
                                        <Button variant="outline" size="sm" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            WhatsApp
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
