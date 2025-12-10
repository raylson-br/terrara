"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push("/dashboard")
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-zinc-900/40 rounded-full blur-[120px] -z-10" />

            <Card className="w-full max-w-md border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">Bem-vindo de volta</CardTitle>
                    <CardDescription>Acesse sua conta para gerenciar seus agentes</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Email</label>
                            <Input name="email" type="email" placeholder="corretor@exemplo.com" required className="bg-zinc-800/50 border-white/5 focus-visible:ring-indigo-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Senha</label>
                            <Input name="password" type="password" required className="bg-zinc-800/50 border-white/5 focus-visible:ring-indigo-500" />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>

                        <div className="text-center text-sm text-zinc-500">
                            Não tem uma conta? <Link href="/register" className="text-white hover:underline">Cadastre-se</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

