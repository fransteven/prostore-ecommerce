'use client'
import { CartItem } from '@/types'
import React from 'react'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { addItemToCart } from '@/lib/actions/cart.actions'
import { useRouter } from 'next/navigation'


function AddToCart({ item }: { item: CartItem }) {
    const router = useRouter()

    const handleAddToCart = async () => {
        const res = await addItemToCart(item)
        if (!res.success) {
            toast.error(res.message)
            return
        }
        toast.success(`${item.name} added to cart!`, {
            action: (
                <Button className='bg-primary text-white cursor-pointer hover:bg-gray-800 ' onClick={() => router.push('/cart')}>
                    Go to Cart
                </Button>
            )
        })

    }
    return (
        <Button className='w-full cursor-pointer' type='button' onClick={handleAddToCart}>
            Add to Cart
        </Button>
    )
}

export default AddToCart
