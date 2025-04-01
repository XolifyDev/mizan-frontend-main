import { z } from 'zod';

export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive().default(1), // Default quantity is 1
  imagesrc: z.string(),
  productId: z.string()
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const validateCartItem = (item: unknown): CartItem => {
  try {
    return cartItemSchema.parse(item);
  } catch (error) {
    throw new Error('Invalid cart item');
  }
};
