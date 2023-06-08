import * as paypal from 'paypal-rest-sdk';

type PaypalType = {
  mode: 'sandbox' | 'live';
  client_id: string;
  client_secret: string;
};

type CreatePaypalType = {
  successUrl: string;
  cancelledUrl: string;
  items: {
    name: string;
    sku: string;
    price: string;
    quantity: number;
    currency: string;
  }[];
  price: string;
  currency: string;
  description?: string;
  state?: string;
};

export class Paypal {
  private json: paypal.Payment | undefined;
  private transactionConfig: CreatePaypalType;

  public link: string;

  constructor(config: CreatePaypalType) {
    paypal.configure({
      mode: 'sandbox',
      client_id:
        'AW5GlJR7bM7D9dEJDE-R_fr7Hp0v_JlQUdD12g3VnnjqsZY9fJZVA-isBe5pfZierVXJaUfvw-dHlwm0',
      client_secret:
        'ELySQFq1H7oHbfyacHkY7LTu0i6mCf01UMtORnGaLV-AOsYmP2PAj3pWK1ZrzinO-Z8ZUhdtd-dEzbs3',
    });
    this.transactionConfig = config;
  }

  public create() {
    const {
      items,
      successUrl,
      cancelledUrl,
      price,
      currency,
      description,
      state,
    } = this.transactionConfig;

    const createJSON: paypal.Payment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: successUrl,
        cancel_url: cancelledUrl,
      },
      transactions: [
        {
          item_list: {
            items,
          },
          amount: {
            currency: currency,
            total: price,
          },
          description: description + ', State=' + state,
        },
      ],
    };

    this.json = createJSON;

    return this;
  }

  public pay() {
    if (!this.json) throw new Error('Create fields are undefined');

    return new Promise<Paypal>((resolve, reject) => {
      paypal.payment.create(this.json, (error, payment) => {
        if (!!error) reject(error);
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            this.link = payment.links[i].href;
            break;
          }
        }
        if (!this.link) reject(new Error('No links'));
        resolve(this);
      });
    });
  }
}

export const getPaymentInfo = (payerId: string, paymentId: string) => {
  return new Promise<paypal.PaymentResponse>((resolve, reject) => {
    paypal.payment.execute(
      paymentId,
      { payer_id: payerId },
      async (err, payment) => {
        if (!!err) reject(err);
        resolve(payment);
      },
    );
  });
};
