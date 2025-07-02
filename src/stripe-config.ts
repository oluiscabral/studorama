export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  checkoutUrl?: string; // Optional external checkout URL
}

export const products: Product[] = [
  {
    id: 'prod_SbO1ff2wVlI1Me',
    priceId: 'price_1RgBFtGzYU9LC2rhWCNUvQNG',
    name: 'Advanced',
    description: 'Support Studorama development with a generous monthly contribution. Help us maintain and improve the platform for everyone.',
    mode: 'subscription',
    price: 50.00,
    checkoutUrl: 'https://buy.stripe.com/test_advanced_monthly' // Replace with actual Stripe checkout URL
  },
  {
    id: 'prod_SbO1n8r99BIcBa',
    priceId: 'price_1RgBFfGzYU9LC2rh4LDpFBCr',
    name: 'Standard',
    description: 'Show your appreciation with a monthly contribution. Every bit helps us keep Studorama free and accessible.',
    mode: 'subscription',
    price: 15.00,
    checkoutUrl: 'https://buy.stripe.com/test_standard_monthly' // Replace with actual Stripe checkout URL
  },
  {
    id: 'prod_SbO0pzgHDGvxyA',
    priceId: 'price_1RgBEPGzYU9LC2rhy3WTMOmk',
    name: 'Basic',
    description: 'Buy us a coffee each month! A small gesture that makes a big difference in supporting our mission.',
    mode: 'subscription',
    price: 5.00,
    checkoutUrl: 'https://buy.stripe.com/test_basic_monthly' // Replace with actual Stripe checkout URL
  }
];

export function getProductByPriceId(priceId: string): Product | undefined {
  return products.find(product => product.priceId === priceId);
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

// Helper function to get checkout URL for a product
export function getCheckoutUrl(priceId: string): string | null {
  const product = getProductByPriceId(priceId);
  return product?.checkoutUrl || null;
}