# Test Cases Checklist

## Main Component (`main.test.ts`)

### Document Structure
- [x] should create the correct DOM structure
- [x] should have the correct image alt attributes
- [x] should have non-empty image sources

### Counter Setup
- [x] should call setupCounter with the counter button

## Counter Component (`counter.test.ts`)

### setupCounter
- [x] should set initial counter value to 0
- [x] should increment counter when clicked
- [x] should maintain separate counters for different buttons
- [x] should add event listener to the button

## Coupon Service (`coupon.service.test.ts`)

### .fetchCoupon
- [x] should return discount data when coupon exists
- [x] should return null when coupon is not found
- [x] should handle network errors gracefully
- [x] should handle empty coupon ID

## Order Repository (`order-repository.service.test.ts`)

### .createOrder
- [x] should successfully create an order and return the response
- [x] should return null when API returns non-success response
- [x] should return null when network error occurs

## Order Service (`order.service.test.ts`)

### .calculateTotalPrice
- [x] should correctly calculate total price for multiple items
- [x] should return 0 for empty items array
- [x] should handle single item calculation

### .validateOrder
- [x] should not throw error for valid order and price
- [x] should throw error if order items are empty
- [x] should throw error if order items are undefined
- [x] should throw error if any item has invalid price
- [x] should throw error if any item has invalid quantity
- [x] should throw error if total price is zero
- [x] should throw error if total price is negative

### .applyDiscount
- [x] should apply valid discount to total price
- [x] should throw error for invalid coupon
- [x] should return 0 when discount is greater than price
- [x] should handle coupon service exception

### .process
- [x] should process a valid order successfully
- [x] should apply discount when coupon is valid
- [x] should throw error if order repository throws exception
- [x] should throw error if payment service throws exception
- [x] should throw error if order creation fails

## Payment Service (`payment.service.test.ts`)

### .buildPaymentMethod
- [x] should include all payment methods for a small amount
- [x] should exclude AUPAY for amount exceeding 300,000
- [x] should exclude PAYPAY and AUPAY for amount exceeding 500,000
- [x] should include PAYPAY for exactly 500,000
- [x] should include AUPAY for exactly 300,000
- [x] should handle zero amount by including all methods
- [x] should handle negative amount by including all methods

### .payViaLink
- [x] should open payment URL with the correct order ID
- [x] should handle orders with special characters in ID
- [x] should work even if payment method is not set
- [x] should handle empty order ID gracefully

### PAYMENT_METHODS configuration
- [x] should have the correct configuration for payment methods
