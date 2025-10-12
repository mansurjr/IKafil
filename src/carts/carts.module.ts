import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { CartController } from './carts.controller';
import { CartService } from './carts.service';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartsModule {}
