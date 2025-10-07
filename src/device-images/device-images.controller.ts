import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeviceImagesService } from './device-images.service';
import { CreateDeviceImageDto } from './dto/create-device-image.dto';
import { UpdateDeviceImageDto } from './dto/update-device-image.dto';

@Controller('device-images')
export class DeviceImagesController {
  constructor(private readonly deviceImagesService: DeviceImagesService) {}

  @Post()
  create(@Body() createDeviceImageDto: CreateDeviceImageDto) {
    return this.deviceImagesService.create(createDeviceImageDto);
  }

  @Get()
  findAll() {
    return this.deviceImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceImagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceImageDto: UpdateDeviceImageDto) {
    return this.deviceImagesService.update(+id, updateDeviceImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceImagesService.remove(+id);
  }
}
