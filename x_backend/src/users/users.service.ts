import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, name: string, password: string) {
    return this.prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
  }

 async findAll() {
    return this.prisma.user.findMany();
  }
}