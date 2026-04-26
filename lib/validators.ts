import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const currency = z.string().refine((value)=> /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))), "Price must have exactly two decimal places.")

export const insertProductSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters"),
    category: z.string().min(3, "Category must be at least 3 characters"),
    brand: z.string().min(3, "Brand must be at least 3 characters"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    stock: z.coerce.number(),
    images: z.array(z.string()).min(1, "Images must be at least 1 image"),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency
});

//Schema for signin users in
export const signInFormSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
})

//Schema for signup users in
export const signUpFormSchema = z.object({
    name: z.string().min(3,'Name must be at least 3 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
}).refine((data)=> data.confirmPassword === data.password, {
    message: 'Password dont match',
    path: ['confirmPassword']
});


// Cart Schemas
export const cartItemSchema = z.object({
    productId: z.string().min(1, 'Product is required'),
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    qty: z.number().int().nonnegative('Quantity must be a positive number'),
    image: z.string().min(1, 'Image is required'),
    price: currency
});

export const insertCartSchema = z.object({
    items: z.array(cartItemSchema),
    itemsPrice: currency, // Subtotal: suma del costo de todos los productos (precio * cantidad)
    shippingPrice: currency, // Costo de envío
    taxPrice: currency,
    totalPrice: currency, // Total final a pagar: itemsPrice + shippingPrice + taxPrice
    sessionCartId: z.string().min(1,'Session cart id is required'),
    userId: z.string().optional().nullable()
});

