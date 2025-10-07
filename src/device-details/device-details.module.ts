import { Module } from '@nestjs/common';
import { DeviceDetailsService } from './device-details.service';
import { DeviceDetailsController } from './device-details.controller';

@Module({
  controllers: [DeviceDetailsController],
  providers: [DeviceDetailsService],
})
export class DeviceDetailsModule {}
