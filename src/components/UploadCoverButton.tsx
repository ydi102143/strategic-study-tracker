'use client'

import { useState } from 'react'
import { uploadMaterialCover } from '@/app/actions'
import { Camera, Loader2, Check } from 'lucide-react'

export default function UploadCoverButton({ materialId }: { materialId: string }) {
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください')
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            await uploadMaterialCover(materialId, formData)
            setStatus('success')
            setTimeout(() => setStatus('idle'), 3000)
        } catch (err) {
            console.error('Cover upload failed:', err)
            setStatus('error')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="absolute bottom-4 right-4 z-20">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
                id="cover-upload"
            />
            <label
                htmlFor="cover-upload"
                className={`
                    flex items-center justify-center w-12 h-12 rounded-full shadow-2xl cursor-pointer transition-all
                    ${status === 'success' ? 'bg-green-500 scale-110' : 'bg-white/20 backdrop-blur-md hover:bg-white/40 text-white'}
                `}
            >
                {uploading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : status === 'success' ? (
                    <Check size={20} />
                ) : (
                    <Camera size={20} />
                )}
            </label>
        </div>
    )
}
