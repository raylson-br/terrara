
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-32 h-8">
                            <Image
                                src="/logo-white.png"
                                alt="Terrara"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white" asChild>
                        <Link href="/login">Entrar</Link>
                    </Button>
                    <Button variant="premium" className="font-semibold" asChild>
                        <Link href="/register">Começar</Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}
