'use client'

import { useState } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { updateProgress } from '@/app/actions'

interface Props {
    materialId: string
    currentPage: number
    totalPages: number
}

export function MovieProgressTracker({ materialId, currentPage, totalPages }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [current, setCurrent] = useState(currentPage)

    const handleIncrement = async () => {
        if (current >= totalPages || isLoading) return

        setIsLoading(true)
        try {
            const next = current + 1
            await updateProgress(materialId, next, totalPages)
            setCurrent(next)
        } catch (err) {
            alert('進捗の更新に失敗しました')
        } finally {
            setIsLoading(false)
        }
    }

    const progressPercent = totalPages > 0 ? (current / totalPages) * 100 : 0

    return (
        <div className="pt-6">
            <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                    講義：第 {current} 回 / 全 {totalPages} 回
                </span>
                <span className="text-xl font-black font-mono tracking-wider">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-white transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <button
                onClick={handleIncrement}
                disabled={current >= totalPages || isLoading}
                className="w-full py-4 rounded-xl bg-surface-2 border border-surface-3 hover:border-white/30 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-30 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : current >= totalPages ? (
                    <><Check size={16} /> 全講義完了</>
                ) : (
                    <><Plus size={16} className="group-hover:rotate-90 transition-transform" /> 次の講義を完了にする</>
                )}
            </button>
        </div>
    )
}
