import { randomUUID, runBasicTests } from "@next-auth/adapter-test"
import { PrismaClient } from "@prisma/client"
import { PrismaAdapter } from "../src"
import { ObjectId } from "mongodb"
const prisma = new PrismaClient()

runBasicTests({
  adapter: PrismaAdapter(prisma),
  db: {
    id() {
      if (process.env.CONTAINER_NAME === "next-auth-mongodb-test") {
        return new ObjectId().toHexString()
      }
      return randomUUID()
    },
    connect: async () => {
      await Promise.all([
        prisma.user.deleteMany({}),
        prisma.account.deleteMany({}),
        prisma.session.deleteMany({}),
        prisma.verificationToken.deleteMany({}),
      ])
    },
    disconnect: async () => {
      await Promise.all([
        prisma.user.deleteMany({}),
        prisma.account.deleteMany({}),
        prisma.session.deleteMany({}),
        prisma.verificationToken.deleteMany({}),
      ])
      await prisma.$disconnect()
    },
    user: (id) => prisma.user.findUnique({ where: { id } }),
    account: (provider_providerAccountId) =>
      prisma.account.findUnique({ where: { provider_providerAccountId } }),
    session: (sessionToken) =>
      prisma.session.findUnique({ where: { sessionToken } }),
    async verificationToken(identifier_token) {
      const result = await prisma.verificationToken.findUnique({
        where: { identifier_token },
      })
      if (!result) return null
      // @ts-ignore // MongoDB needs an ID, but we don't
      delete result.id
      return result
    },
  },
})
