export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
}

export const products: Product[] = [
  {
    id: 'prod_SbO1ff2wVlI1Me',
    priceId: 'price_1RgBFtGzYU9LC2rhWCNUvQNG',
    name: 'Advanced',
    description: 'Ad-free content; Private community; General Support; Behind-the-scenes content; Exclusive voting power.',
    mode: 'subscription',
    price: 50.00
  },
  {
    id: 'prod_SbO1n8r99BIcBa',
    priceId: 'price_1RgBFfGzYU9LC2rh4LDpFBCr',
    name: 'Standard',
    description: 'Ad-free content; Private community; General Support; Behind-the-scenes content; Exclusive voting power.',
    mode: 'subscription',
    price: 15.00
  },
  {
    id: 'prod_SbO0pzgHDGvxyA',
    priceId: 'price_1RgBEPGzYU9LC2rhy3WTMOmk',
    name: 'Basic',
    description: 'Ad-free content; Private community; General Support; Behind-the-scenes content; Exclusive voting power.',
    mode: 'subscription',
    price: 5.00
  }
];

export function getProductByPriceId(priceId: string): Product | undefined {
  return products.find(product => product.priceId === priceId);
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}