'use client'

import { useState, useEffect } from 'react'
import { REASONING_DATA, ReasoningItem } from '@/data/reasoningContent'
import { Brain, Sparkles, Cpu } from 'lucide-react'

export function ReasoningVisualization() {
    const [currentItem, setCurrentItem] = useState<ReasoningItem>(
        REASONING_DATA[Math.floor(Math.random() * REASONING_DATA.length)]
    )
    const [fade, setFade] = useState(true)

    const formatText = (text: string) => {
        return text
            .replace(/\$/g, '')
            .replace(/\\sum/g, '∑')
            .replace(/\\nabla/g, '∇')
            .replace(/\\sigma/g, 'σ')
            .replace(/\\gamma/g, 'γ')
            .replace(/\\pi/g, 'π')
            .replace(/\\theta/g, 'θ')
            .replace(/\\dim/g, 'dim')
            .replace(/\\ker/g, 'ker')
            .replace(/\\text\{([^}]+)\}/g, '$1')
            .replace(/\^T/g, 'ᵀ')
            .replace(/\^2/g, '²')
            .replace(/\^{-1}/g, '⁻¹')
            .replace(/_i/g, 'ᵢ')
            .replace(/_{([^}]+)}/g, '$1')
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false)
            setTimeout(() => {
                const nextItem = REASONING_DATA[Math.floor(Math.random() * REASONING_DATA.length)]
                setCurrentItem(nextItem)
                setFade(true)
            }, 500) // Fade out duration
        }, 5000) // Change item every 5 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center p-8 w-full max-w-lg mx-auto">
            {/* Thinking Animation */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse scale-150" />
                <div className="relative bg-surface-2 p-5 rounded-3xl border border-white/10 shadow-2xl">
                    <Brain className="w-10 h-10 text-blue-400 animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/40 blur-lg rounded-full animate-ping" />
                        <Sparkles className="w-5 h-5 text-purple-300 relative" />
                    </div>
                </div>
            </div>

            {/* Content Display */}
            <div className={`transition-all duration-700 space-y-6 ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <Cpu size={12} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                            {currentItem.category}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight leading-tight">
                        {currentItem.title}
                    </h3>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                    <div className="relative p-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5 space-y-4">
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Theory</span>
                            <p className="text-sm text-white/70 leading-relaxed font-medium">
                                {formatText(currentItem.description)}
                            </p>
                        </div>
                        
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/50">AI Application Scene</span>
                            <p className="text-sm text-white/90 leading-relaxed font-bold italic">
                                {formatText(currentItem.scene)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subliminal Message / Status */}
            <div className="mt-12 flex flex-col items-center gap-3">
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <div 
                            key={i} 
                            className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" 
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">
                    Constructing Reasoning Path...
                </p>
            </div>
        </div>
    )
}
