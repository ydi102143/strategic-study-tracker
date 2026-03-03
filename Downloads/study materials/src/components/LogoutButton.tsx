'use client'

import { logout } from '@/app/actions'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export function LogoutButton() {
    const [isPending, setIsPending] = useState(false)

    const handleLogout = async () => {
        setIsPending(true)
        try {
            await logout()
        } catch (error) {
            console.error('Logout failed:', error)
            setIsPending(false)
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-surface-2 hover:bg-red-950/30 text-gray-400 hover:text-red-400 font-bold uppercase tracking-widest text-[10px] rounded-full border border-surface-3 hover:border-red-900 transition-all shadow-md active:translate-y-0.5 disabled:opacity-50"
            title="ログアウト"
        >
            <LogOut size={14} strokeWidth={2.5} />
            {isPending ? 'Logging out...' : 'Logout'}
        </button>
    )
}
