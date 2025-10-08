import { Injectable } from '@nestjs/common';
import { CreateDeviceImageDto } from './dto/create-device-image.dto';
import { UpdateDeviceImageDto } from './dto/update-device-image.dto';

@Injectable()
export class DeviceImagesService {
  create(createDeviceImageDto: CreateDeviceImageDto) {
    return 'This action adds a new deviceImage';
  }

  findAll() {
    return `This action returns all deviceImages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deviceImage`;
  }

  update(id: number, updateDeviceImageDto: UpdateDeviceImageDto) {
    return `This action updates a #${id} deviceImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} deviceImage`;
  }
}
