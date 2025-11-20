import 'dotenv/config';
import { db } from './db';
import { users } from '@shared/schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create demo users
    const demoUsers = [
      {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin' as const,
        status: 'active' as const,
        profileImageUrl: null,
      },
      {
        email: 'manager@example.com',
        firstName: 'Manager',
        lastName: 'Smith',
        role: 'manager' as const,
        status: 'active' as const,
        profileImageUrl: null,
      },
      {
        email: 'employee@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'employee' as const,
        status: 'active' as const,
        profileImageUrl: null,
      },
      {
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'employee' as const,
        status: 'active' as const,
        profileImageUrl: null,
      },
    ];

    for (const user of demoUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
      console.log(`✓ Created user: ${user.email} (${user.role})`);
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Demo Users:');
    console.log('  - admin@example.com (Admin)');
    console.log('  - manager@example.com (Manager)');
    console.log('  - employee@example.com (Employee)');
    console.log('  - jane@example.com (Employee)');
    console.log('\n🔑 Password: Use any password (development mode)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
