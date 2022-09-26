import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { SettingService } from '../settings/services/setting.service';

@Injectable()
export default class EmailService {
  private nodemailerTransport: Mail;

  constructor(private readonly settingService: SettingService) {}

  async createNodeMailerTransport() {
    const mailService = await this.settingService.getSettingByKeyAndGroup(
      'EMAIL_SERVICE',
      'EMAIL',
    );
    const mailUser = await this.settingService.getSettingByKeyAndGroup(
      'EMAIL_USER',
      'EMAIL',
    );
    const mailPassword = await this.settingService.getSettingByKeyAndGroup(
      'EMAIL_PASSWORD',
      'EMAIL',
    );

    this.nodemailerTransport = createTransport({
      service: mailService.value,
      auth: {
        user: mailUser.value,
        pass: mailPassword.value,
      },
    });
  }

  async sendMail(options: Mail.Options) {
    await this.createNodeMailerTransport();
    return this.nodemailerTransport.sendMail(options);
  }
}
