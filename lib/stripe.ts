import Stripe from "stripe";
import { SquareClient, SquareEnvironment, SquareError } from "square";

/**
 * Lazily-constructed SDK clients.
 *
 * These were previously built at module scope:
 *
 *   export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)
 *
 * The `!` satisfies TypeScript but does nothing at runtime — if the variable is
 * missing in an environment, the constructor throws during module evaluation,
 * and every page that imports this file (directly or transitively) fails to
 * render with an opaque "server-side exception". A missing key should surface
 * when the client is actually used, in a message that names the variable.
 *
 * The Proxy keeps the original `stripeClient.x.y()` call shape, so no caller
 * needs to change.
 */

function lazy<T extends object>(name: string, make: () => T): T {
  let instance: T | null = null;
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      if (!instance) {
        try {
          instance = make();
        } catch (e: any) {
          throw new Error(
            `${name} could not be initialised — check its environment variables. ${e?.message ?? ""}`
          );
        }
      }
      const value = Reflect.get(instance as object, prop, receiver);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}

export const stripeClient = lazy("Stripe", () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
});

export const squareClient = lazy("Square", () => {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not set");
  return new SquareClient({
    token,
    environment: SquareEnvironment.Sandbox,
  });
});

export { SquareError };
