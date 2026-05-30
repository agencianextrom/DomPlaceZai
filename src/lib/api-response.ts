/**
 * DomPlace - Standardized API response helpers
 * Provides consistent response formatting across all API routes
 */

import { NextResponse } from 'next/server'

interface SuccessResponse<T = unknown> {
  success: true
  data?: T
  message?: string
}

interface ErrorResponse {
  success: false
  error: string
  code?: string
}

type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

/**
 * Return a successful JSON response
 */
export function apiSuccess<T>(data?: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, data }
  if (message) body.message = message
  return NextResponse.json(body, { status })
}

/**
 * Return an error JSON response
 */
export function apiError(message: string, status: number, code?: string) {
  const body: ErrorResponse = { success: false, error: message }
  if (code) body.code = code
  return NextResponse.json(body, { status })
}

/**
 * Helper to extract a safe error message from unknown error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Erro interno do servidor. Tente novamente.'
}

/**
 * HTTP status codes convenience constants
 */
export const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const
