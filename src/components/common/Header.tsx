import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Header = ({ title }: { title: string }) => {
    return (
        <header className="flex items-center gap-3 px-4 py-3 bg-[#0f1117] border-b border-white/5 sticky top-0 z-40">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
                <h1 className="text-white font-black text-base leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    Win Go
                </h1>
                <p className="text-white/40 text-[10px]">{title || 'Colour Prediction'} · Demo Mode</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-[10px] font-bold">LIVE</span>
            </div>
        </header>
    )
}

export default Header