import { QrCode, Users, MessageCircle, TrendingUp, CheckCircle2, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectWhatsapp } from "@/components/dashboard/connect-whatsapp"

export default function DashboardPage() {
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

                    <Card className="border-white/10 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Status do Agente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="font-medium text-emerald-400">Ativo e Aguardando</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Grid */}
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
                    <Card className="border-white/10 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Leads Qualificados</CardTitle>
                            <Users className="w-4 h-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-emerald-400 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" /> +2 hoje
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Conversas Ativas</CardTitle>
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-zinc-500 mt-1">
                                Em andamento
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Visitas Agendadas</CardTitle>
                            <Calendar className="w-4 h-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-zinc-500 mt-1">
                                Para esta semana
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Tempo Médio</CardTitle>
                            <Clock className="w-4 h-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2m</div>
                            <p className="text-xs text-zinc-500 mt-1">
                                De resposta
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Leads Table */}
            <div>
                <h2 className="text-xl font-semibold mt-8 mb-4">Últimos Leads Qualificados</h2>
                <div className="rounded-md border border-white/10 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900 text-zinc-400 font-medium">
                            <tr>
                                <th className="px-4 py-3">Nome</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Interesse</th>
                                <th className="px-4 py-3">Orçamento</th>
                                <th className="px-4 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-zinc-900/30">
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-white">Maria Oliveira</td>
                                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">Alto Potencial</span></td>
                                <td className="px-4 py-3 text-zinc-300">Ap. 3 Quartos, Centro</td>
                                <td className="px-4 py-3 text-zinc-300">R$ 500k - 600k</td>
                                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-8">Ver Chat</Button></td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-white">Carlos Mendes</td>
                                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400">Em Análise</span></td>
                                <td className="px-4 py-3 text-zinc-300">Casa em Condomínio</td>
                                <td className="px-4 py-3 text-zinc-300">R$ 1.2M</td>
                                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-8">Ver Chat</Button></td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-white">Fernanda Costa</td>
                                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">Agendou Visita</span></td>
                                <td className="px-4 py-3 text-zinc-300">Studio Investimento</td>
                                <td className="px-4 py-3 text-zinc-300">R$ 350k</td>
                                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-8">Ver Chat</Button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
