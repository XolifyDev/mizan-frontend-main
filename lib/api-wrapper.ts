import { NextRequest, NextResponse } from "next/server";
import { handleApiError, AppError } from "./error-handler";

type ApiHandler = (request: NextRequest, context?: any) => Promise<NextResponse>;

export function withErrorHandling(handler: ApiHandler) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function withAuth(handler: ApiHandler) {
  return withErrorHandling(async (request: NextRequest, context?: any) => {
    // Add authentication logic here
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }
    
    return await handler(request, context);
  });
}

export function withValidation<T>(schema: any, handler: (data: T, request: NextRequest, context?: any) => Promise<NextResponse>) {
  return withErrorHandling(async (request: NextRequest, context?: any) => {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return await handler(validatedData, request, context);
  });
}

export function withRateLimit(handler: ApiHandler, options: { max: number; window: number } = { max: 100, window: 60 }) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return withErrorHandling(async (request: NextRequest, context?: any) => {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = options.window * 1000;
    
    const record = requests.get(ip);
    
    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (record.count >= options.max) {
      throw new AppError("Too many requests", 429, "RATE_LIMIT_EXCEEDED");
    } else {
      record.count++;
    }
    
    return await handler(request, context);
  });
}

export function withCaching(handler: ApiHandler, options: { maxAge: number } = { maxAge: 300 }) {
  return withErrorHandling(async (request: NextRequest, context?: any) => {
    const response = await handler(request, context);
    
    if (response.status === 200) {
      response.headers.set("Cache-Control", `public, max-age=${options.maxAge}`);
    }
    
    return response;
  });
}
