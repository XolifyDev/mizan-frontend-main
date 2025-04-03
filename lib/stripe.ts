import Stripe from "stripe"
import { SquareClient, SquareEnvironment, SquareError } from "square";

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: SquareEnvironment.Sandbox
})
