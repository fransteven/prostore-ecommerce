"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithCredentials } from "@/lib/actions/user.actions"
import { sigInDefaultValues } from "@/lib/constants"
import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

function CredentialsSigninForm() {

    const [data, action] = useActionState(signInWithCredentials, {
        success: false,
        message: ""
    })

    const SigInButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} className="w-full" variant='default' >
                {pending ? 'Sig In...' : 'Sig In'}
            </Button>
        )
    }

    return (
        <form action={action}>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        defaultValue={sigInDefaultValues.email}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="password"
                        defaultValue={sigInDefaultValues.password}
                    />
                </div>
                <div>
                    <SigInButton />
                </div>
                {data && !data.success && (
                    <div className="text-center text-destructive">{data.message}</div>
                )}
                <div className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up" target="_self" className="link font-semibold text-primary hover:underline">
                        Sign Up
                    </Link>
                </div>
            </div>
        </form>
    )
}

export default CredentialsSigninForm
