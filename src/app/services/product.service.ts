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
      description: 'Detalles del respuesto',
      price: 120000,
      category: "BMW",
      image: 'assets/images/product-1.jpg',
      images: [
        'assets/images/product-1.jpg',
        'assets/images/product-1-2.jpg',
        'assets/images/product-1-3.jpg'
      ]
    },
    {
      id: 2,
      name: 'Repuesto numero Dos',
      description: 'Detalles del respuesto',
      price: 35000,
      category: "BMW",
      image: 'assets/images/product-2.jpg',
      images: [
        'assets/images/product-2.jpg',
        'assets/images/product-2-2.jpg',
        'assets/images/product-2-3.jpg'
      ]
    },
    {
      id: 3,
      name: 'Repuesto numero Tres',
      description: 'Detalles del respuesto',
      price: 200000,
      category: "BMW",
      image: 'assets/images/product-3.jpg',
      images: [
        'assets/images/product-3.jpg',
        'assets/images/product-3-2.jpg',
        'assets/images/product-3-3.jpg'
      ]
    }, {
      id: 4,
      name: 'Repuesto numero Cuatro',
      description: 'Detalles del respuesto',
      price: 35000,
      category: "BMW",
      image: 'assets/images/product-4.jpg',
      images: [
        'assets/images/product-4.jpg',
        'assets/images/product-4-2.jpg',
        'assets/images/product-4-3.jpg'
      ]
    }, {
      id: 5,
      name: 'Repuesto numero Cinco',
      description: 'Detalles del respuesto',
      price: 35000,
      category: "MARCA",
      image: 'assets/images/product-5.jpg',
      images: [
        'assets/images/product-5.jpg',
        'assets/images/product-5-2.jpg',
        'assets/images/product-5-3.jpg'
      ]
    }, {
      id: 6,
      name: 'Repuesto numero Seis',
      description: 'Detalles del respuesto',
      price: 35000,
      category: "MARCA",
      image: 'assets/images/product-6.jpg',
      images: [
        'assets/images/product-6.jpg',
        'assets/images/product-6-2.jpg',
        'assets/images/product-6-3.jpg'
      ]
    }, {
      id: 7,
      name: 'Repuesto numero Siete',
      description: 'Detalles del respuesto',
      price: 35000,
      category: "MARCA",
      image: 'assets/images/product-7.jpg',
      images: [
        'assets/images/product-7.jpg',
        'assets/images/product-7-2.jpg',
        'assets/images/product-7-3.jpg'
      ]
    },

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
}
