import {
  Update,
  Start,
  On,
  Ctx,
  Message,
  Action,
  InjectBot,
} from "nestjs-telegraf";
import { Context } from "telegraf";
import { BotService } from "./bot.service";
import { AuthService } from "../auth/auth.service";
import { UsersService } from "../users/users.service";

interface BotSession {
  step?: string;
  email?: string;
  user?: any;
  accessToken?: string;
}

interface BotContext extends Context {
  session?: BotSession;
}

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: BotContext) {
    console.log("Start command triggered", ctx.from?.username);
    ctx.session = { step: "awaiting_email" };
    await ctx.reply("👋 Welcome! Please enter your email to log in:");
  }

  @On("text")
  async onMessage(@Ctx() ctx: BotContext, @Message("text") text: string) {
    ctx.session ??= {};
    const step = ctx.session.step;

    switch (step) {
      case "awaiting_email":
        ctx.session.email = text.trim().toLowerCase();
        ctx.session.step = "awaiting_otp";

        try {
          await this.authService.sendOtp(ctx.session.email);
          await ctx.reply(
            "📩 OTP has been sent to your email. Please enter it:"
          );
        } catch (err) {
          console.error("Failed to send OTP", err);
          await ctx.reply(
            "❌ Failed to send OTP. Please try again or type /start."
          );
        }
        break;

      case "awaiting_otp":
        if (!ctx.session.email) {
          ctx.session.step = "awaiting_email";
          return await ctx.reply("⚠️ Email missing. Please enter your email:");
        }

        try {
          const fakeRes = { cookie: () => {} } as any;
          const { accessToken } = await this.authService.verifyOtp(
            ctx.session.email,
            text.trim(),
            fakeRes
          );

          const user = await this.userService.findByEmailOrPhone(
            ctx.session.email
          );
          if (!user) throw new Error("User not found");

          ctx.session.user = user;
          ctx.session.accessToken = accessToken;
          ctx.session.step = "logged_in";

          await this.showMainMenu(ctx, user.role);
        } catch (error) {
          console.error("OTP verification failed", error);
          await ctx.reply(
            "❌ Invalid OTP. Please try again or type /start to restart."
          );
        }
        break;

      default:
        await ctx.reply("⚙️ Type /start to begin or use menu buttons.");
    }
  }

  async showMainMenu(ctx: BotContext, role: string) {
    let replyMarkup: any = null;

    if (role === "buyer") {
      replyMarkup = {
        inline_keyboard: [
          [{ text: "📜 My Contracts", callback_data: "buyer_contracts" }],
          [{ text: "💰 My Payments", callback_data: "buyer_payments" }],
        ],
      };
    } else if (role === "seller") {
      replyMarkup = {
        inline_keyboard: [
          [{ text: "✅ Published", callback_data: "seller_published" }],
          [{ text: "🕓 Pending", callback_data: "seller_pending" }],
          [{ text: "❌ Rejected", callback_data: "seller_rejected" }],
          [{ text: "💵 Sold", callback_data: "seller_sold" }],
        ],
      };
    }

    if (replyMarkup) {
      await ctx.reply(`Welcome, ${role.toUpperCase()} 👋`, {
        reply_markup: replyMarkup,
      });
    } else {
      await ctx.reply("⚠️ Your role is not supported in this bot.");
    }
  }

  @Action("buyer_contracts")
  async buyerContracts(@Ctx() ctx: BotContext) {
    const user = ctx.session?.user;
    if (!user) return ctx.reply("⚠️ Please /start to log in first.");

    const contracts = await this.botService.getBuyerContracts(user.id);
    if (!contracts.length)
      return ctx.reply(
        "📭 You have no contracts yet.",
        this.backBtn("buyer_menu")
      );

    for (const c of contracts) {
      await ctx.reply(
        `📄 <b>Contract #${c.contractNumber}</b>\n` +
          `Device: ${c.device?.name ?? "N/A"}\n` +
          `💰 Total: ${c.totalPrice}\n` +
          `📅 Monthly: ${c.monthlyPayment}\n` +
          `📊 Status: ${c.status}`,
        { parse_mode: "HTML" }
      );
    }

    await ctx.reply("🔙 Back to menu", this.backBtn("buyer_menu"));
  }

  @Action("buyer_payments")
  async buyerPayments(@Ctx() ctx: BotContext) {
    const user = ctx.session?.user;
    if (!user) return ctx.reply("⚠️ Please /start to log in first.");

    const payments = await this.botService.getBuyerPayments(user.id);
    if (!payments.length)
      return ctx.reply(
        "💸 You have no payments yet.",
        this.backBtn("buyer_menu")
      );

    for (const p of payments) {
      await ctx.reply(
        `💰 <b>Payment #${p.id}</b>\n` +
          `Contract: ${p.contractNumber ?? "N/A"}\n` +
          `Amount: ${p.amount}\n` +
          `Method: ${p.method}\n` +
          `Status: ${p.status}`,
        { parse_mode: "HTML" }
      );
    }

    await ctx.reply("🔙 Back to menu", this.backBtn("buyer_menu"));
  }

  @Action("seller_published")
  async sellerPublished(@Ctx() ctx: BotContext) {
    await this.showSellerDevices(ctx, "published");
  }

  @Action("seller_pending")
  async sellerPending(@Ctx() ctx: BotContext) {
    await this.showSellerDevices(ctx, "pending");
  }

  @Action("seller_rejected")
  async sellerRejected(@Ctx() ctx: BotContext) {
    await this.showSellerDevices(ctx, "rejected");
  }

  @Action("seller_sold")
  async sellerSold(@Ctx() ctx: BotContext) {
    await this.showSellerDevices(ctx, "sold");
  }

  private async showSellerDevices(
    ctx: BotContext,
    status: "published" | "pending" | "rejected" | "sold"
  ) {
    const user = ctx.session?.user;
    if (!user) return ctx.reply("⚠️ Please /start to log in first.");

    const devices = await this.botService.getSellerDevices(user.id, status);
    if (!devices.length)
      return ctx.reply("📭 No devices found.", this.backBtn("seller_menu"));

    for (const d of devices) {
      await ctx.reply(
        `🛍️ <b>${d.name}</b>\n` +
          `💵 Price: ${d.price}\n` +
          `📦 Status: ${d.status}\n` +
          `🌍 Region: ${d.region?.name ?? "N/A"}`,
        { parse_mode: "HTML" }
      );
    }

    await ctx.reply("🔙 Back to menu", this.backBtn("seller_menu"));
  }

  @Action("buyer_menu")
  async buyerMenu(@Ctx() ctx: BotContext) {
    await this.showMainMenu(ctx, "buyer");
  }

  @Action("seller_menu")
  async sellerMenu(@Ctx() ctx: BotContext) {
    await this.showMainMenu(ctx, "seller");
  }

  private backBtn(menu: "buyer_menu" | "seller_menu") {
    return {
      reply_markup: {
        inline_keyboard: [[{ text: "🔙 Back to Menu", callback_data: menu }]],
      },
    };
  }
}
