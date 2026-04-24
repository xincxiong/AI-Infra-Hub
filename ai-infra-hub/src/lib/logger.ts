// Centralized error tracking for production API routes

export function logApiError(endpoint: string, error: unknown, context?: Record<string, string>): void {
  const errorObj = error instanceof Error ? error : new Error(String(error))
  
  const logEntry = {
    level: 'error',
    timestamp: new Date().toISOString(),
    endpoint,
    message: errorObj.message,
    stack: errorObj.stack,
    context,
  }
  
  console.error(JSON.stringify(logEntry))
}

export function logApiWarning(endpoint: string, message: string, context?: Record<string, string>): void {
  const logEntry = {
    level: 'warning',
    timestamp: new Date().toISOString(),
    endpoint,
    message,
    context,
  }
  
  console.warn(JSON.stringify(logEntry))
}
