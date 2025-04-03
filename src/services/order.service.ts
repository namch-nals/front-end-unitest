import { OrderRepository } from "./order-repository.service";
import { Order, OrderItem } from "../models/order.model";
import { PaymentService } from "./payment.service";
import { CouponService } from "./coupon.service";

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentService,
    private readonly couponService: CouponService
  ) {}

  async process(order: Partial<Order>): Promise<void> {
    let totalPrice = this.calculateTotalPrice(order.items as OrderItem[]);

    this.validateOrder(order, totalPrice);

    if (order.couponId) {
      totalPrice = await this.applyDiscount(totalPrice, order.couponId);
    }

    const completeOrder = await this.orderRepository.createOrder({
      ...order,
      totalPrice,
      paymentMethod: this.paymentService.buildPaymentMethod(totalPrice),
    });

    if (!completeOrder) throw new Error("Failed to create order");

    this.paymentService.payViaLink(completeOrder);
  }

  private async applyDiscount(
    totalPrice: number,
    couponId: string
  ): Promise<number> {
    const coupon = await this.couponService.fetchCoupon(couponId);

    if (!coupon) throw new Error("Invalid coupon");

    const discountedPrice = totalPrice - coupon.discount;
    return Math.max(0, discountedPrice);
  }

  private validateOrder(order: Partial<Order>, totalPrice: number): void {
    if (!order.items?.length) {
      throw new Error("Order items are required");
    }

    if (order.items.some((item) => item.price <= 0 || item.quantity <= 0)) {
      throw new Error("Order items are invalid");
    }

    if (totalPrice <= 0) {
      throw new Error("Total price must be greater than 0");
    }
  }

  private calculateTotalPrice(items: OrderItem[]): number {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }
}
