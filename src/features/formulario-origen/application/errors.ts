export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}
export function toErrorResponse(error: unknown) {
  if (error instanceof ApplicationError) {
    return {
      status: error.status,
      body: {
        ok: false as const,
        code: error.code,
        error: error.message,
        details: error.details,
      },
    };
  }

  return {
    status: 500,
    body: {
      ok: false as const,
      code: 'INTERNAL_ERROR',
      error: error instanceof Error ? error.message : 'Error interno.',
    },
  };
}
