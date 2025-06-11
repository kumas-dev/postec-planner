import { z } from 'zod'

export const SignInSchema = z.object({ id: z.string(), password: z.string() })

export type SignInDto = z.infer<typeof SignInSchema>

export type SignInInput = z.input<typeof SignInSchema>

export const RefreshTokenSchema = z.object({ token: z.string() })

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>

export type RefreshTokenInput = z.input<typeof RefreshTokenSchema>
