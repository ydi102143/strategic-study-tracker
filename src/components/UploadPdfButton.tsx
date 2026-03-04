'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setMaterialPdfPath } from '@/app/actions'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface Props {
    materialId: string
    hasPdf: boolean
}

export function UploadPdfButton({ materialId, hasPdf }: Props) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            setError('PDFファイルのみアップロード可能です')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Unauthorized")

            const filePath = `${user.id}/${materialId}.pdf`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('materials')
                .upload(filePath, file, {
                    upsert: true,
                    contentType: 'application/pdf'
                })

            if (uploadError) throw new Error(`Upload Failed: ${uploadError.message}`)

            await setMaterialPdfPath(materialId, uploadData.path)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    クラウドPDF管理
                </label>
                {hasPdf && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase tracking-wider">
                        <CheckCircle2 size={12} /> クラウド保存済み
                    </span>
                )}
            </div>

            <div className="relative">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className={`
          flex items-center justify-center gap-3 py-4 px-6 border-2 border-dashed rounded-2xl transition-all
          ${isUploading ? 'bg-surface-2 border-surface-3 opacity-50' : 'bg-surface-1 border-surface-3 hover:border-white/30 hover:bg-surface-2'}
        `}>
                    {isUploading ? (
                        <span className="text-sm font-bold animate-pulse">アップロード中...</span>
                    ) : (
                        <>
                            <Upload size={18} className="text-gray-400" />
                            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
                                {hasPdf ? 'PDFを更新する' : 'PDFをアップロード'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-950/20 p-3 rounded-lg border border-red-900/50">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
        </div>
    )
}
