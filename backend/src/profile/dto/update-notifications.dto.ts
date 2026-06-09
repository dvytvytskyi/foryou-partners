import { IsBoolean } from 'class-validator';

export class UpdateNotificationsDto {
  @IsBoolean()
  statusChange: boolean;

  @IsBoolean()
  brokerChange: boolean;

  @IsBoolean()
  weeklySummary: boolean;
}
