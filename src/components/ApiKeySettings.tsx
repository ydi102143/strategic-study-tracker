'use client'

import { useState, useTransition } from 'react'
import { Settings, Key, X, Check, Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react'
import { saveUserApiKey } from '@/app/actions'

interface ApiKeySettingsProps {
  initialMaskedKey: string | null
}

export function ApiKeySettings({ initialMaskedKey }: ApiKeySettingsProps) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [maskedKey, setMaskedKey] = useState(initialMaskedKey)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください')
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
        setApiKey('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (e) {
        setError('保存に失敗しました。もう一度お試しください。')
      }
    })
  }

  return (
    <>
      {/* Settings Button */}
      <button
        id="api-key-settings-btn"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
        title="AI APIキー設定"
      >
        <Settings size={16} />
        <span className="hidden sm:inline">設定</span>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <Key size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI APIキー設定</h2>
                  <p className="text-xs text-gray-400">Gemini API Key を登録してください</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Key Status */}
            <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">現在のAPIキー</p>
              <p className="text-sm font-mono text-gray-200">
                {maskedKey ?? (
                  <span className="text-yellow-500 text-xs">未設定 — 共有キーが使用されます</span>
                )}
              </p>
            </div>

            {/* Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                新しいAPIキーを入力
              </label>
              <div className="relative">
                <input
                  id="gemini-api-key-input"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="AIza..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error / Success */}
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

              {/* Save Button */}
              <button
                id="save-api-key-btn"
                onClick={handleSave}
                disabled={isPending || !apiKey.trim()}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                {isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> 保存中...</>
                ) : (
                  <><Check size={16} /> 保存する</>
                )}
              </button>
            </div>

            {/* Help Link */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500">
                Gemini API Key は{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Google AI Studio <ExternalLink size={10} />
                </a>
                {' '}から無料で取得できます。
                <br />
                <span className="text-gray-600">
                  ※ キーはあなたのユーザーデータとしてのみ保存され、他のメンバーには共有されません。
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
