"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, QrCode, RefreshCcw, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"

export function ConnectWhatsapp() {
    const [loading, setLoading] = useState(false)
    const [disconnecting, setDisconnecting] = useState(false)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

    // New state for profile info
    const [whatsappName, setWhatsappName] = useState<string | null>(null)
    const [whatsappPicture, setWhatsappPicture] = useState<string | null>(null)
    const [isActive, setIsActive] = useState(true)

    // Effect to check initial status and subscribe to changes
    useEffect(() => {
        let channel: any = null

        const setupRealtime = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            // 1. Fetch initial status and profile info
            const { data: instance } = await supabase
                .from('instances')
                .select('status, whatsapp_name, profile_picture_url, is_active')
                .eq('user_id', user.id)
                .single()

            if (instance?.status === 'connected') {
                setStatus('connected')
                setQrCode(null)
                setWhatsappName(instance.whatsapp_name)
                setWhatsappPicture(instance.profile_picture_url)
                setIsActive(instance.is_active ?? true)
            } else if (instance?.status === 'disconnected') {
                setStatus('disconnected')
                setWhatsappName(null)
                setWhatsappPicture(null)
            }

            // 2. Subscribe to changes with unique channel name
            channel = supabase
                .channel(`instances-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*', // Listen to INSERT and UPDATE
                        schema: 'public',
                        table: 'instances',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('Realtime update:', payload)
                        const newData = payload.new as any
                        const newStatus = newData.status

                        if (newStatus === 'connected') {
                            setStatus('connected')
                            setQrCode(null)
                            // Update profile info from payload if available
                            if (newData.whatsapp_name) setWhatsappName(newData.whatsapp_name)
                            if (newData.profile_picture_url) setWhatsappPicture(newData.profile_picture_url)
                            if (newData.is_active !== undefined) setIsActive(newData.is_active)
                        } else if (newStatus === 'disconnected') {
                            setStatus('disconnected')
                            setQrCode(null)
                            setWhatsappName(null)
                            setWhatsappPicture(null)
                            setError(null)
                        } else if (newStatus === 'connecting') {
                            // Optionally handle connecting state if needed, for now just log
                            console.log('Status changed to connecting')
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('Realtime connection status:', status)
                    if (status === 'SUBSCRIBED') {
                        // Optional: Could set a flag here
                    }
                })
        }

        setupRealtime()

        return () => {
            if (channel) {
                const supabase = createClient()
                supabase.removeChannel(channel)
            }
        }
    }, [])

    const generateQRCode = async () => {
        setLoading(true)
        setError(null)
        setQrCode(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error("Usuário não identificado")

            // Create/Update instance record directly in Supabase
            // This ensures the row exists so N8N only needs to UPDATE it
            const { error: dbError } = await supabase
                .from('instances')
                .upsert({
                    user_id: user.id,
                    status: 'connecting',
                    phone: user.user_metadata.phone
                }, { onConflict: 'user_id' })

            if (dbError) {
                console.error("Erro ao registrar instância:", dbError)
                // We don't stop execution, but we log it
            }

            // Webhook URL endpoint (User needs to provide this)
            const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

            if (!webhookUrl) {
                throw new Error("URL do Webhook não configurada")
            }

            const payload = {
                name: user.user_metadata.full_name,
                email: user.email,
                phone: user.user_metadata.phone,
                userId: user.id
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error('Falha ao comunicar com o servidor de automação')
            }

            const responseText = await response.text()
            let qrImage = null

            try {
                // Try parsing as JSON first
                const data = JSON.parse(responseText)

                // Check for explicit error from API
                if (data.sucess === "false" || data.success === false) {
                    throw new Error(data.Message || "Erro ao conectar")
                }

                qrImage = data.qrcode || data.base64 || data.qr || (typeof data === 'string' ? data : null)
            } catch (e) {
                // If it was our clean error throw, rethrow it
                if (e instanceof Error && e.message !== "Unexpected token" && !e.message.includes("JSON")) {
                    throw e
                }

                // If not JSON, check if the text itself is the QR code
                if (responseText.startsWith('data:image')) {
                    qrImage = responseText
                } else if (responseText.includes('data:image')) {
                    const match = responseText.match(/data:image\/[a-zA-Z]+;base64,[^"]+/)
                    if (match) qrImage = match[0]
                }
            }

            if (qrImage) {
                // Clean up string just in case
                if (qrImage.startsWith('"') && qrImage.endsWith('"')) {
                    qrImage = qrImage.slice(1, -1)
                }
                setQrCode(qrImage)
                setStatus('connecting')
            } else {
                // If we got here and didn't throw an explicit error earlier, it means we couldn't parse a QR code
                throw new Error("Não foi possível gerar o QR Code.")
            }

        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : "Erro desconhecido")
        } finally {
            setLoading(false)
        }
    }

    const handleDisconnect = async () => {
        setDisconnecting(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            // Update local DB status first
            await supabase
                .from('instances')
                .update({
                    status: 'disconnected',
                    whatsapp_name: null,
                    profile_picture_url: null
                })
                .eq('user_id', user.id)

            const deleteWebhookUrl = process.env.NEXT_PUBLIC_N8N_DELETE_WEBHOOK_URL
            if (!deleteWebhookUrl) throw new Error("URL de desconexão não configurada")

            await fetch(deleteWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user.user_metadata.full_name,
                    userId: user.id
                })
            })

            // Reset state
            setStatus('disconnected')
            setError(null)
            setQrCode(null)
            setWhatsappName(null)
            setWhatsappPicture(null)

        } catch (err) {
            console.error(err)
            setError("Falha ao desconectar. Tente novamente.")
        } finally {
            setDisconnecting(false)
        }
    }

    const toggleActive = async () => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const newActiveState = !isActive

            await supabase
                .from('instances')
                .update({ is_active: newActiveState })
                .eq('user_id', user.id)

            setIsActive(newActiveState)
        } catch (err) {
            console.error('Error toggling active state:', err)
        }
    }

    return (
        <Card className="border-white/10 bg-zinc-900/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    Conectar WhatsApp
                </CardTitle>
                <CardDescription>
                    Escaneie o QR Code para conectar seu agente.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 min-h-[300px]">

                {status === 'connected' ? (
                    <div className="text-center space-y-4 animate-in fade-in duration-500 flex flex-col items-center">
                        <div className="relative">
                            {whatsappPicture ? (
                                <img
                                    src={whatsappPicture}
                                    alt="Perfil WhatsApp"
                                    className="w-20 h-20 rounded-full border-4 border-emerald-500/20 object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-emerald-500/20">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-medium text-emerald-400">
                                {whatsappName || "WhatsApp Conectado!"}
                            </h3>
                            <p className="text-zinc-400 text-sm">Agente pronto para uso.</p>
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-800/50 rounded-lg border border-white/5">
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-white">Agente Ativo</p>
                                <p className="text-xs text-zinc-500">Responder mensagens automaticamente</p>
                            </div>
                            <button
                                onClick={toggleActive}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-zinc-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <Button
                            onClick={handleDisconnect}
                            variant="ghost"
                            className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                        >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Desconectar
                        </Button>
                    </div>
                ) : qrCode ? (
                    <div className="space-y-6 text-center">
                        <div className="bg-white p-4 rounded-lg inline-block">
                            {/* Ensure base64 string works as src */}
                            <img
                                src={qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`}
                                alt="QR Code WhatsApp"
                                className="w-48 h-48 object-contain"
                            />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400 mb-4">Abra o WhatsApp &gt; Ajustes &gt; Aparelhos Conectados</p>
                            <Button variant="outline" size="sm" onClick={generateQRCode} className="bg-transparent border-white/10 hover:bg-white/5 text-zinc-400">
                                <RefreshCcw className="w-3 h-3 mr-2" />
                                Gerar Novo Código
                            </Button>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center space-y-6 w-full">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-medium text-white">Falha na Conexão</h3>
                            <p className="text-red-400 text-sm px-4">{error}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <Button
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                variant="destructive"
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50"
                            >
                                {disconnecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                {disconnecting ? '...' : 'Desconectar'}
                            </Button>

                            <Button
                                onClick={generateQRCode}
                                disabled={loading}
                                className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                                {loading ? '...' : 'Tentar Novamente'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto border border-white/5">
                            <QrCode className="w-8 h-8 text-zinc-500" />
                        </div>
                        <p className="text-zinc-400 max-w-xs mx-auto text-sm">
                            Clique abaixo para gerar um código de autenticação único.
                        </p>
                        <Button onClick={generateQRCode} disabled={loading} className="w-full bg-white text-black hover:bg-zinc-200">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? 'Gerando...' : 'Gerar QR Code'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
