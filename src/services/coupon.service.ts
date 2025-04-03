
export class CouponService {
  private readonly COUPON_API_URL =
    "https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons";

  async fetchCoupon(
    couponId: string
  ): Promise<{ discount: number } | null> {
    try {
      const response = await fetch(`${this.COUPON_API_URL}/${couponId}`);
      if (!response.ok) return null;

      return await response.json();
    } catch (_error) {
      return null;
    }
  }
}
