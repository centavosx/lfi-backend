import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { Processor, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('emailQueue')
export class MailProcessor {
  private token: string | undefined;
  private OAuth: OAuth2Client;

  constructor() {
    try {
      const OAuth2 = google.auth.OAuth2;
      const auth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        'https://developers.google.com/oauthplayground',
      );

      this.OAuth = auth2Client;

      this.connectToOauth().then((v) => (this.token = v));
    } catch {}
  }

  @OnQueueActive()
  public async onActive(
    job: Job<{
      email: string;
      subject: string;
      template: string;
      context: any;
    }>,
  ) {
    const {
      data: { email, subject, context, template },
    } = job;
    await this.sendMail(email, subject, template, context);
  }

  private async connectToOauth(): Promise<string> {
    this.OAuth.setCredentials({
      refresh_token: process.env.G_REFRESH,
    });

    return new Promise((resolve, reject) => {
      try {
        this.OAuth.getAccessToken((err, token) => {
          if (err) {
            reject(err);
            return;
          } else {
            resolve(token);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private async checkAccessToken() {
    let expiry_date: number;

    try {
      const info = await this.OAuth.getTokenInfo(this.token);
      expiry_date = info.expiry_date;
    } catch {}

    if (expiry_date === undefined) return null;
    if (new Date().getTime() >= expiry_date) {
      this.token = await this.connectToOauth();
      if (!this.token) return null;
      return this.token;
    }
    return this.token;
  }

  async sendMail(
    email: string,
    subject: string,
    template: string,
    context: any,
  ) {
    try {
      const params = {
        from: process.env.EMAIL,
        to: email,
        subject,
        html: undefined,
      };
      const accessToken = this.checkAccessToken();

      if (!accessToken) return;

      const authObject = {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.G_REFRESH,
          accessToken: accessToken,
        },
        tls: {
          rejectUnauthorized: false,
        },
      };

      const smtpTransport = nodemailer.createTransport(authObject as any);

      const templatePath = './src/templates/';

      try {
        const htmlfile = path.resolve(templatePath, `${template}.hbs`);
        const htmlHbs = await this.readFile(htmlfile);
        if (htmlHbs) {
          const htmlTemplate = handlebars.compile(htmlHbs);
          params.html = htmlTemplate(context || {});
        }
      } catch (e) {
        console.log(e);
      }

      return await smtpTransport.sendMail(params);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  private async readFile(file: string) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
