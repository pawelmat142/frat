// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { WizardService } from './wizard.service';
// import TelegramBot = require('node-telegram-bot-api');

// @Injectable()
// export class TelegramService implements OnModuleInit {
//   private readonly logger = new Logger(this.constructor.name);

//   private readonly channelId = process.env.TELEGRAM_CHANNEL_ID;

//   constructor(
//     private readonly wizardService: WizardService,
//   ) {}

//   onModuleInit() {
//     this.profileTelegramService.sendMessageObs$.subscribe((msg) => {
//       this.logger.log(`Sending message to channel ${msg.telegramChannelId}`);
//       this.sendMessage(Number(msg.telegramChannelId), msg.message);
//     });

//     this.profileTelegramService.cleanMessages$.subscribe(
//       (telegramChannelId) => {
//         this.wizardService.cleanMessages(telegramChannelId);
//       },
//     );
//   }

//   public async sendMessage(
//     chatId: number,
//     message: string,
//   ): Promise<TelegramBot.Message> {
//     const result = await this.wizardService.sendMessage(chatId, message);
//     return result;
//   }
// }
