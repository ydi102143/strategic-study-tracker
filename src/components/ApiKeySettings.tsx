'use client'

import { useState, useTransition, useEffect } from 'react'
import { Settings, Key, X, Check, Eye, EyeOff, ExternalLink, Loader2, AlertTriangle } from 'lucide-react'
import { saveUserApiKey } from '@/app/actions'

interface ApiKeySettingsProps {
  initialMaskedKey: string | null
}

export function ApiKeySettings({ initialMaskedKey }: ApiKeySettingsProps) {
  const isRequired = !initialMaskedKey  // キー未設定 = 必須フラグ
  const [open, setOpen] = useState(isRequired)  // 未設定なら即座に開く
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [maskedKey, setMaskedKey] = useState(initialMaskedKey)
  const [required, setRequired] = useState(isRequired)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleClose = () => {
    if (required) return  // 未設定時は閉じられない
    setOpen(false)
    setApiKey('')
    setError(null)
    setSuccess(false)
  }

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください')
      return
    }
    if (!apiKey.trim().startsWith('AIza')) {
      setError('有効なGemini APIキーを入力してください（AIzaで始まる文字列）')
      return
    }
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      try {
        await saveUserApiKey(apiKey)
        const k = apiKey.trim()
        const masked = k.length <= 8
          ? '••••••••'
          : k.substring(0, 6) + '••••••••' + k.substring(k.length - 4)
        setMaskedKey(masked)
        setRequired(false)  // 設定完了 → 必須フラグ解除
        setApiKey('')
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setOpen(false)  // 保存後に自動で閉じる
        }, 1500)
      } catch (e) {
        setError('保存に失敗しました。もう一度お試しください。')
      }
    })
  }

  return (
    <>
      {/* Settings Button（設定済み時のみ表示） */}
      {!required && (
        <button
          id="api-key-settings-btn"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          title="AI APIキー設定"
        >
          <Settings size={16} />
          <span className="hidden sm:inline">設定</span>
        </button>
      )}

      {/* 未設定時 警告バッジ */}
      {required && !open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400/20 transition-all duration-200 animate-pulse"
          title="APIキーを設定してください"
        >
          <AlertTriangle size={16} />
          <span className="hidden sm:inline">APIキー未設定</span>
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !required) handleClose() }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
              borderColor: required ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'
            }}
          >
            {/* 必須時バナー */}
            {required && (
              <div className="flex items-center gap-3 px-6 py-3 rounded-t-2xl bg-yellow-500/15 border-b border-yellow-500/20">
                <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
                <p className="text-yellow-300 text-sm font-medium">
                  AIを使うには個人のGemini APIキーが必要です
                </p>
              </div>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ background: 'rgba(59,130,246,0.2)' }}>
                    <Key size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {required ? 'APIキーを設定してください' : 'AI APIキー設定'}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {required
                        ? '設定するまでAI機能は使用できません'
                        : '現在のGemini APIキーを変更できます'}
                    </p>
                  </div>
                </div>
                {/* 設定済みのみ閉じるボタン表示 */}
                {!required && (
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Current Key Status（設定済みの場合のみ） */}
              {maskedKey && !required && (
                <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">現在のAPIキー</p>
                  <p className="text-sm font-mono text-gray-200">{maskedKey}</p>
                </div>
              )}

              {/* Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Gemini APIキーを入力
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="gemini-api-key-input"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setError(null) }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="AIzaSy..."
                    autoFocus={required}
                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 outline-none transition-all font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`,
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <X size={12} /> {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    <Check size={12} /> 保存しました！
                  </p>
                )}

                <button
                  id="save-api-key-btn"
                  onClick={handleSave}
                  disabled={isPending || !apiKey.trim()}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  {isPending
                    ? <><Loader2 size={16} className="animate-spin" /> 保存中...</>
                    : <><Check size={16} /> 保存して使い始める</>}
                </button>
              </div>

              {/* Help */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                <p className="text-xs text-gray-400">
                  APIキーの取得方法：
                </p>
                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                  <li>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      Google AI Studio <ExternalLink size={10} />
                    </a>
                    {' '}を開く
                  </li>
                  <li>「APIキーを作成」をクリック</li>
                  <li>生成されたキー（AIzaで始まる）をコピーして貼り付け</li>
                </ol>
                <p className="text-xs text-gray-600 mt-2">
                  ※ キーはあなた専用としてのみ保存されます。他メンバーには共有されません。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
