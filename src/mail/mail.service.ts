import { google } from 'googleapis';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MailService {
  private async connectToOauth(): Promise<string> {
    const OAuth2 = google.auth.OAuth2;
    const auth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'https://developers.google.com/oauthplayground',
    );

    auth2Client.setCredentials({
      refresh_token: process.env.G_REFRESH,
    });

    return new Promise((resolve, reject) => {
      auth2Client.getAccessToken((err, token) => {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(token);
        }
      });
    });
  }

  async sendMail(
    email: string,
    subject: string,
    template: string,
    context: any,
  ) {
    const params = {
      from: process.env.EMAIL,
      to: email,
      subject,
      html: undefined,
    };
    const accessToken = await this.connectToOauth();
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

    console.log(params, authObject);
    return await smtpTransport.sendMail(params);
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
