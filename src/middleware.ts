import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const { pathname } = request.nextUrl
    const isAuthPage = pathname.startsWith('/login')
    const isPublicFile = pathname.includes('.') // manifest.json, favicon.ico など

    // 環境変数が設定されていない、または静的ファイルの場合はスキップ
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || isPublicFile) {
        return response
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 未ログインでログインページ以外にいる場合は、ログインページへ
    if (!user && !isAuthPage) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        // クエリパラメータをクリアしてループを防ぐ
        loginUrl.search = ''
        return NextResponse.redirect(loginUrl)
    }

    // ログイン済みでログインページにいる場合は、トップへ
    if (user && isAuthPage) {
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = '/'
        homeUrl.search = ''
        return NextResponse.redirect(homeUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * _next/static, _next/image などを除外
         */
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)',
    ],
}
