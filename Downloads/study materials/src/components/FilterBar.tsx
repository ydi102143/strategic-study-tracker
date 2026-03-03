'use client'

import Link from 'next/link'

export interface SimpleField {
    id: string
    name: string
}

interface Props {
    fields: SimpleField[]
    activeFieldId?: string
}

export function FilterBar({ fields, activeFieldId }: Props) {
    return (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar">
            <Link
                href="/"
                className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${!activeFieldId
                    ? 'bg-white text-black shadow-lg shadow-white/10 translate-y-[-2px]'
                    : 'bg-surface-2 text-gray-400 hover:bg-surface-3 hover:text-white'
                    }`}
            >
                すべて
            </Link>

            {fields.map(field => (
                <Link
                    key={field.id}
                    href={`/?field=${field.id}`}
                    className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${activeFieldId === field.id
                        ? 'bg-white text-black shadow-lg shadow-white/10 translate-y-[-2px]'
                        : 'bg-surface-2 text-gray-400 hover:bg-surface-3 hover:text-white'
                        }`}
                >
                    {field.name}
                </Link>
            ))}
        </div>
    )
}
