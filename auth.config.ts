import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
    pages: {
        signIn: '/sign-in',
        error: '/sign-in'
    },
    providers: [],
    callbacks: {
        async authorized({ request, auth }) {
            // Array of regex patterns of paths we want to protect
            const protectedPaths = [
                /\/shipping-address/,
                /\/payment-method/,
                /\/place-order/,
                /\/profile/,
                /\/user\/(.*)/,
                /\/order\/(.*)/,
                /\/admin/,
            ]

            // Get pathnames from the req URL object
            const { pathname } = request.nextUrl

            // Check if user is not authenticated and accessing a protected path
            if (!auth && protectedPaths.some((p) => p.test(pathname))) return false

            // Check for session cart cookie
            if (!request.cookies.get('sessionCartId')) {
                const sessionCartId = crypto.randomUUID()

                // Clone the request headers
                const newRequestHeaders = new Headers(request.headers)

                const response = NextResponse.next({
                    request: {
                        headers: newRequestHeaders
                    }
                })
                // Set newly generated sessionCartId in the response cookies
                response.cookies.set('sessionCartId', sessionCartId)

                return response
            } else {
                return true
            }
        }
    }
} satisfies NextAuthConfig
