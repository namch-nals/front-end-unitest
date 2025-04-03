import { vi } from "vitest";

import { PaymentService } from "../../src/services/payment.service";
import { PaymentMethod } from "../../src/models/payment.model";
import { Order } from "../../src/models/order.model";

describe("PaymentService", () => {
  let paymentService: PaymentService;
  let windowOpenSpy: any;

  beforeEach(() => {
    paymentService = new PaymentService();

    windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(".buildPaymentMethod", () => {
    it("should include all payment methods for a small amount", () => {
      const result = paymentService.buildPaymentMethod(1000);

      expect(result).toBe("credit,paypay,aupay");
      expect(result.split(",")).toHaveLength(3);
      expect(result).toContain(PaymentMethod.CREDIT);
      expect(result).toContain(PaymentMethod.PAYPAY);
      expect(result).toContain(PaymentMethod.AUPAY);
    });

    it("should exclude AUPAY for amount exceeding 300,000", () => {
      const result = paymentService.buildPaymentMethod(300001);

      expect(result.split(",")).toHaveLength(2);
      expect(result).toContain(PaymentMethod.CREDIT);
      expect(result).toContain(PaymentMethod.PAYPAY);
      expect(result).not.toContain(PaymentMethod.AUPAY);
    });

    it("should exclude PAYPAY and AUPAY for amount exceeding 500,000", () => {
      const result = paymentService.buildPaymentMethod(500001);

      expect(result.split(",")).toHaveLength(1);
      expect(result).toBe(PaymentMethod.CREDIT);
      expect(result).not.toContain(PaymentMethod.PAYPAY);
      expect(result).not.toContain(PaymentMethod.AUPAY);
    });

    it("should include PAYPAY for exactly 500,000", () => {
      const result = paymentService.buildPaymentMethod(500000);

      expect(result.split(",")).toHaveLength(2);
      expect(result).toContain(PaymentMethod.CREDIT);
      expect(result).toContain(PaymentMethod.PAYPAY);
      expect(result).not.toContain(PaymentMethod.AUPAY);
    });

    it("should include AUPAY for exactly 300,000", () => {
      const result = paymentService.buildPaymentMethod(300000);

      expect(result.split(",")).toHaveLength(3);
      expect(result).toContain(PaymentMethod.CREDIT);
      expect(result).toContain(PaymentMethod.PAYPAY);
      expect(result).toContain(PaymentMethod.AUPAY);
    });

    it("should handle zero amount by including all methods", () => {
      const result = paymentService.buildPaymentMethod(0);

      expect(result.split(",")).toHaveLength(3);
      expect(result).toContain(PaymentMethod.CREDIT);
      expect(result).toContain(PaymentMethod.PAYPAY);
      expect(result).toContain(PaymentMethod.AUPAY);
    });

    it("should handle negative amount by including all methods", () => {
      const result = paymentService.buildPaymentMethod(-100);

      expect(result.split(",")).toHaveLength(3);
      expect(result).toContain(PaymentMethod.CREDIT);
      expect(result).toContain(PaymentMethod.PAYPAY);
      expect(result).toContain(PaymentMethod.AUPAY);
    });
  });

  describe(".payViaLink", () => {
    it("should open payment URL with the correct order ID", () => {
      const mockOrder: Order = {
        id: "order123",
        totalPrice: 1000,
        items: [],
        paymentMethod: "credit",
      };

      paymentService.payViaLink(mockOrder);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://payment.example.com/pay?orderId=order123",
        "_blank"
      );
    });

    it("should handle orders with special characters in ID", () => {
      const mockOrder: Order = {
        id: "order-123/456",
        totalPrice: 1000,
        items: [],
        paymentMethod: "credit",
      };

      paymentService.payViaLink(mockOrder);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://payment.example.com/pay?orderId=order-123/456",
        "_blank"
      );
    });

    it("should work even if payment method is not set", () => {
      const mockOrder = {
        id: "order123",
        totalPrice: 1000,
        items: [],
        paymentMethod: "",
      } as Order;

      paymentService.payViaLink(mockOrder);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://payment.example.com/pay?orderId=order123",
        "_blank"
      );
    });

    it("should handle empty order ID gracefully", () => {
      const mockOrder = {
        id: "",
        totalPrice: 1000,
        items: [],
        paymentMethod: "credit",
      } as Order;

      paymentService.payViaLink(mockOrder);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://payment.example.com/pay?orderId=",
        "_blank"
      );
    });
  });

  describe("PAYMENT_METHODS configuration", () => {
    it("should have the correct configuration for payment methods", () => {
      const instance = new PaymentService();
      const methods = (instance as any)["PAYMENT_METHODS"];

      expect(methods).toHaveLength(3);

      const creditMethod = methods.find(
        (m: any) => m.method === PaymentMethod.CREDIT
      );
      expect(creditMethod).toBeDefined();
      expect(creditMethod.maxAmount).toBeUndefined();

      const paypayMethod = methods.find(
        (m: any) => m.method === PaymentMethod.PAYPAY
      );
      expect(paypayMethod).toBeDefined();
      expect(paypayMethod.maxAmount).toBe(500000);

      const aupayMethod = methods.find(
        (m: any) => m.method === PaymentMethod.AUPAY
      );
      expect(aupayMethod).toBeDefined();
      expect(aupayMethod.maxAmount).toBe(300000);
    });
  });
});
