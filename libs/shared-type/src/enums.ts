export const PERMISSIONS = ['admin', 'common'] as const
export type Permission = (typeof PERMISSIONS)[number]
