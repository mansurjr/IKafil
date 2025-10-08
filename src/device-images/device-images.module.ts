import { Module } from '@nestjs/common';
import { DeviceImagesService } from './device-images.service';
import { DeviceImagesController } from './device-images.controller';

@Module({
  controllers: [DeviceImagesController],
  providers: [DeviceImagesService],
})
export class DeviceImagesModule {}
