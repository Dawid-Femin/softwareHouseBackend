import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  create(email: string, hashedPassword: string, role = UserRole.CLIENT): Promise<User> {
    return this.repo.save(this.repo.create({ email, password: hashedPassword, role }));
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    const hashed = token ? await bcrypt.hash(token, 10) : null;
    await this.repo.update(id, { refreshToken: hashed });
  }
}
