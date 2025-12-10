"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Bot, MessageSquare, Target, Sparkles, CheckCircle2, Home } from "lucide-react"

export default function AgentPage() {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        // Identity
        name: "",
        tone: "formal",

        // Strategy
        goal: "schedule",
        instructions: "",

        // Business Context (New)
        agency_name: "",
        years_experience: "",
        description: "",
        market_segment: "medium",
        instagram: "",
        catalog_link: ""
    })

    useEffect(() => {
        const loadUserData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user?.user_metadata?.agent_config) {
                setFormData(user.user_metadata.agent_config)
            }
            setFetching(false)
        }
        loadUserData()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccess(false)

        const supabase = createClient()

        // Get current user to merge metadata
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase.auth.updateUser({
                data: {
                    agent_config: formData
                }
            })

            if (!error) {
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            }
        }
        setLoading(false)
    }

    if (fetching) {
        return <div className="p-8 text-zinc-400 flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Carregando agente...</div>
    }

    return (
        <div className="p-8 max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Configurar Agente</h1>
                <p className="text-zinc-400">Personalize como sua IA interage com os clientes.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Business Context */}
                <Card className="border-white/10 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Home className="w-5 h-5 text-blue-400" />
                            Sobre a Imobiliária
                        </CardTitle>
                        <CardDescription>Dados essenciais para a IA entender seu negócio.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Nome da Imobiliária</label>
                                <Input
                                    value={formData.agency_name}
                                    onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                                    placeholder="Ex: Terrara Imóveis"
                                    className="bg-zinc-800/50 border-white/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Tempo de Mercado</label>
                                <Input
                                    value={formData.years_experience}
                                    onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                                    placeholder="Ex: 10 anos"
                                    className="bg-zinc-800/50 border-white/5"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Descrição Breve</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ex: Somos especialistas em imóveis de alto padrão na Zona Sul..."
                                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-white/5 bg-zinc-800/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 resize-y"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Segmento Principal</label>
                                <select
                                    value={formData.market_segment}
                                    onChange={(e) => setFormData({ ...formData, market_segment: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-white/5 bg-zinc-800/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700"
                                >
                                    <option value="high">Alto Padrão / Luxo</option>
                                    <option value="medium_high">Médio-Alto Padrão</option>
                                    <option value="medium">Médio Padrão</option>
                                    <option value="popular">Popular / Minha Casa Minha Vida</option>
                                    <option value="commercial">Comercial / Corporativo</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Link do Catálogo/Site</label>
                                <Input
                                    value={formData.catalog_link}
                                    onChange={(e) => setFormData({ ...formData, catalog_link: e.target.value })}
                                    placeholder="https://..."
                                    className="bg-zinc-800/50 border-white/5"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Identity */}
                <Card className="border-white/10 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Bot className="w-5 h-5 text-indigo-400" />
                            Identidade
                        </CardTitle>
                        <CardDescription>Defina quem é o seu agente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Nome do Agente</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Ana da Terrara"
                                className="bg-zinc-800/50 border-white/5"
                            />
                            <p className="text-xs text-zinc-500">
                                Este nome será usado para se apresentar aos clientes.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Tom de Voz</label>
                            <select
                                value={formData.tone}
                                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                className="w-full h-10 px-3 rounded-md border border-white/5 bg-zinc-800/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700"
                            >
                                <option value="formal">Formal & Profissional</option>
                                <option value="friendly">Amigável & Descontraído</option>
                                <option value="enthusiastic">Vendedor Entusiasta</option>
                                <option value="concise">Direto & Conciso</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Strategy */}
                <Card className="border-white/10 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Target className="w-5 h-5 text-emerald-400" />
                            Estratégia
                        </CardTitle>
                        <CardDescription>Qual o principal objetivo das conversas?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Objetivo Principal</label>
                            <select
                                value={formData.goal}
                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                className="w-full h-10 px-3 rounded-md border border-white/5 bg-zinc-800/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700"
                            >
                                <option value="schedule">Agendar Visita (Alta Conversão)</option>
                                <option value="qualify">Qualificar & Filtrar (Economia de Tempo)</option>
                                <option value="support">Tirar Dúvidas (Suporte 24h)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Instructions */}
                <Card className="border-white/10 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            Instruções Avançadas
                        </CardTitle>
                        <CardDescription>Regras específicas para o comportamento da IA.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Prompt do Sistema (Opcional)</label>
                            <textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                placeholder="Ex: Ofereça financiamento apenas se o cliente perguntar. Não agende visitas aos domingos."
                                className="w-full min-h-[120px] px-3 py-2 rounded-md border border-white/5 bg-zinc-800/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 resize-y"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4">
                    {success && (
                        <span className="text-emerald-400 flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Configurações salvas!
                        </span>
                    )}
                    <Button type="submit" className="bg-white text-black hover:bg-zinc-200 min-w-[120px]" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
