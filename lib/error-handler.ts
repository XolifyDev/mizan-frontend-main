import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR", details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: "A record with this information already exists",
            code: "DUPLICATE_RECORD",
          },
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          {
            error: "Record not found",
            code: "RECORD_NOT_FOUND",
          },
          { status: 404 }
        );
      case "P2003":
        return NextResponse.json(
          {
            error: "Foreign key constraint failed",
            code: "FOREIGN_KEY_CONSTRAINT",
          },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          {
            error: "Database operation failed",
            code: "DATABASE_ERROR",
          },
          { status: 500 }
        );
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        code: "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}

export function createApiResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

export function createErrorResponse(error: ApiError) {
  return NextResponse.json({
    success: false,
    error: error.message,
    code: error.code,
    details: error.details,
  }, { status: error.statusCode });
}
