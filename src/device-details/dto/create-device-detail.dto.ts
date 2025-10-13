import { ApiPropertyOptional } from "@nestjs/swagger";

export class CreateDeviceDetailDto {
  @ApiPropertyOptional() color?: string;
  @ApiPropertyOptional() year?: number;
  @ApiPropertyOptional() cpu?: string;
  @ApiPropertyOptional() ram?: string;
  @ApiPropertyOptional() storage?: string;
  @ApiPropertyOptional() display_size?: string;
  @ApiPropertyOptional() battery_health?: string;
  @ApiPropertyOptional() description?: string;
}