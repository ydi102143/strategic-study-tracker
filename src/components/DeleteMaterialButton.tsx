'use client'

import { useState } from 'react'
import { deleteMaterial } from '@/app/actions'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'

export default function DeleteMaterialButton({ id, title }: { id: string, title: string }) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleDelete() {
        setIsDeleting(true)
        try {
            await deleteMaterial(id)
        } catch (err: any) {
            // Next.jsのリダイレクトエラーは正常な挙動なので無視する
            if (err.message === 'NEXT_REDIRECT') return

            console.error('Failed to delete material:', err)
            setIsDeleting(false)
            setIsConfirming(false)
            alert('削除に失敗しました')
        }
    }

    if (isConfirming) {
        return (
            <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-red-400">
                    <AlertTriangle size={20} />
                    <span className="font-bold uppercase tracking-widest text-sm">本当に削除しますか？</span>
                </div>
                <p className="text-xs text-gray-500">「{title}」と、関連するすべてのメモ・ファイルが完全に削除されます。この操作は取り消せません。</p>
                <div className="flex gap-3">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                        {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                        はい、削除します
                    </button>
                    <button
                        onClick={() => setIsConfirming(false)}
                        disabled={isDeleting}
                        className="flex-1 bg-surface-2 hover:bg-surface-3 text-gray-300 font-bold uppercase tracking-widest text-xs py-3 rounded-xl transition"
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={() => setIsConfirming(true)}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-400 transition-colors font-bold uppercase tracking-widest text-[10px] py-4"
        >
            <Trash2 size={14} />
            この教材データを完全に削除する
        </button>
    )
}
