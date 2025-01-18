import { BlueBerryServer } from '../src'
import { container } from '@sapphire/framework'

new BlueBerryServer(container, 8080).start()
