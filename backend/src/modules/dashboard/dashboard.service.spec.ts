import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    income: {
      findMany: jest.fn(),
    },
    expense: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate Net Balance = Total Income - Total Expenses correctly', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      currency: 'LKR',
      savingsGoal: 50000,
    });

    // Mock Income = 100,000 LKR
    mockPrismaService.income.findMany.mockResolvedValue([
      { amount: 100000, source: 'Salary', date: new Date() },
    ]);

    // Mock Expenses = 25,000 LKR (Food)
    mockPrismaService.expense.findMany.mockResolvedValue([
      { amount: 25000, categoryId: 'cat-1', category: { name: 'Food & Dining', color: '#f59e0b', icon: 'utensils' }, date: new Date() },
    ]);

    const summary = await service.getSummary('user-1', 8, 2026);

    expect(summary.summary.totalIncome).toBe(100000);
    expect(summary.summary.totalExpenses).toBe(25000);
    expect(summary.summary.currentNetBalance).toBe(75000); // 100,000 - 25,000 = 75,000 LKR
    expect(summary.summary.expenseRatio).toBe(25); // 25,000 / 100,000 * 100 = 25%
  });

  it('should update Net Balance dynamically when expense increases', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      currency: 'USD',
      savingsGoal: 1000,
    });

    // Income = $2,500
    mockPrismaService.income.findMany.mockResolvedValue([
      { amount: 2500, source: 'Salary', date: new Date() },
    ]);

    // Expenses = $800 + $100 = $900
    mockPrismaService.expense.findMany.mockResolvedValue([
      { amount: 800, categoryId: 'cat-1', category: { name: 'Rent', color: '#ef4444', icon: 'home' }, date: new Date() },
      { amount: 100, categoryId: 'cat-2', category: { name: 'Subscriptions', color: '#8b5cf6', icon: 'smartphone' }, date: new Date() },
    ]);

    const summary = await service.getSummary('user-2', 8, 2026);

    expect(summary.summary.totalIncome).toBe(2500);
    expect(summary.summary.totalExpenses).toBe(900);
    expect(summary.summary.currentNetBalance).toBe(1600); // $2,500 - $900 = $1,600
    expect(summary.summary.expenseRatio).toBe(36); // 900 / 2500 * 100 = 36%
  });
});
