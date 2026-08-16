import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, month?: number, year?: number) {
    let dateFilter: any = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    return this.prisma.income.findMany({
      where: {
        userId,
        ...dateFilter,
      },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const income = await this.prisma.income.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!income) {
      throw new NotFoundException('Income record not found');
    }

    return income;
  }

  async create(userId: string, createIncomeDto: CreateIncomeDto) {
    return this.prisma.income.create({
      data: {
        amount: createIncomeDto.amount,
        source: createIncomeDto.source,
        date: new Date(createIncomeDto.date),
        description: createIncomeDto.description,
        categoryId: createIncomeDto.categoryId,
        userId,
      },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, updateIncomeDto: UpdateIncomeDto) {
    await this.findOne(userId, id);

    return this.prisma.income.update({
      where: { id },
      data: {
        ...(updateIncomeDto.amount !== undefined && { amount: updateIncomeDto.amount }),
        ...(updateIncomeDto.source && { source: updateIncomeDto.source }),
        ...(updateIncomeDto.date && { date: new Date(updateIncomeDto.date) }),
        ...(updateIncomeDto.description !== undefined && { description: updateIncomeDto.description }),
        ...(updateIncomeDto.categoryId !== undefined && { categoryId: updateIncomeDto.categoryId }),
      },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.income.delete({
      where: { id },
    });
  }
}
