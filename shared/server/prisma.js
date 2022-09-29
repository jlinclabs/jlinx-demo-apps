import { Prisma, PrismaClient } from '@prisma/client'

const client = new PrismaClient()
client.Error = Prisma.PrismaClientKnownRequestError
export default client
