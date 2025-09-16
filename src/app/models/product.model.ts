export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;  
  type: string;    
  image: string;
  images: string[];
  featured?: boolean;
}
