import { getFields, getMaterials } from './actions'
import { FilterBar, SimpleField } from '@/components/FilterBar'
import { TextbookCard } from '@/components/TextbookGrid'
import { AddTextbookButton } from '@/components/AddTextbookButton'
import { FieldSettings } from '@/components/FieldSettings'
import { OnboardingModal } from '@/components/OnboardingModal'
import { BookOpen, Video, Image as ImageIcon, LayoutGrid } from 'lucide-react'

interface PageProps {
    params: Promise<any>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: PageProps) {
    const s = await searchParams
    const activeFieldId = s && typeof s === 'object' ? (s.field as string) : undefined

    // 強力なフォールバック
    let fields: any[] = []
    let allMaterials: any[] = []

    try {
        fields = (await getFields()) || []
    } catch (e) {
        console.error('Failed to fetch fields:', e)
        fields = []
    }

    try {
        allMaterials = (await getMaterials()) || []
    } catch (e) {
        console.error('Failed to fetch materials:', e)
        allMaterials = []
    }

    const simpleFields: SimpleField[] = fields
        .filter(f => f && f.id && f.name) // 不正なデータを排除
        .map(f => ({ id: f.id, name: f.name }))

    const displayFields = activeFieldId
        ? fields.filter(f => f && f.id === activeFieldId)
        : fields.filter(f => f && f.id && f.name)

    return (
        <>
            <OnboardingModal />
            <header className="mb-12 pb-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-gray-400 font-medium tracking-wide">クラウド同期対応・スマート学習プラットフォーム</p>
                    </div>
                    <AddTextbookButton fields={simpleFields} />
                </div>
            </header>

            <section className="mb-10">
                <FilterBar fields={simpleFields} activeFieldId={activeFieldId} />
            </section>

            <section className="space-y-16">
                {displayFields.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-surface-3 rounded-3xl">
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-500">分野が見つかりません</h2>
                        <p className="text-gray-600 mt-3 text-sm">「教材を追加」ボタンから最初の教材を記録してください</p>
                    </div>
                ) : (
                    displayFields.map(field => {
                        if (!field || !field.id) return null

                        const fieldMaterials = allMaterials.filter(t => t && t.field_id === field.id && !t.parent_id)
                        const courses = fieldMaterials.filter(t => t.type === 'COURSE')
                        const textbooks = fieldMaterials.filter(t => t.type === 'TEXTBOOK')
                        const movies = fieldMaterials.filter(t => t.type === 'MOVIE')
                        const websites = fieldMaterials.filter(t => t.type === 'WEBSITE')

                        if (fieldMaterials.length === 0) return null

                        // カテゴリ定義（空は除外）
                        const COLS = 4
                        const cats = [
                            { label: '講座', items: courses, icon: <LayoutGrid size={14} />, color: 'text-orange-400' },
                            { label: 'PDF', items: textbooks, icon: <BookOpen size={14} />, color: 'text-gray-300' },
                            { label: '動画', items: movies, icon: <Video size={14} />, color: 'text-blue-400' },
                            { label: 'Web', items: websites, icon: <ImageIcon size={14} />, color: 'text-purple-400' },
                        ].filter(c => c.items.length > 0)

                        // Bin-pack: 合計 ≤ 4 なら同じ行にまとめる
                        const catGroups: (typeof cats)[] = []
                        let curGroup: typeof cats = []
                        let curCount = 0
                        for (const cat of cats) {
                            if (curGroup.length === 0 || curCount + cat.items.length <= COLS) {
                                curGroup.push(cat)
                                curCount += cat.items.length
                            } else {
                                catGroups.push(curGroup)
                                curGroup = [cat]
                                curCount = cat.items.length
                            }
                        }
                        if (curGroup.length > 0) catGroups.push(curGroup)

                        return (
                            <div key={field.id} className="space-y-6">
                                {/* Field header */}
                                <div className="flex items-center gap-6">
                                    <div className="h-[2px] flex-1 bg-surface-3" />
                                    <h2 className="text-2xl font-black uppercase tracking-[0.2em]">{field.name}</h2>
                                    <FieldSettings field={field} />
                                    <div className="h-[2px] flex-1 bg-surface-3" />
                                </div>

                                {/* Category groups */}
                                <div className="space-y-10">
                                    {catGroups.map((group, groupIdx) => (
                                        <div key={groupIdx} className="space-y-3">
                                            {/* ラベル行：flex で比例幅（グリッドとは分離） */}
                                            <div className="flex gap-6">
                                                {group.map(cat => (
                                                    <div
                                                        key={cat.label}
                                                        style={{ flex: Math.min(cat.items.length, COLS) }}
                                                        className={`flex items-center justify-center gap-2 pb-2 border-b border-white/10 ${cat.color}`}
                                                    >
                                                        {cat.icon}
                                                        <span className="text-xs font-bold uppercase tracking-widest">{cat.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* アイテム：独立した 4列グリッド */}
                                            <div className="grid grid-cols-4 gap-6">
                                                {group.flatMap(cat => cat.items).map(tb => (
                                                    <TextbookCard key={tb.id} material={tb} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        )
                    })
                )}
            </section>

        </>
    )
}
