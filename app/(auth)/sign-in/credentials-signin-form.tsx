"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sigInDefaultValues } from "@/lib/constants"
import Link from "next/link"

function CredentialsSigninForm() {
    return (
        <form>
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
                    <Button type="submit" className="w-full" variant='default'>
                        Sign In
                    </Button>
                </div>
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
