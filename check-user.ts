import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

async function checkUser() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:R0dCeVyBIZ91OZ3d@db.mcwyvleqgkatyhgujrdx.supabase.co:5432/postgres'
  })

  const prisma = new PrismaClient({ adapter })

  const user = await prisma.user.findUnique({
    where: { email: 'brightbunhu4@gmail.com' },
    include: { roles: true }
  })

  console.log('User:', JSON.stringify(user, null, 2))

  if (user && user.passwordHash) {
    const testPassword = '12345678Tee?'
    const isValid = await bcrypt.compare(testPassword, user.passwordHash)
    console.log('Password valid:', isValid)
  }

  await prisma.$disconnect()
}

checkUser()
