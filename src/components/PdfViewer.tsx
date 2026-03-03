'use client'

import { useState, useEffect, useTransition } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, Maximize, Edit3, Move, Eraser } from 'lucide-react'
import { updateProgress, getAnnotations } from '@/app/actions'
import { AnnotationCanvas } from './AnnotationCanvas'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Web Workerの設定
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface Props {
    materialId: string
    pdfUrl: string
    initialPage: number
    totalPageCount: number
}

export function PdfViewer({ materialId, pdfUrl, initialPage, totalPageCount }: Props) {
    const [numPages, setNumPages] = useState<number>(totalPageCount)
    const [pageNumber, setPageNumber] = useState(initialPage || 1)
    const [isPending, startTransition] = useTransition()
    const [scale, setScale] = useState(1.0)

    // Handwriting tools state
    const [isPencilMode, setIsPencilMode] = useState(false)
    const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen')
    const [activeColor, setActiveColor] = useState('#FFFFFF')
    const [lineWidth, setLineWidth] = useState(2)
    const [initialAnnotations, setInitialAnnotations] = useState<any[]>([])

    // Load annotations
    useEffect(() => {
        async function loadAnnotations() {
            const data = await getAnnotations(materialId, pageNumber)
            setInitialAnnotations(data)
        }
        loadAnnotations()
    }, [pageNumber, materialId])

    // Sync progress
    useEffect(() => {
        if (pageNumber !== initialPage) {
            const timer = setTimeout(() => {
                startTransition(async () => {
                    await updateProgress(materialId, pageNumber, numPages)
                })
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [pageNumber, materialId, numPages, initialPage])

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => setNumPages(numPages)
    const goToPrevPage = () => setPageNumber(p => Math.max(1, p - 1))
    const goToNextPage = () => setPageNumber(p => Math.min(numPages, p + 1))

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden relative">
            {/* Top Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-surface-1/50 backdrop-blur-md border-b border-white/5 z-50">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-black tracking-widest text-white/50">{pageNumber} / {numPages}</span>
                </div>

                {/* Handwriting Toolbar */}
                <div className="flex items-center gap-2 bg-surface-2 p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => { setIsPencilMode(!isPencilMode); setActiveTool('pen') }}
                        className={`p-2.5 rounded-xl transition-all ${isPencilMode && activeTool === 'pen' ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:text-white'}`}
                    >
                        <Edit3 size={18} strokeWidth={2.5} />
                    </button>

                    {isPencilMode && (
                        <>
                            <button
                                onClick={() => setActiveTool('eraser')}
                                className={`p-2.5 rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:text-white'}`}
                            >
                                <Eraser size={18} strokeWidth={2.5} />
                            </button>

                            <div className="h-4 w-[1px] bg-white/10 mx-1" />

                            <div className="flex gap-1 px-2">
                                {['#FFFFFF', '#FF3B30', '#007AFF', '#FFCC00'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => { setActiveColor(c); setActiveTool('pen') }}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${activeColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="h-4 w-[1px] bg-white/10 mx-1" />

                    <button
                        onClick={() => setIsPencilMode(false)}
                        className={`p-2.5 rounded-xl transition-all ${!isPencilMode ? 'bg-white text-black' : 'bg-transparent text-gray-400'}`}
                    >
                        <Move size={18} />
                    </button>
                </div>

                <button onClick={() => setScale(s => s + 0.1)} className="text-gray-400 hover:text-white transition p-2"><Maximize size={18} /></button>
            </div>

            {/* Main Content */}
            <div className={`flex-1 overflow-auto flex justify-center items-start pt-4 pb-20 scrollbar-hide select-none relative ${isPencilMode ? 'touch-none' : 'touch-pan-y'}`}>
                <div className="relative shadow-2xl">
                    <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                        <Page pageNumber={pageNumber} scale={scale} renderAnnotationLayer={false} renderTextLayer={false} />
                    </Document>

                    <AnnotationCanvas
                        materialId={materialId}
                        pageNumber={pageNumber}
                        initialAnnotations={initialAnnotations}
                        isActive={isPencilMode}
                        mode={activeTool}
                        color={activeColor}
                        lineWidth={lineWidth}
                    />
                </div>
            </div>

            {/* iPad Nav Controls */}
            {!isPencilMode && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface-2/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl shadow-2xl z-50">
                    <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="p-3 text-white hover:bg-white/10 rounded-2xl disabled:opacity-20"><ChevronLeft size={28} /></button>
                    <div className="h-8 w-[1px] bg-white/10 mx-2" />
                    <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="p-3 text-white hover:bg-white/10 rounded-2xl disabled:opacity-20"><ChevronRight size={28} /></button>
                </div>
            )}
        </div>
    )
}
