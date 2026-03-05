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
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const isDrawingRef = useRef(false)
    const lastPointRef = useRef<Point | null>(null)
    const currentPointsRef = useRef<Point[]>([])
    const strokesRef = useRef<Stroke[]>([])

    // イベントキュー（120Hz/60Hz同期用）
    const pendingPointsRef = useRef<Point[]>([])

    const getPixelRatio = () => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)

    // 全体の再描画
    const redrawEverything = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = ctxRef.current
        if (!ctx || !canvas) return

        const ratio = getPixelRatio()
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        strokesRef.current.forEach(stroke => {
            if (!stroke.points || stroke.points.length < 2) return
            ctx.beginPath()
            ctx.strokeStyle = stroke.color
            ctx.lineWidth = stroke.width * ratio
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

    // コンテキスト初期化（低遅延設定）
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // desynchronized: true を指定してOSの描画ループに直接介入する
        const ctx = canvas.getContext('2d', {
            desynchronized: true,
            alpha: true
        })
        if (ctx) {
            ctxRef.current = ctx as CanvasRenderingContext2D
            redrawEverything()
        }
    }, [redrawEverything])

    // 初期データ読み込み
    useEffect(() => {
        strokesRef.current = initialAnnotations.map(ann => ({
            id: ann.id,
            ...ann.data
        }))
        redrawEverything()
    }, [initialAnnotations, redrawEverything])

    // リサイズ管理
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const updateSize = () => {
            const parent = canvas.parentElement
            if (parent) {
                const ratio = getPixelRatio()
                const width = parent.clientWidth
                const height = parent.clientHeight
                canvas.width = width * ratio
                canvas.height = height * ratio
                canvas.style.width = `${width}px`
                canvas.style.height = `${height}px`
                redrawEverything()
            }
        }
        const observer = new ResizeObserver(updateSize)
        if (canvas.parentElement) observer.observe(canvas.parentElement)
        updateSize()
        return () => observer.disconnect()
    }, [redrawEverything])

    const eraseAt = (x: number, y: number) => {
        const threshold = 0.025
        const strokeToErase = strokesRef.current.find(stroke =>
            stroke.points.some(p => Math.abs(p.x - x) < threshold && Math.abs(p.y - y) < threshold)
        )
        if (strokeToErase?.id) {
            strokesRef.current = strokesRef.current.filter(s => s.id !== strokeToErase.id)
            redrawEverything()
            deleteAnnotation(strokeToErase.id).catch(err => console.error(err))
            return true
        }
        return false
    }

    // 描画ループ (requestAnimationFrame)
    useEffect(() => {
        let rafId: number
        const renderLoop = () => {
            const canvas = canvasRef.current
            const ctx = ctxRef.current

            if (canvas && ctx && pendingPointsRef.current.length > 0) {
                const ratio = getPixelRatio()
                ctx.strokeStyle = color
                ctx.lineWidth = lineWidth * ratio
                ctx.lineJoin = 'round'
                ctx.lineCap = 'round'

                // キューに溜まった点を一気に描画
                for (const newPoint of pendingPointsRef.current) {
                    if (mode === 'eraser') {
                        eraseAt(newPoint.x, newPoint.y)
                    } else if (lastPointRef.current) {
                        ctx.beginPath()
                        ctx.moveTo(lastPointRef.current.x * canvas.width, lastPointRef.current.y * canvas.height)
                        ctx.lineTo(newPoint.x * canvas.width, newPoint.y * canvas.height)
                        ctx.stroke()
                    }
                    lastPointRef.current = newPoint
                    currentPointsRef.current.push(newPoint)
                }
                pendingPointsRef.current = []
            }
            rafId = requestAnimationFrame(renderLoop)
        }
        rafId = requestAnimationFrame(renderLoop)
        return () => cancelAnimationFrame(rafId)
    }, [color, lineWidth, mode])

    const startAction = (e: React.PointerEvent) => {
        if (!isActive) return
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
        if (e.cancelable) e.preventDefault()

        const canvas = canvasRef.current
        if (!canvas) return
        canvas.setPointerCapture(e.pointerId)

        const rect = canvas.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height

        isDrawingRef.current = true
        const point = { x, y, p: 0.5 }

        if (mode === 'eraser') {
            pendingPointsRef.current.push(point)
        } else {
            lastPointRef.current = point
            currentPointsRef.current = [point]
        }
    }

    const doAction = (e: React.PointerEvent) => {
        if (!isActive || !isDrawingRef.current) return
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
        if (e.cancelable) e.preventDefault()

        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()

        // 高密度の入力を取得
        const events = (e.nativeEvent as any).getCoalescedEvents?.() || [e.nativeEvent]
        for (const ev of events) {
            const x = (ev.clientX - rect.left) / rect.width
            const y = (ev.clientY - rect.top) / rect.height
            pendingPointsRef.current.push({ x, y, p: 0.5 })
        }
    }

    const stopAction = async (e: React.PointerEvent) => {
        const canvas = canvasRef.current
        if (canvas) canvas.releasePointerCapture(e.pointerId)
        if (!isDrawingRef.current) return
        isDrawingRef.current = false

        if (currentPointsRef.current.length > 1 && mode !== 'eraser') {
            const newStrokeContent = {
                points: currentPointsRef.current,
                color: color,
                width: lineWidth
            }
            const tempId = 'temp-' + Date.now()
            strokesRef.current.push({ ...newStrokeContent, id: tempId })

            try {
                const saved = await saveAnnotation({
                    material_id: materialId,
                    page_number: pageNumber,
                    type: 'stroke',
                    data: newStrokeContent
                })
                strokesRef.current = strokesRef.current.map(s =>
                    s.id === tempId ? { ...newStrokeContent, id: saved.id } : s
                )
            } catch (err) {
                console.error(err)
                strokesRef.current = strokesRef.current.filter(s => s.id !== tempId)
                redrawEverything()
            }
        }
        lastPointRef.current = null
        currentPointsRef.current = []
    }

    return (
        <canvas
            ref={canvasRef}
            onPointerDown={startAction}
            onPointerMove={doAction}
            onPointerUp={stopAction}
            onPointerOut={stopAction}
            style={{
                touchAction: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'block',
                outline: 'none',
                willChange: 'transform' // ハードウェア加速を要求
            }}
            className={`z-[200] ${isActive ? (mode === 'pen' ? 'cursor-crosshair' : 'cursor-cell') : 'pointer-events-none'}`}
        />
    )
}
