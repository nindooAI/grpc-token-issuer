import { Jwt } from '../lib/jwt'
import { injectable } from 'tsyringe'

export type SignParams = {
  ttl: number
  subject: string
  payload: string
  audience: string,
  israw: boolean
}

@injectable()
export class TokenService {
  constructor (
    private readonly jwt: Jwt
  ) { }

  async sign ({payload, audience, subject, ttl, israw}: SignParams) {
    if (israw) return this.signRaw(payload)

    return this.jwt.sign(subject, ttl, JSON.parse(payload), audience ? audience : undefined)
  }

  async signRaw (payload: string) {
    return this.jwt.signRaw(payload)
  }

  async verify (token: string) {
    return this.jwt.verify(token)
  }

  getPublicKey () {
    return this.jwt.getPublicKey()
  }
}
