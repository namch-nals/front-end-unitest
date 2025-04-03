import { PaymentMethod } from "../models/payment.model";
import { Order } from "../models/order.model";

export class PaymentService {
  private readonly PAYMENT_METHODS = [
    { method: PaymentMethod.CREDIT, maxAmount: undefined },
    { method: PaymentMethod.PAYPAY, maxAmount: 500000 },
    { method: PaymentMethod.AUPAY, maxAmount: 300000 },
  ];

  buildPaymentMethod(totalPrice: number) {
    const availableMethods = this.PAYMENT_METHODS.filter(
      ({ maxAmount }) => !maxAmount || totalPrice <= maxAmount
    ).map(({ method }) => method);

    return availableMethods.join(",");
  }

  payViaLink(order: Order) {
    window.open(
      `https://payment.example.com/pay?orderId=${order.id}`,
      "_blank"
    );
  }
}
