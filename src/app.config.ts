import env from 'sugar-env'
import { IJwtOptions } from './lib/jwt'

function ensureFeedLine (key: string) {
  return `${key.trim()}\n`
}

export interface IAppConfig {
  server: {
    bindPort: number,
    bindAddress: string
  },
  jwt: IJwtOptions
}

export const config: IAppConfig = {
  server: {
    bindPort: env.get.int('SERVER_BIND_PORT', 3000),
    bindAddress: env.get('SERVER_BIND_ADDRESS', '0.0.0.0')
  },
  jwt: {
    algorithms: ['HS256'],
    secret: ensureFeedLine(env.get.base64('JWT_PRIVATE_KEY_BASE64', '').toString()),
    issuer: env.get('JWT_ISSUER', 'grpc-token-issuer'),
    audience: env.get('JWT_AUDIENCE', 'grpc-token-issuer')
  }
}
