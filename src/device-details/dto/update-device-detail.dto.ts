import { PartialType } from '@nestjs/swagger';
import { CreateDeviceDetailDto } from './create-device-detail.dto';

export class UpdateDeviceDetailDto extends PartialType(CreateDeviceDetailDto) {}
