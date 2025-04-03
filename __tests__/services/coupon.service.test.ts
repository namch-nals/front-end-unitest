import { vi } from "vitest";

import { CouponService } from "../../src/services/coupon.service";

describe("CouponService", () => {
  let couponService: CouponService;
  let fetchSpy: any;

  beforeEach(() => {
    couponService = new CouponService();
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(".fetchCoupon", () => {
    it("should return discount data when coupon exists", async () => {
      const couponId = "SUMMER2023";
      const mockCoupon = { discount: 15 };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCoupon),
      } as unknown as Response);

      const result = await couponService.fetchCoupon(couponId);

      expect(result).toEqual(mockCoupon);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons/SUMMER2023"
      );
    });

    it("should return null when coupon is not found", async () => {
      const invalidCouponId = "INVALID_CODE";

      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      const result = await couponService.fetchCoupon(invalidCouponId);

      expect(result).toBeNull();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle network errors gracefully", async () => {
      const couponId = "NETWORK_ERROR";
      const networkError = new Error("Failed to fetch");

      fetchSpy.mockRejectedValueOnce(networkError);

      const result = await couponService.fetchCoupon(couponId);

      expect(result).toBeNull();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle empty coupon ID", async () => {
      const emptyCouponId = "";

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ discount: 0 }),
      } as unknown as Response);

      const result = await couponService.fetchCoupon(emptyCouponId);

      expect(result).toEqual({ discount: 0 });
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons/"
      );
    });
  });
});
