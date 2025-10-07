import { PartialType } from '@nestjs/swagger';
import { CreateDeviceImageDto } from './create-device-image.dto';

export class UpdateDeviceImageDto extends PartialType(CreateDeviceImageDto) {}
