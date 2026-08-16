import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { IncomesModule } from './modules/incomes/incomes.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    IncomesModule,
    ExpensesModule,
    TransactionsModule,
    SubscriptionsModule,
    BudgetsModule,
    AnalyticsModule,
    DashboardModule,
  ],
})
export class AppModule {}
