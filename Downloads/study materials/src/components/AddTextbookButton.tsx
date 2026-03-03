'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddTextbookModal } from './AddTextbookModal'

interface SimpleField { id: string; name: string }

export function AddTextbookButton({ fields }: { fields: SimpleField[] }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full hover:bg-gray-200 transition-all shadow-lg hover:-translate-y-0.5"
            >
                <Plus size={16} strokeWidth={3} />
                教材を追加
            </button>
            {open && (
                <AddTextbookModal
                    initialFields={fields}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    )
}
