import path from 'node:path'
import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:pg123@localhost:5432/sma0_asikjuga',
  },
  migrate: {
    adapter: async () => {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      return new PrismaPg({
        url: process.env.DATABASE_URL,
      })
    },
  },
  migrations: {
    seed: 'ts-node ./prisma/seed.ts',
  },
})