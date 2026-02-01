"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bot, Home, MessageSquare, Settings, LogOut, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const pathname = usePathname()
    const [credits, setCredits] = useState({ total: 10000, used: 0 })

    useEffect(() => {
        const fetchCredits = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            // 1. Fetch initial data
            const { data } = await supabase
                .from('profiles')
                .select('credits_total, credits_used')
                .eq('id', user.id)
                .single()

            if (data) {
                setCredits({ total: data.credits_total, used: data.credits_used })
            }

            // 2. Realtime Subscription
            const channel = supabase
                .channel(`width-credits-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`
                    },
                    (payload) => {
                        const newProfile = payload.new as any
                        setCredits({ total: newProfile.credits_total, used: newProfile.credits_used })
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        fetchCredits()
    }, [])

    const percentage = Math.min(100, (credits.used / credits.total) * 100)

    const links = [
        { href: "/dashboard", label: "Visão Geral", icon: Home },
        { href: "/dashboard/leads", label: "Leads", icon: MessageSquare },
        { href: "/dashboard/agent", label: "Configurar Agente", icon: Bot },
        { href: "/dashboard/settings", label: "Configurações", icon: Settings },
    ]

    return (
        <aside className="w-64 border-r border-white/10 bg-zinc-900/50 hidden md:flex flex-col">
            <div className="p-6">
                <div className="relative w-32 h-8">
                    <Image
                        src="/logo-white.png"
                        alt="Terrara"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Credits Progress Bar */}
            <div className="p-4 mx-4 mb-4 bg-zinc-950/50 rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        Créditos de IA
                    </span>
                    <span className="text-xs text-zinc-500">
                        {credits.used.toLocaleString()} / {credits.total.toLocaleString()}
                    </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-[10px] text-zinc-600 mt-2 text-center">
                    Renova em 30 dias
                </p>
            </div>

            <div className="p-4 border-t border-white/5">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sair
                </Link>
            </div>
        </aside>
    )
}
