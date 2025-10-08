import { Module } from '@nestjs/common';
import { InstallmentPlansService } from './installment-plans.service';
import { InstallmentPlansController } from './installment-plans.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [InstallmentPlansController],
  providers: [InstallmentPlansService],
  exports: [InstallmentPlansService]
})
export class InstallmentPlansModule {}
