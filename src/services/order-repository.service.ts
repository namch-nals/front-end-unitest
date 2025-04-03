import { Order } from "../models/order.model";

export class OrderRepository {
  private readonly ORDER_API_URL =
    "https://67eb7353aa794fb3222a4c0e.mockapi.io/order";

  async createOrder(
    orderPayload: Partial<Omit<Order, "paymentMethod">> & {
      paymentMethod: string;
    }
  ): Promise<Order | null> {
    try {
      const response = await fetch(this.ORDER_API_URL, {
        method: "POST",
        body: JSON.stringify(orderPayload),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) return null;

      return await response.json();
    } catch (_error) {
      return null;
    }
  }
}
