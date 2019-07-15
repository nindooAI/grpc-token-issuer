import { injectable } from 'tsyringe'
import { TokenService } from './TokenService'

@injectable()
export class Services {
  constructor (
    public readonly token: TokenService
  ) {}
}
