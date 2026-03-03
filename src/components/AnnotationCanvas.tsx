'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { saveAnnotation, deleteAnnotation } from '@/app/actions'

interface Point {
    x: number
    y: number
    p: number
}

interface Stroke {
    id?: string // Supabase row ID
    points: Point[]
    color: string
    width: number
}

interface Props {
    materialId: string
    pageNumber: number
    initialAnnotations?: any[] // Rows from DB
    isActive: boolean
    mode: 'pen' | 'eraser'
    color: string
    lineWidth: number
}

export function AnnotationCanvas({ materialId, pageNumber, initialAnnotations = [], isActive, mode, color, lineWidth }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentStroke, setCurrentStroke] = useState<Point[]>([])
    const [allStrokes, setAllStrokes] = useState<Stroke[]>([])

    // Load initial data
    useEffect(() => {
        const strokes = initialAnnotations.map(ann => ({
            id: ann.id,
            ...ann.data
        }))
        setAllStrokes(strokes)
    }, [initialAnnotations])

    const drawAll = useCallback((strokes: Stroke[]) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        strokes.forEach(stroke => {
            if (!stroke.points || stroke.points.length < 2) return
            ctx.beginPath()
            ctx.strokeStyle = stroke.color
            ctx.lineWidth = stroke.width
            ctx.lineJoin = 'round'
            ctx.lineCap = 'round'

            stroke.points.forEach((p, i) => {
                const x = p.x * canvas.width
                const y = p.y * canvas.height
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
            })
            ctx.stroke()
        })
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const handleResize = () => {
            const parent = canvas.parentElement
            if (parent) {
                canvas.width = parent.clientWidth
                canvas.height = parent.clientHeight
                drawAll(allStrokes)
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [allStrokes, drawAll])

    const findAndEraseStroke = async (x: number, y: number) => {
        const threshold = 0.01 // 判定のしきい値
        const strokeToErase = allStrokes.find(stroke =>
            stroke.points.some(p => Math.abs(p.x - x) < threshold && Math.abs(p.y - y) < threshold)
        )

        if (strokeToErase?.id) {
            setAllStrokes(prev => prev.filter(s => s.id !== strokeToErase.id))
            try {
                await deleteAnnotation(strokeToErase.id)
            } catch (err) {
                console.error('Delete failed:', err)
            }
        }
    }

    const startAction = (e: React.PointerEvent) => {
        if (!isActive) return
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = (e.clientX - rect.left) / canvas.width
        const y = (e.clientY - rect.top) / canvas.height

        if (mode === 'eraser') {
            findAndEraseStroke(x, y)
        } else {
            setIsDrawing(true)
            setCurrentStroke([{ x, y, p: e.pressure || 0.5 }])
        }
    }

    const doAction = (e: React.PointerEvent) => {
        if (!isActive) return
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = (e.clientX - rect.left) / canvas.width
        const y = (e.clientY - rect.top) / canvas.height

        if (mode === 'eraser') {
            findAndEraseStroke(x, y)
            return
        }

        if (!isDrawing) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const newPoint = { x, y, p: e.pressure || 0.5 }
        setCurrentStroke(prev => [...prev, newPoint])

        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()

        const lastPoint = currentStroke[currentStroke.length - 1]
        if (lastPoint) {
            ctx.moveTo(lastPoint.x * canvas.width, lastPoint.y * canvas.height)
            ctx.lineTo(x * canvas.width, y * canvas.height)
            ctx.stroke()
        }
    }

    const stopAction = async () => {
        if (!isDrawing) return
        setIsDrawing(false)

        if (currentStroke.length > 1) {
            const newStrokeContent = {
                points: currentStroke,
                color: color,
                width: lineWidth
            }

            // 仮のIDでUIを更新（保存後に本物のIDに差し替える）
            setAllStrokes(prev => [...prev, { ...newStrokeContent, id: 'temp-' + Date.now() }])

            try {
                const saved = await saveAnnotation({
                    material_id: materialId,
                    page_number: pageNumber,
                    type: 'stroke',
                    data: newStrokeContent
                })

                // 保存された本物のIDを反映
                setAllStrokes(prev => prev.map(s => s.id?.toString().startsWith('temp') ? { ...newStrokeContent, id: saved.id } : s))
            } catch (err) {
                console.error('Save failed:', err)
                // 失敗した場合はUIから消す
                setAllStrokes(prev => prev.filter(s => !s.id?.toString().startsWith('temp')))
            }
        }
        setCurrentStroke([])
    }

    return (
        <canvas
            ref={canvasRef}
            onPointerDown={startAction}
            onPointerMove={doAction}
            onPointerUp={stopAction}
            onPointerLeave={stopAction}
            style={{ touchAction: 'none' }}
            className={`absolute inset-0 z-10 ${isActive ? (mode === 'pen' ? 'cursor-crosshair' : 'cursor-cell') : 'pointer-events-none'}`}
        />
    )
}
