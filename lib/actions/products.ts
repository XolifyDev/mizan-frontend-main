"use server";

import { Product } from "@prisma/client";
import { prisma } from "../db";

// Function to get all products
export async function getProducts() {
  const products = await prisma.product.findMany();

  return products || [];;
}

// Function to get a product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      id
    }
  });

  return product || null;
}

export async function getProductByURL(url: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      url
    }
  });

  return product || null;
}

// Function to get related products (excluding the current product)
export async function getRelatedProducts(id: string, limit = 3): Promise<Product[]> {
  const products = await getProducts();
  const product = products.find((e) => e.id === id);

  if(!product) return [];

  return products
    .filter((p) => p.id !== id)
    .filter((p) => p.category === product.category)
    .slice(0, limit);
}

