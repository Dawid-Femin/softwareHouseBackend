import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User, UserRole } from '../users/user.entity';

dotenv.config();

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  await ds.initialize();

  const repo = ds.getRepository(User);
  const existing = await repo.findOneBy({ email });

  if (existing) {
    console.log(`Admin ${email} already exists.`);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await repo.save(repo.create({ email, password: hashed, role: UserRole.ADMIN }));
    console.log(`Admin ${email} created.`);
  }

  await ds.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
