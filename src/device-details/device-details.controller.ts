import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeviceDetailsService } from './device-details.service';
import { CreateDeviceDetailDto } from './dto/create-device-detail.dto';
import { UpdateDeviceDetailDto } from './dto/update-device-detail.dto';

@Controller('device-details')
export class DeviceDetailsController {
  constructor(private readonly deviceDetailsService: DeviceDetailsService) {}

  @Post()
  create(@Body() createDeviceDetailDto: CreateDeviceDetailDto) {
    return this.deviceDetailsService.create(createDeviceDetailDto);
  }

  @Get()
  findAll() {
    return this.deviceDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDetailDto: UpdateDeviceDetailDto) {
    return this.deviceDetailsService.update(+id, updateDeviceDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceDetailsService.remove(+id);
  }
}
