'use client'

import { useState } from 'react'
import { login, signup } from '@/app/actions'
import { Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        try {
            if (isLogin) {
                await login(formData)
            } else {
                await signup(formData)
            }
        } catch (err: any) {
            // Next.js redirect errors should be re-thrown so the framework can handle them
            if (err.message === 'NEXT_REDIRECT' || err.digest?.startsWith('NEXT_REDIRECT')) {
                throw err
            }
            setError(err.message)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-12 bg-surface-1 p-10 rounded-3xl border border-surface-3 shadow-2xl">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-center mb-2">Study Tracker</h1>
                    <p className="text-center text-gray-400 font-medium">
                        {isLogin ? '学習の進捗を同期しましょう' : '新しいアカウントを作成します'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-950/30 border border-red-900 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full bg-surface-2 border border-surface-3 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-white/50 transition-all font-medium"
                                placeholder="メールアドレス"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full bg-surface-2 border border-surface-3 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-white/50 transition-all font-medium"
                                placeholder="パスワード"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-4 px-4 bg-white text-black text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isLoading ? (
                                '処理中...'
                            ) : isLogin ? (
                                <span className="flex items-center gap-2">
                                    <LogIn size={18} /> ログイン
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <UserPlus size={18} /> アカウント作成
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center border-t border-surface-3 pt-8 mt-2">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError(null)
                        }}
                        className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        {isLogin ? '新規アカウント登録はこちら' : '既にアカウントをお持ちの方はこちら'}
                    </button>
                </div>
            </div>
        </div>
    )
}
