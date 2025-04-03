import { vi } from "vitest";

import { OrderRepository } from "../../src/services/order-repository.service";
import { PaymentService } from "../../src/services/payment.service";
import { CouponService } from "../../src/services/coupon.service";
import { OrderService } from "../../src/services/order.service";
import { Order, OrderItem } from "../../src/models/order.model";

describe("OrderService", () => {
  let orderRepository: OrderRepository;
  let paymentService: PaymentService;
  let couponService: CouponService;
  let orderService: OrderService;

  const mockOrderItems: OrderItem[] = [
    { id: "item1", productId: "prod1", price: 100, quantity: 2 },
    { id: "item2", productId: "prod2", price: 50, quantity: 1 },
  ];

  const mockOrder: Partial<Order> = {
    id: "order123",
    items: mockOrderItems,
  };

  const mockCompleteOrder: Order = {
    id: "order123",
    items: mockOrderItems,
    totalPrice: 250,
    paymentMethod: "credit,paypay,aupay",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    orderRepository = {
      createOrder: vi.fn().mockResolvedValue(mockCompleteOrder),
    } as unknown as OrderRepository;

    paymentService = {
      buildPaymentMethod: vi.fn().mockReturnValue("credit,paypay,aupay"),
      payViaLink: vi.fn(),
    } as unknown as PaymentService;

    couponService = {
      fetchCoupon: vi.fn(),
    } as unknown as CouponService;

    orderService = new OrderService(
      orderRepository,
      paymentService,
      couponService
    );
  });

  describe(".calculateTotalPrice", () => {
    const calculateTotalPrice = (items: OrderItem[]): number => {
      return orderService["calculateTotalPrice"](items);
    };

    it("should correctly calculate total price for multiple items", () => {
      const items: OrderItem[] = [
        { id: "item1", productId: "prod1", price: 100, quantity: 2 },
        { id: "item2", productId: "prod2", price: 50, quantity: 3 },
      ];

      const result = calculateTotalPrice(items);

      expect(result).toBe(350);
    });

    it("should return 0 for empty items array", () => {
      const result = calculateTotalPrice([]);

      expect(result).toBe(0);
    });

    it("should handle single item calculation", () => {
      const items: OrderItem[] = [
        { id: "item1", productId: "prod1", price: 75, quantity: 4 },
      ];

      const result = calculateTotalPrice(items);

      expect(result).toBe(300);
    });
  });

  describe(".validateOrder", () => {
    const validateOrder = (order: Partial<Order>, totalPrice: number): void => {
      return orderService["validateOrder"](order, totalPrice);
    };

    it("should not throw error for valid order and price", () => {
      const validOrder: Partial<Order> = {
        items: [{ id: "item1", productId: "prod1", price: 10, quantity: 2 }],
      };

      expect(() => validateOrder(validOrder, 20)).not.toThrow();
    });

    it("should throw error if order items are empty", () => {
      const invalidOrder: Partial<Order> = { items: [] };

      expect(() => validateOrder(invalidOrder, 0)).toThrow(
        "Order items are required"
      );
    });

    it("should throw error if order items are undefined", () => {
      const invalidOrder: Partial<Order> = {};

      expect(() => validateOrder(invalidOrder, 0)).toThrow(
        "Order items are required"
      );
    });

    it("should throw error if any item has invalid price", () => {
      const invalidOrder: Partial<Order> = {
        items: [{ id: "item1", productId: "prod1", price: 0, quantity: 2 }],
      };

      expect(() => validateOrder(invalidOrder, 0)).toThrow(
        "Order items are invalid"
      );
    });

    it("should throw error if any item has invalid quantity", () => {
      const invalidOrder: Partial<Order> = {
        items: [{ id: "item1", productId: "prod1", price: 10, quantity: 0 }],
      };

      expect(() => validateOrder(invalidOrder, 0)).toThrow(
        "Order items are invalid"
      );
    });

    it("should throw error if total price is zero", () => {
      const validOrder: Partial<Order> = {
        items: [{ id: "item1", productId: "prod1", price: 10, quantity: 1 }],
      };

      expect(() => validateOrder(validOrder, 0)).toThrow(
        "Total price must be greater than 0"
      );
    });

    it("should throw error if total price is negative", () => {
      const validOrder: Partial<Order> = {
        items: [{ id: "item1", productId: "prod1", price: 10, quantity: 1 }],
      };

      expect(() => validateOrder(validOrder, -10)).toThrow(
        "Total price must be greater than 0"
      );
    });
  });

  describe(".applyDiscount", () => {
    it("should apply valid discount to total price", async () => {
      vi.mocked(couponService.fetchCoupon).mockResolvedValue({
        discount: 50,
      });

      const result = await orderService["applyDiscount"](200, "DISCOUNT50");

      expect(result).toBe(150);
      expect(couponService.fetchCoupon).toHaveBeenCalledWith("DISCOUNT50");
    });

    it("should throw error for invalid coupon", async () => {
      vi.mocked(couponService.fetchCoupon).mockResolvedValue(null);

      await expect(
        orderService["applyDiscount"](200, "INVALID")
      ).rejects.toThrow("Invalid coupon");
      expect(couponService.fetchCoupon).toHaveBeenCalledWith("INVALID");
    });

    it("should return 0 when discount is greater than price", async () => {
      vi.mocked(couponService.fetchCoupon).mockResolvedValue({
        discount: 300,
      });

      const result = await orderService["applyDiscount"](200, "HUGE_DISCOUNT");

      expect(result).toBe(0);
    });

    it("should handle coupon service exception", async () => {
      vi.mocked(couponService.fetchCoupon).mockRejectedValue(
        new Error("Service unavailable")
      );

      await expect(
        orderService["applyDiscount"](200, "ERROR_COUPON")
      ).rejects.toThrow("Service unavailable");
    });
  });

  describe(".process", () => {
    it("should process a valid order successfully", async () => {
      await orderService.process(mockOrder);

      expect(orderRepository.createOrder).toHaveBeenCalledWith({
        ...mockOrder,
        totalPrice: 250,
        paymentMethod: "credit,paypay,aupay",
      });
      expect(paymentService.buildPaymentMethod).toHaveBeenCalledWith(250);
      expect(paymentService.payViaLink).toHaveBeenCalledWith(mockCompleteOrder);
    });

    it("should apply discount when coupon is valid", async () => {
      const orderWithCoupon = {
        ...mockOrder,
        couponId: "DISCOUNT50",
      };
      vi.mocked(couponService.fetchCoupon).mockResolvedValue({
        discount: 50,
      });

      await orderService.process(orderWithCoupon);

      expect(couponService.fetchCoupon).toHaveBeenCalledWith("DISCOUNT50");
      expect(orderRepository.createOrder).toHaveBeenCalledWith({
        ...orderWithCoupon,
        totalPrice: 200,
        paymentMethod: "credit,paypay,aupay",
      });
    });

    it("should throw error if order repository throws exception", async () => {
      vi.mocked(orderRepository.createOrder).mockRejectedValue(
        new Error("Database error")
      );

      await expect(orderService.process(mockOrder)).rejects.toThrow(
        "Database error"
      );
      expect(paymentService.payViaLink).not.toHaveBeenCalled();
    });

    it("should throw error if payment service throws exception", async () => {
      vi.mocked(paymentService.buildPaymentMethod).mockImplementation(() => {
        throw new Error("Payment service unavailable");
      });

      await expect(orderService.process(mockOrder)).rejects.toThrow(
        "Payment service unavailable"
      );
      expect(orderRepository.createOrder).not.toHaveBeenCalled();
    });

    it("should throw error if order creation fails", async () => {
      vi.mocked(orderRepository.createOrder).mockResolvedValue(null);

      await expect(orderService.process(mockOrder)).rejects.toThrow(
        "Failed to create order"
      );
      expect(orderRepository.createOrder).toHaveBeenCalled();
      expect(paymentService.payViaLink).not.toHaveBeenCalled();
    });
  });
});
