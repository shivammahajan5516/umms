// ── Dummy Payment Service ─────────────────────────────────────
// Simulates payment processing. NO real payment gateway is used.
// In production this would integrate with Stripe, PayPal, etc.

// Simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Detect card type from number prefix
const detectCardType = (cardNumber) => {
  const clean = cardNumber.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
  if (clean.startsWith('3')) return 'Amex';
  return 'Unknown';
};

// Simulate payment processing
const processPayment = async ({ amount, cardNumber, expiryDate, cvv, cardholderName }) => {
  // Simulate processing time (0.5–1.5 seconds)
  await delay(500 + Math.random() * 1000);

  const cleanCard = cardNumber.replace(/\s/g, '');
  const lastFour = cleanCard.slice(-4);
  const cardType = detectCardType(cleanCard);

  // Simulate failure cases for specific test card numbers
  // Card ending in 0000 = always fail (for testing)
  if (lastFour === '0000') {
    return {
      success: false,
      status: 'failed',
      cardLastFour: lastFour,
      cardType,
      gatewayResponse: 'DECLINED',
      failureReason: 'Card declined by issuer. Please try another card.',
    };
  }

  // Card ending in 1111 = insufficient funds
  if (lastFour === '1111') {
    return {
      success: false,
      status: 'failed',
      cardLastFour: lastFour,
      cardType,
      gatewayResponse: 'INSUFFICIENT_FUNDS',
      failureReason: 'Insufficient funds. Please try another payment method.',
    };
  }

  // 95% success rate for all other cards
  const isSuccess = Math.random() > 0.05;

  if (!isSuccess) {
    return {
      success: false,
      status: 'failed',
      cardLastFour: lastFour,
      cardType,
      gatewayResponse: 'PROCESSING_ERROR',
      failureReason: 'Payment processing error. Please try again.',
    };
  }

  return {
    success: true,
    status: 'success',
    cardLastFour: lastFour,
    cardType,
    gatewayResponse: 'AUTHORISED',
    failureReason: null,
  };
};

module.exports = { processPayment };
