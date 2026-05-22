export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  reference: string;
  email: string;
  amount: number;
  items: CartItem[];
  status: string;
  date: string;
}

export interface AppConfig {
  paystackPublicKey: string;
}
