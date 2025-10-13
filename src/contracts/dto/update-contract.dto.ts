import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateContractDto } from "./create-contract.dto";

export class UpdateContractDto extends PartialType(
  OmitType(CreateContractDto, [
    "is_trade_in",
    "plan_id",
    "admin_id",
    "trade_in_id",
  ] as const)
) {}
