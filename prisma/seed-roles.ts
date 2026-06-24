import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:R0dCeVyBIZ91OZ3d@db.mcwyvleqgkatyhgujrdx.supabase.co:5432/postgres'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Create MANAGER role
  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Store manager with inventory and staff management access',
      permissions: JSON.stringify([
        'products.read',
        'products.update',
        'orders.read',
        'orders.update',
        'inventory.read',
        'inventory.update',
        'staff.read',
        'reports.read',
      ]),
    },
  })

  console.log('✅ MANAGER role created:', managerRole.name)

  // Create SALES role
  const salesRole = await prisma.role.upsert({
    where: { name: 'SALES' },
    update: {},
    create: {
      name: 'SALES',
      description: 'Sales team member with order and lead management access',
      permissions: JSON.stringify([
        'products.read',
        'orders.create',
        'orders.read',
        'orders.update',
        'leads.create',
        'leads.read',
        'leads.update',
        'customers.read',
      ]),
    },
  })

  console.log('✅ SALES role created:', salesRole.name)

  // Verify all roles
  const allRoles = await prisma.role.findMany()
  console.log('\n📋 All available roles:')
  allRoles.forEach(role => {
    console.log(`  - ${role.name}: ${role.description || 'No description'}`)
  })

  await prisma.$disconnect()
}

main()
