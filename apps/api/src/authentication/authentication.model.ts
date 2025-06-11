export type AuthenticationEntity = {
  id: string
  employeeId: string
  accessToken: string
  refreshToken: string
  generatedAt: Date
  expiredAt?: Date
}
