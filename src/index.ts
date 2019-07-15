import 'reflect-metadata'
import { config } from './app.config'
import server from './presentation/gRPC/server'

server.start(config)
