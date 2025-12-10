"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, User, Globe, CheckCircle2 } from "lucide-react"

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        website: "",
        email: "", // Read only
        userId: "" // Read only
    })

    useEffect(() => {
        const loadUserData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setFormData({
                    fullName: user.user_metadata.full_name || "",
                    phone: user.user_metadata.phone || "",
                    website: user.user_metadata.website || "",
                    email: user.email || "",
                    userId: user.id
                })
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
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: formData.fullName,
                phone: formData.phone,
                website: formData.website
            }
        })

        if (!error) {
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        }
        setLoading(false)
    }

    if (fetching) {
        return <div className="p-8 text-zinc-400 flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Carregando configurações...</div>
    }

    return (
        <div className="p-8 max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Configurações</h1>
                <p className="text-zinc-400">Gerencie seu perfil e integrações.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Personal Info */}
                <Card className="border-white/10 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <User className="w-5 h-5 text-indigo-400" />
                            Dados Pessoais
                        </CardTitle>
                        <CardDescription>Informações básicas da sua conta.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Nome Completo</label>
                                <Input
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Seu nome"
                                    className="bg-zinc-800/50 border-white/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Email (Não editável)</label>
                                <Input
                                    value={formData.email}
                                    disabled
                                    className="bg-zinc-800/20 border-white/5 text-zinc-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Telefone / WhatsApp</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(00) 00000-0000"
                                    className="bg-zinc-800/50 border-white/5"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Integration Info */}
                <Card className="border-white/10 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Globe className="w-5 h-5 text-emerald-400" />
                            Integração com Site
                        </CardTitle>
                        <CardDescription>Conecte seu site para que o agente aprenda sobre seus imóveis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">URL do Site</label>
                            <Input
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://www.susaimobiliaria.com.br"
                                className="bg-zinc-800/50 border-white/5"
                            />
                            <p className="text-xs text-zinc-500">
                                O agente irá varrer este site periodicamente em busca de atualizações no inventário.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4">
                    {success && (
                        <span className="text-emerald-400 flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Salvo com sucesso!
                        </span>
                    )}
                    <Button type="submit" className="bg-white text-black hover:bg-zinc-200 min-w-[120px]" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>

            {/* Developer Section - Outside the form since it's read-only */}
            <Card className="border-white/10 bg-zinc-900/50 mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <code className="text-emerald-400 font-mono">&lt;/&gt;</code>
                        Developer / API
                    </CardTitle>
                    <CardDescription>Dados técnicos para integração com N8N.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Seu User ID (Use isso no N8N)</label>
                        <div className="flex gap-2">
                            <Input
                                value={formData.userId}
                                readOnly
                                className="bg-zinc-950 border-white/5 font-mono text-zinc-400"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(formData.userId)
                                    alert("ID copiado!")
                                }}
                                className="border-white/10 hover:bg-white/5"
                            >
                                Copiar
                            </Button>
                        </div>
                        <p className="text-xs text-zinc-500">
                            Envie este ID no corpo das suas requisições API (`userId`).
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
