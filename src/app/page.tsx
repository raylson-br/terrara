"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Building2, TrendingUp, Globe } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative min-h-screen flex flex-col">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-zinc-800/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-zinc-900/20 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto text-center max-w-4xl flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span className="text-sm text-zinc-300">Automação de Vendas Imobiliárias</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Construa Agentes <br />
              IA no WhatsApp.
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transforme seu atendimento com inteligência artificial. Nossos agentes qualificam leads, agendam visitas e tiram dúvidas 24/7 diretamente no WhatsApp do corretor.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-xl mx-auto mb-20 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-zinc-200 text-base font-semibold rounded-full" asChild>
              <a href="/register">Criar Conta Grátis <ArrowRight className="ml-2 w-4 h-4" /></a>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-white">
              Ver Demonstração
            </Button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                icon: Sparkles,
                title: "Atendimento 24/7",
                desc: "Seu agente nunca dorme. Responda a novos leads instantaneamente, a qualquer hora."
              },
              {
                icon: TrendingUp,
                title: "Qualificação Auto",
                desc: "A IA identifica perfil, orçamento e interesse antes de você assumir a conversa."
              },
              {
                icon: Building2,
                title: "Integração WhatsApp",
                desc: "Conecte seu número existente via QR Code e transforme seu Zap em máquina de vendas."
              },
              {
                icon: Globe,
                title: "Conecte seu Site",
                desc: "Sincronização automática. O agente aprende sobre todos os seus imóveis disponíveis."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
              >
                <Card className="h-full border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
