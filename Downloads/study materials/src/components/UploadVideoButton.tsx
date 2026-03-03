'use client'

import { useState } from 'react'
import { uploadMaterialVideo } from '@/app/actions'
import { Video, Check, Loader2, AlertCircle } from 'lucide-react'

export default function UploadVideoButton({ materialId }: { materialId: string }) {
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('video/')) {
            alert('動画ファイルを選択してください')
            return
        }

        setUploading(true)
        setStatus('idle')
        setErrorMsg('')

        const formData = new FormData()
        formData.append('file', file)

        try {
            await uploadMaterialVideo(materialId, formData)
            setStatus('success')
        } catch (err: any) {
            console.error('Video upload failed:', err)
            setStatus('error')
            setErrorMsg(err.message || 'アップロードに失敗しました')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                    id="video-upload"
                />
                <label
                    htmlFor="video-upload"
                    className={`
                        flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed
                        transition-all cursor-pointer
                        ${status === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' :
                            status === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
                                'bg-surface-2 border-surface-3 hover:border-white/30 text-gray-400 hover:text-white'}
                    `}
                >
                    {uploading ? (
                        <Loader2 className="animate-spin text-white" size={20} />
                    ) : status === 'success' ? (
                        <Check size={20} />
                    ) : (
                        <Video size={20} />
                    )}

                    <span className="font-bold uppercase tracking-widest text-sm">
                        {uploading ? 'アップロード中...' : status === 'success' ? '動画保存済み' : '動画をアップロード'}
                    </span>
                </label>
            </div>

            {status === 'error' && (
                <div className="bg-red-950/30 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs">
                    <AlertCircle size={16} />
                    {errorMsg}
                </div>
            )}

            <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest px-2">
                MP4 / MOV / WEBM (最大 50MB) などを選択してください
            </p>
        </div>
    )
}
