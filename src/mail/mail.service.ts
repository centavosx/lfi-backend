import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class MailService {
  constructor(@InjectQueue('emailQueue') private readonly emailQueue: Queue) {}

  async sendMail(
    email: string,
    subject: string,
    template: string,
    context: any,
  ) {
    await this.emailQueue.add({
      email,
      subject,
      template,
      context,
    });
  }
}
