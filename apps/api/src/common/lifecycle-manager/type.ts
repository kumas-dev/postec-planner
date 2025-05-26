export type CleanupFn = () => Promise<void> | void
export type InitFn = () => Promise<CleanupFn | void>
