import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

const defaultExpenseCategories = [
  { name: 'Food & Dining', icon: 'utensils', color: '#f59e0b', type: CategoryType.EXPENSE, isDefault: true },
  { name: 'Transport', icon: 'car', color: '#3b82f6', type: CategoryType.EXPENSE, isDefault: true },
  { name: 'Subscriptions', icon: 'smartphone', color: '#8b5cf6', type: CategoryType.EXPENSE, isDefault: true },
  { name: 'Housing', icon: 'home', color: '#ef4444', type: CategoryType.EXPENSE, isDefault: true },
  { name: 'Shopping', icon: 'shopping-cart', color: '#ec4899', type: CategoryType.EXPENSE, isDefault: true },
  { name: 'Bills & Utilities', icon: 'zap', color: '#10b981', type: CategoryType.EXPENSE, isDefault: true },
  { name: 'Healthcare', icon: 'activity', color: '#06b6d4', type: CategoryType.EXPENSE, isDefault: true },
  { name: 'Entertainment', icon: 'gamepad-2', color: '#a855f7', type: CategoryType.EXPENSE, isDefault: true },
  { name: 'Education', icon: 'book-open', color: '#14b8a6', type: CategoryType.EXPENSE, isDefault: true },
  { name: 'Other Expenses', icon: 'credit-card', color: '#64748b', type: CategoryType.EXPENSE, isDefault: true },
];

const defaultIncomeCategories = [
  { name: 'Salary', icon: 'briefcase', color: '#10b981', type: CategoryType.INCOME, isDefault: true },
  { name: 'Freelance', icon: 'laptop', color: '#3b82f6', type: CategoryType.INCOME, isDefault: true },
  { name: 'Business', icon: 'building', color: '#6366f1', type: CategoryType.INCOME, isDefault: true },
  { name: 'Investments', icon: 'trending-up', color: '#8b5cf6', type: CategoryType.INCOME, isDefault: true },
  { name: 'Other Income', icon: 'dollar-sign', color: '#14b8a6', type: CategoryType.INCOME, isDefault: true },
];

async function main() {
  console.log('Seeding default categories...');

  for (const category of [...defaultExpenseCategories, ...defaultIncomeCategories]) {
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        isDefault: true,
        userId: null,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: category,
      });
      console.log(`Created default category: ${category.name}`);
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
