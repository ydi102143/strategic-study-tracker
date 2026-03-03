'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ----- Auth Actions -----

export async function login(formData: FormData) {
    console.log('--- Login Start ---')
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    console.log('Login attempt for:', email)

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login Error:', error.message)
        throw new Error(error.message)
    }

    console.log('Login Successful, redirecting...')
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    console.log('--- Signup Start ---')
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        console.error('Signup Error:', error.message)
        throw new Error(error.message)
    }

    console.log('Signup Successful, redirecting...')
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

// ----- Data Fetching -----

export async function getFields() {
    const supabase = await createClient()
    const { data: fields, error } = await supabase
        .from('fields')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching fields:', JSON.stringify(error, null, 2))
        return []
    }
    return fields
}

export async function getMaterials() {
    const supabase = await createClient()
    const { data: materials, error } = await supabase
        .from('materials')
        .select(`
      *,
      fields ( name )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching materials:', JSON.stringify(error, null, 2))
        return []
    }
    return materials
}

export async function getMaterialById(id: string) {
    const supabase = await createClient()
    const { data: material, error } = await supabase
        .from('materials')
        .select(`
      *,
      fields ( name )
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching material:', error)
        return null
    }
    return material
}

// ----- Mutations -----

export async function createField(name: string) {
    const supabase = await createClient()

    // Since RLS requires auth.uid() = user_id, we need a logged-in user.
    // For now, let's get the user to assign user_id:
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: field, error } = await supabase
        .from('fields')
        .insert({
            user_id: user.id,
            name: name.trim()
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating field:', error)
        throw new Error('Failed to create field')
    }

    revalidatePath('/')
    return field
}

export async function createMaterial(data: {
    title: string
    field_id: string
    type: 'TEXTBOOK' | 'MOVIE'
    cover_url?: string
    total_pages?: number
    pdf_path?: string
    video_path?: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: record, error } = await supabase
        .from('materials')
        .insert({
            user_id: user.id,
            title: data.title,
            field_id: data.field_id,
            type: data.type,
            cover_url: data.cover_url || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=80',
            total_pages: data.total_pages || 0,
            pdf_path: data.pdf_path || null,
            video_path: data.video_path || null
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating material:', error)
        throw new Error('Failed to create material')
    }

    revalidatePath('/')
    return record
}

// deleteMaterial is defined later in the file with storage cleanup logic.

export async function updateProgress(id: string, current_page: number, total_pages: number) {
    const supabase = await createClient()

    const progress = total_pages > 0 ? (current_page / total_pages) * 100 : 0

    const { error } = await supabase
        .from('materials')
        .update({
            current_page,
            progress
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating progress:', error)
        throw new Error('Failed to update progress')
    }

    revalidatePath('/')
    revalidatePath(`/textbook/${id}`)
}

export async function uploadMaterialPdf(materialId: string, formData: FormData) {
    const supabase = await createClient()
    const file = formData.get('file') as File
    if (!file) throw new Error("No file provided")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // ファイル名をパスとして構築 (user_id/material_id.pdf)
    const filePath = `${user.id}/${materialId}.pdf`

    const { data, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, file, {
            upsert: true,
            contentType: 'application/pdf'
        })

    if (uploadError) {
        console.error('Upload Error Details:', JSON.stringify(uploadError, null, 2))
        throw new Error(`Upload Failed: ${uploadError.message}`)
    }

    // Materials テーブルの pdf_path を更新
    const { error: updateError } = await supabase
        .from('materials')
        .update({ pdf_path: data.path })
        .eq('id', materialId)

    if (updateError) throw new Error('Failed to update material record')

    revalidatePath(`/textbook/${materialId}`)
}

export async function uploadMaterialVideo(materialId: string, formData: FormData) {
    const supabase = await createClient()
    const file = formData.get('file') as File
    if (!file) throw new Error("No file provided")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // (user_id/material_id_video.mp4)
    const filePath = `${user.id}/${materialId}_video.mp4`

    const { data, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, file, {
            upsert: true,
            contentType: file.type
        })

    if (uploadError) {
        console.error('Video Upload Error Details:', JSON.stringify(uploadError, null, 2))
        throw new Error(`Video Upload Failed: ${uploadError.message}`)
    }

    const { error: updateError } = await supabase
        .from('materials')
        .update({ video_path: data.path })
        .eq('id', materialId)

    if (updateError) throw new Error('Failed to update material record')

    revalidatePath(`/textbook/${materialId}`)
}

export async function uploadMaterialCover(materialId: string, formData: FormData) {
    const supabase = await createClient()
    const file = formData.get('file') as File
    if (!file) throw new Error("No file provided")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const filePath = `${user.id}/${materialId}_cover.jpg`
    const { data, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, file, { upsert: true, contentType: file.type })
    if (uploadError) throw new Error(`Cover Upload Failed: ${uploadError.message}`)
    const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(data.path)
    const { error: updateError } = await supabase
        .from('materials')
        .update({ cover_url: publicUrl })
        .eq('id', materialId)
    if (updateError) throw new Error('Failed to update material cover')
    revalidatePath(`/textbook/${materialId}`)
    revalidatePath('/')
}

export async function getAnnotations(materialId: string, pageNumber: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('material_id', materialId)
        .eq('page_number', pageNumber)

    if (error) {
        console.error('Error fetching annotations:', error)
        return []
    }
    return data
}

export async function saveAnnotation(data: {
    material_id: string
    page_number: number
    type: 'stroke'
    data: any
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: result, error } = await supabase
        .from('annotations')
        .insert({
            user_id: user.id,
            material_id: data.material_id,
            page_number: data.page_number,
            type: data.type,
            data: data.data
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving annotation:', error)
        throw new Error('Failed to save annotation')
    }
    return result
}

export async function deleteAnnotation(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting annotation:', error)
        throw new Error('Failed to delete annotation')
    }
}

export async function deleteMaterial(id: string) {
    const supabase = await createClient()

    // 1. 教材情報を取得（ストレージのパスを確認するため）
    const { data: material } = await supabase
        .from('materials')
        .select('pdf_path, video_path')
        .eq('id', id)
        .single()

    // 2. ストレージにファイルがあれば削除
    const pathsToDelete = []
    if (material?.pdf_path) pathsToDelete.push(material.pdf_path)
    if (material?.video_path) pathsToDelete.push(material.video_path)

    if (pathsToDelete.length > 0) {
        console.log('Cleaning up storage files:', pathsToDelete)
        await supabase.storage
            .from('materials')
            .remove(pathsToDelete)
    }

    // 3. データベースから削除
    const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting material:', error)
        throw new Error('Failed to delete material')
    }

    revalidatePath('/')
    // 最後にリダイレクトを実行（Next.jsがこれをキャッチして移動させる）
    redirect('/')
}
