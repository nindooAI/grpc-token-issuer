const RsaKey = require('rsa-key')
import { injectable, inject } from 'tsyringe'
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken'

/**
 * @property secret - Private key used for signing tokens
 * @property algorithms - Name of the JWT algorithms
 * @property issuer - Value of "iss" claim
 * @property audience - Default "aud" claim
 */
export interface IJwtOptions {
  secret: string,
  algorithms: string[],
  issuer: string,
  audience: string
}

/**
 * Handles JWT signing and validation
 */
@injectable()
 export class Jwt {
  private secret: string
  private algorithms: string[]
  private issuer: string
  private audience: string
  private key: typeof RsaKey

  /**
   * @param config - JWT config options
   */
  constructor (@inject('IJwtOptions') { secret, algorithms, issuer, audience }: IJwtOptions) {
    this.secret = secret
    this.algorithms = algorithms
    this.issuer = issuer
    this.audience = audience
    this.key = new RsaKey(secret)
  }

  private getRawSignOptions (): SignOptions {
    return {
      algorithm: this.algorithms[0],
      keyid: this.key.getFingerprint()
    }
  }

  private getSignOptions (subject: string, audience: string, ttl: number): SignOptions {
    return {
      algorithm: this.algorithms[0],
      audience,
      expiresIn: ttl,
      issuer: this.issuer,
      subject,
      keyid: this.key.getFingerprint()
    }
  }

  private getVerifyOptions (): VerifyOptions {
    return {
      algorithms: this.algorithms,
      audience: this.audience,
      issuer: this.issuer
    }
  }

  /**
   * Creates a new signed JWT
   * @param subject - Unique id of the subject of the token ("sub" claim)
   * @param scopes - Scope or list of scopes ("scope" claim)
   * @param ttl - Amount of seconds the token should be valid for
   * @param audience - Value of "aud" claim
   * @param extraData - Any extra properties that should be encoded into the token
   * @returns Valid signed JWT
   */
  async sign (subject: string, ttl: number, payload: Record<string, any>, audience?: string): Promise<string> {
    const options = this.getSignOptions(subject, audience || this.audience, ttl)

    return jwt.sign(payload, this.secret, options)
  }

  async signRaw (payload: string): Promise<string> {
    const options = this.getRawSignOptions()

    return jwt.sign(payload, this.secret, options)
  }

  /**
   * Checks wether a token is valid
   * @param token - Token to be verified
   * @returns true if given token is valid; false otherwise
   */
  async verify (token: string): Promise<boolean> {
    const options = this.getVerifyOptions()

    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, options, (err) => {
        if (err) return reject(err)
        resolve(true)
      })
    })
  }

  getPublicKey () {
    const publicKeyString = this.key.exportKey('public', 'pem')
    const publicKey = Buffer.from(publicKeyString, 'utf8').toString('base64')

    return {
      publicKey,
      kid: this.key.getFingerprint()
    }
  }
}
