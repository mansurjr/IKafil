import { Injectable } from '@nestjs/common';
import { CreateDeviceDetailDto } from './dto/create-device-detail.dto';
import { UpdateDeviceDetailDto } from './dto/update-device-detail.dto';

@Injectable()
export class DeviceDetailsService {
  create(createDeviceDetailDto: CreateDeviceDetailDto) {
    return 'This action adds a new deviceDetail';
  }

  findAll() {
    return `This action returns all deviceDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deviceDetail`;
  }

  update(id: number, updateDeviceDetailDto: UpdateDeviceDetailDto) {
    return `This action updates a #${id} deviceDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} deviceDetail`;
  }
}
