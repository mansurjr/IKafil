import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { session } from "telegraf";
import { BotUpdate } from "./bot.update";
import { BotService } from "./bot.service";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: "8233416615:AAGRWAdDJW5A-CnCwBhYdCAgigXYkh3PxMY",
    }),
    AuthModule,
    UsersModule,
  ],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
