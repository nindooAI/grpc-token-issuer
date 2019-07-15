import { injectable } from 'tsyringe'
import { TokenService } from '../../../services/TokenService'
import { ITokenIssuerServer } from '../../../../generated/tokenissuer_grpc_pb'
import { Token, VerifyResponse, PublicKey } from '../../../../generated/tokenissuer_pb'

@injectable()
export class TokenIssuerImplementation implements ITokenIssuerServer {
  constructor (
    private readonly tokenService: TokenService
  ) { }

  sign: ITokenIssuerServer[ 'sign' ] = (call, callback) => {
    const { payload, subject, ttl, audience, israw } = call.request.toObject(false)

    this.tokenService.sign({ payload, subject, ttl, audience, israw })
      .then(token => {
        const response = new Token()
        response.setToken(token)
        callback(null, response)
      })
      .catch(err => {
        callback(err, null)
      })
  }

  verify: ITokenIssuerServer['verify'] = (call, callback) => {
    const token = call.request.getToken()

    this.tokenService.verify(token)
      .then(() => {
        const response = new VerifyResponse()
        response.setIsvalid(true)
        callback(null, response)
      })
      .catch(err => {
        const response = new VerifyResponse()
        response.setIsvalid(false)
        response.setError(err.message)
        callback(null, response)
      })
  }

  getPublicKey: ITokenIssuerServer['getPublicKey'] = (_, callback) => {
    const response = new PublicKey()
    const { publicKey, kid } = this.tokenService.getPublicKey()
    response.setKid(kid)
    response.setPublickeybase64(publicKey)
    callback(null, response)
  }
}
