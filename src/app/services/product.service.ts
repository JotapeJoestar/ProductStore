import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Repuesto numero Uno',
      description: 'Detalles del repuesto',
      price: 120000,
      category: "BMW",
      type: "Motores y componentes",  
      image: 'assets/images/product-1.jpg',
      featured: true,
      images: [
        'assets/images/product-1.jpg',
        'assets/images/product-1-2.jpg',
        'assets/images/product-1-3.jpg'
      ]
    },
    {
      id: 2,
      name: 'Repuesto numero Dos',
      description: 'Detalles del repuesto',
      price: 35000,
      category: "BMW",
      type: "Frenos y pastillas", 
      image: 'assets/images/product-2.jpg',
      featured: true,
      images: [
        'assets/images/product-2.jpg',
        'assets/images/product-2-2.jpg',
        'assets/images/product-2-3.jpg'
      ]
    },
    {
      id: 3,
      name: 'Repuesto numero Tres',
      description: 'Detalles del repuesto',
      price: 200000,
      category: "BMW",
      type: "Suspensión",
      image: 'assets/images/product-3.jpg',
      featured: true,
      images: [
        'assets/images/product-3.jpg',
        'assets/images/product-3-2.jpg',
        'assets/images/product-3-3.jpg'
      ]
    },
    {
      id: 4,
      name: 'Repuesto numero Cuatro',
      description: 'Detalles del repuesto',
      price: 35000,
      category: "BMW",
      type: "Eléctrico",
      image: 'assets/images/product-4.jpg',
      images: [
        'assets/images/product-4.jpg',
        'assets/images/product-4-2.jpg',
        'assets/images/product-4-3.jpg'
      ]
    },
    {
      id: 5,
      name: 'Repuesto numero Cinco',
      description: 'Detalles del repuesto',
      price: 35000,
      category: "MINI",
      type: "Motor", 
      image: 'assets/images/product-5.jpg',
      featured: true,
      images: [
        'assets/images/product-5.jpg',
        'assets/images/product-5-2.jpg',
        'assets/images/product-5-3.jpg'
      ]
    },
    {
      id: 6,
      name: 'Repuesto numero Seis',
      description: 'Detalles del repuesto',
      price: 35000,
      category: "MERCEDES",
      type: "Carrocería",
      image: 'assets/images/product-6.jpg',
      images: [
        'assets/images/product-6.jpg',
        'assets/images/product-6-2.jpg',
        'assets/images/product-6-3.jpg'
      ]
    },
    {
      id: 7,
      name: 'Repuesto numero Siete',
      description: 'Detalles del repuesto',
      price: 35000,
      category: "MERCEDES",
      type: "Suspensión",
      image: 'assets/images/product-7.jpg',
      featured: true,
      images: [
        'assets/images/product-7.jpg',
        'assets/images/product-7-2.jpg',
        'assets/images/product-7-3.jpg'
      ]
    }
  ];

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getRelatedProducts(currentId: number): Product[] {
    return this.products.filter(p => p.id !== currentId).slice(0, 3);
  }

  addProduct(product: Product): void {
  this.products.push(product);
}

  // Productos destacados: si no hay marcados, retorna primeros N
  getFeaturedProducts(limit?: number): Product[] {
    const featured = this.products.filter(p => (p as any).featured);
    if (featured.length === 0) {
      return limit ? this.products.slice(0, limit) : this.products;
    }
    return limit ? featured.slice(0, limit) : featured;
  }

}
