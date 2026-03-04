'use client'

import { useState } from 'react'
import { setMaterialCoverUrl } from '@/app/actions'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, Check } from 'lucide-react'

export default function UploadCoverButton({ materialId }: { materialId: string }) {
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const supabase = createClient()

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください')
            return
        }

        setUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Unauthorized")

            const filePath = `${user.id}/${materialId}_cover.jpg`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('materials')
                .upload(filePath, file, { upsert: true, contentType: file.type })

            if (uploadError) throw new Error(`Cover Upload Failed: ${uploadError.message}`)

            const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(uploadData.path)
            await setMaterialCoverUrl(materialId, publicUrl)

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
