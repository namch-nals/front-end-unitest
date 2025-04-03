import { vi } from "vitest";

import { OrderRepository } from "../../src/services/order-repository.service";
import { PaymentMethod } from "../../src/models/payment.model";
import { Order } from "../../src/models/order.model";

describe("OrderRepository", () => {
  let orderRepository: OrderRepository;
  let fetchSpy: any;

  beforeEach(() => {
    orderRepository = new OrderRepository();
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(".createOrder", () => {
    const createMockOrderPayload = (): Partial<Order> => ({
      id: "order-123",
      items: [
        {
          productId: "product-001",
          quantity: 2,
          price: 100,
          id: "item-1",
        },
      ],
      totalPrice: 200,
      couponId: "DISCOUNT10",
      paymentMethod: PaymentMethod.CREDIT,
    });

    it("should successfully create an order and return the response", async () => {
      const orderPayload = createMockOrderPayload();
      const expectedResponse = {
        ...orderPayload,
        id: "server-generated-id",
      } as Order;

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedResponse),
      } as unknown as Response);

      const result = await orderRepository.createOrder(orderPayload);

      expect(result).toEqual(expectedResponse);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://67eb7353aa794fb3222a4c0e.mockapi.io/order",
        {
          method: "POST",
          body: JSON.stringify(orderPayload),
          headers: { "Content-Type": "application/json" },
        }
      );
    });

    it("should return null when API returns non-success response", async () => {
      const orderPayload = createMockOrderPayload();

      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      const result = await orderRepository.createOrder(orderPayload);

      expect(result).toBeNull();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("should return null when network error occurs", async () => {
      const orderPayload = createMockOrderPayload();
      const networkError = new Error("Network failure");

      fetchSpy.mockRejectedValueOnce(networkError);

      const result = await orderRepository.createOrder(orderPayload);

      expect(result).toBeNull();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
