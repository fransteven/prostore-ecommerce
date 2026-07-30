"use server";

import { auth, signIn, signOut } from "@/auth";
import { paymentMethodSchema, shippingAddressSchema, signInFormSchema, signUpFormSchema } from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {hashSync} from 'bcrypt-ts-edge'
import {prisma} from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddressType } from "@/types";
import z, { success } from "zod";

export async function signInWithCredentials(prevState:unknown, formData: FormData) {
    try {
        const user = signInFormSchema.parse({
            email: formData.get('email'),
            password: formData.get('password')
        })
        await signIn('credentials', user)
        return {success: true, message: 'Signed in successfully'}
    } catch (error) {
        if(isRedirectError(error)){
            throw error
        }
        return {success: false, message: formatError(error)}
    }
}

export async function signOutUser(){
    await signOut()
}

export async function signUpUser(prevState:unknown, formData: FormData) {
    try {
        const user = signUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        })
        const plainPassword = user.password
        user.password = hashSync(user.password,10)
        await prisma.user.create({
            data: {
                name:user.name,
                email:user.email,
                password:user.password
            }
        })
        await signIn('credentials', {
            email: user.email,
            password: plainPassword
        })
        return {success: true, message: 'User created successfully'}
    } catch (error) {
        if(isRedirectError(error)){
            throw error
        }
        return {success: false, message: formatError(error)}
    }
}


// Get user by ID
export async function getUserById(userId:string) {
    const user = await prisma.user.findFirst({
        where: {id: userId}
    })
    if(!user) throw new Error('User not found')
    return user
}


// Update User Addres
export async function updateUserAddress(data:ShippingAddressType) {
    try {
        const session = await auth()
        const currentUser = await prisma.user.findFirst({
            where:{id: session?.user?.id}
        })
        if(!currentUser) throw new Error("User not found")
        const address = shippingAddressSchema.parse(data)
        await prisma.user.update({
            where:{id:currentUser.id},
            data: {address}
        })
        return {success: true, message: 'User updated successfully'}
    } catch (error) {
        return {success:false, message: formatError(error)}
    }
}

// Update user's payment method
export async function updateUserPaymentMethod(data:z.infer<typeof paymentMethodSchema>) {
    try {
        const session = await auth()
        const currentUser = await prisma.user.findFirst({
            where: {id: session?.user?.id}
        })
        if(!currentUser) throw new Error('User not found')

        const paymentMethod = paymentMethodSchema.parse(data)

        await prisma.user.update({
            where:{id:currentUser.id},
            data: {paymentMethod: paymentMethod.type}
        })
        return {
            success: true, message: 'User updated successfully'
        }

    } catch (error) {
        return {success: false, message: formatError(error)}
    }
}

// Update the user profile
export async function updateProfile(user:{name:string, email:string}) {
    try {
        const session = await auth()

        const currentUser = await prisma.user.findFirst({
            where: {
                id: session?.user?.id
            },
        })
        if(!currentUser) throw new Error('User not found')
        await prisma.user.update({
            where:{
                id: currentUser.id
            },
            data:{
                name: user.name
            }
        })

    } catch (error) {
        return {success: false, message:formatError(error)}
    }
}
