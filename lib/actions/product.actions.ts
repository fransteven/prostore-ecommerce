"use server"
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
import { prisma } from "@/db/prisma";

export async function getProducts() {
    const products = await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy: { createdAt: "desc" }
    });

    return convertToPlainObject(products);
}

export async function getProductBySlug(slug: string) {
    const product = await prisma.product.findFirst({
        where: {
            slug
        }
    })

    return convertToPlainObject(product);
}
