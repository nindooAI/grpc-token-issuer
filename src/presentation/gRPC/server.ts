import grpc from 'grpc'
import { container } from 'tsyringe'
import { IAppConfig } from '../../app.config'
import { Services } from '../../services/Services'
import * as serviceDefinitions from '../../../generated/tokenissuer_grpc_pb'
import { TokenIssuerImplementation } from './implementation/TokenIssuerImplementation'

async function start (config: IAppConfig) {
  container.register('IJwtOptions', { useValue: config.jwt })

  const server = new grpc.Server()
  const services = container.resolve(Services)
  const listenAddress = `${config.server.bindAddress}:${config.server.bindPort}`

  server.addService(serviceDefinitions.TokenIssuerService, new TokenIssuerImplementation(services.token))

  server.bind(listenAddress, grpc.ServerCredentials.createInsecure())

  server.start()
  console.log(`Listening on ${listenAddress}`)
}

export default { start }
