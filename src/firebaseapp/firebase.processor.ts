import {
  Processor,
  Process,
  OnQueueFailed,
  OnQueueActive,
  OnQueueCompleted,
} from '@nestjs/bull';
import { Job } from 'bull';
import { NewUser, RealTimeNotifications } from '.';

@Processor('notifQueue')
export class FirebaseQueueProcessor {
  @OnQueueFailed()
  handler() {
    console.log(`Error`);
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Firebase queue active`);
  }

  @OnQueueCompleted()
  onCompleted(
    job: Job<{
      email: string;
      subject: string;
      template: string;
      context: any;
    }>,
  ) {
    console.log(`Firebase queue completed`);
  }

  @Process()
  public async onProcess(
    job: Job<{ data: any; id: string; isNotif: boolean }>,
  ) {
    const {
      data: { data, id, isNotif },
    } = job;
    if (isNotif) {
      const notif = new RealTimeNotifications(id);
      await notif.sendData(data);
      return;
    }
    const newUserFb = new NewUser(id);
    await newUserFb.setData(data);
  }
}
