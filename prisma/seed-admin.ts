import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:R0dCeVyBIZ91OZ3d@db.mcwyvleqgkatyhgujrdx.supabase.co:5432/postgres'
})

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
})

async function main() {
  const email = 'brightbunhu4@gmail.com'
  const password = '12345678Tee?'
  const name = 'Admin User'

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 12)

  // Create or update the user
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name },
    create: {
      email,
      name,
      passwordHash,
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })

  console.log('User created/updated:', user.email)

  // Create or get the ADMIN role
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Full system administrator with all permissions',
      permissions: JSON.stringify([
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'products.create',
        'products.read',
        'products.update',
        'products.delete',
        'orders.create',
        'orders.read',
        'orders.update',
        'orders.delete',
        'reports.read',
        'reports.export',
        'roles.manage',
        'system.settings',
      ]),
    },
  })

  console.log('Admin role:', adminRole.name)

  // Assign ADMIN role to the user
  const existingRole = await prisma.role.findFirst({
    where: {
      name: 'ADMIN',
      users: {
        some: { id: user.id },
      },
    },
  })

  if (!existingRole) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        roles: {
          connect: { id: adminRole.id },
        },
      },
    })
    console.log('ADMIN role assigned to user')
  } else {
    console.log('User already has ADMIN role')
  }

  console.log('\n✅ Admin account created successfully!')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
