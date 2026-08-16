import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryType } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, type?: CategoryType) {
    return this.prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId },
        ],
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
        isDefault: false,
      },
    });
  }
}
