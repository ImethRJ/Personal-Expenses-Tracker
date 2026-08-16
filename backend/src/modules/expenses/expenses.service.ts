import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, month?: number, year?: number, categoryId?: string) {
    let whereFilter: any = { userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereFilter.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (categoryId) {
      whereFilter.categoryId = categoryId;
    }

    return this.prisma.expense.findMany({
      where: whereFilter,
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense record not found');
    }

    return expense;
  }

  async create(userId: string, createExpenseDto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        amount: createExpenseDto.amount,
        categoryId: createExpenseDto.categoryId,
        date: new Date(createExpenseDto.date),
        description: createExpenseDto.description,
        paymentMethod: createExpenseDto.paymentMethod || 'Cash',
        userId,
      },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(userId, id);

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...(updateExpenseDto.amount !== undefined && { amount: updateExpenseDto.amount }),
        ...(updateExpenseDto.categoryId && { categoryId: updateExpenseDto.categoryId }),
        ...(updateExpenseDto.date && { date: new Date(updateExpenseDto.date) }),
        ...(updateExpenseDto.description !== undefined && { description: updateExpenseDto.description }),
        ...(updateExpenseDto.paymentMethod && { paymentMethod: updateExpenseDto.paymentMethod }),
      },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
