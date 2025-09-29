import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { APP_CONFIG } from '../config/app.config';
import { ApiService } from './api.service';

type CreateProductOptions = {
  mainImageFile?: File | null;
  additionalImageFiles?: File[];
};

type UpdateProductOptions = {
  mainImageFile?: File | null;
  additionalImageFiles?: File[];
  keepMainImage?: string | null;
  keepImages?: string[];
};

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [];

  constructor(private api: ApiService) {}

  getProducts(): Product[] {
    return this.products;
  }

  async getProductsFromBackend(): Promise<Product[]> {
    const base = APP_CONFIG.backendBaseUrl;
    if (!base) {
      return this.products;
    }
    try {
      const resp: any = await this.api.get<any>('products');
      const list = this.unwrapResponse<Product[]>(resp, []);
      this.products = Array.isArray(list)
        ? list.map(item => this.normalizeProductFromBackend(item as Product))
        : [];
    } catch {
      // Ignorar errores del backend y conservar cache local
    }
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  async getProductByIdAsync(id: number): Promise<Product | undefined> {
    const base = APP_CONFIG.backendBaseUrl;
    if (base) {
      try {
        const resp: any = await this.api.get<any>(`products/${id}`);
        const raw = this.unwrapResponse<Product | null>(resp, null);
        if (raw) {
          return this.normalizeProductFromBackend(raw);
        }
      } catch {
        // fallback a la lista en memoria
      }
    }
    if (!this.products.length) {
      await this.getProductsFromBackend();
    }
    return this.getProductById(id);
  }

  getRelatedProducts(currentId: number): Product[] {
    return this.products.filter(p => p.id !== currentId).slice(0, 3);
  }

  addProduct(product: Product): void {
    this.products.push(product);
  }

  async addProductAsync(product: Product, options: CreateProductOptions = {}): Promise<Product> {
    const base = APP_CONFIG.backendBaseUrl;
    const mainImageFile = options.mainImageFile ?? null;
    const additionalImageFiles = (options.additionalImageFiles ?? []).filter((file): file is File => !!file);

    if (!base) {
      const created: Product = {
        ...product,
        id: product.id || Date.now(),
        image: product.image,
        images: product.images ?? []
      };
      const normalized = this.normalizeProductFromBackend(created);
      this.addProduct(normalized);
      return normalized;
    }

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description ?? '');
    formData.append('price', String(product.price ?? 0));
    formData.append('category', product.category ?? '');
    formData.append('type', product.type ?? '');
    formData.append('featured', product.featured ? '1' : '0');

    if (mainImageFile) {
      formData.append('image', mainImageFile, mainImageFile.name);
    }
    additionalImageFiles.forEach(file => {
      formData.append('images[]', file, file.name);
    });

    const resp: any = await this.api.post<any>('products', formData);
    const createdProduct = this.unwrapResponse<Product | null>(resp, null);
    if (createdProduct) {
      const normalized = this.normalizeProductFromBackend(createdProduct);
      this.addProduct(normalized);
      return normalized;
    }

    const fallbackProduct: Product = {
      ...product,
      id: product.id || Date.now(),
      image: product.image,
      images: product.images ?? []
    };
    const normalizedFallback = this.normalizeProductFromBackend(fallbackProduct);
    this.addProduct(normalizedFallback);
    return normalizedFallback;
  }

  getFeaturedProducts(limit?: number): Product[] {
    const featured = this.products.filter(p => (p as any).featured);
    if (featured.length === 0) {
      return limit ? this.products.slice(0, limit) : this.products;
    }
    return limit ? featured.slice(0, limit) : featured;
  }

  updateProduct(updated: Product): boolean {
    const idx = this.products.findIndex(p => p.id === updated.id);
    if (idx === -1) {
      return false;
    }
    this.products[idx] = { ...updated };
    return true;
  }

  async updateProductAsync(updated: Product, options: UpdateProductOptions = {}): Promise<boolean> {
    const base = APP_CONFIG.backendBaseUrl;
    if (!base) {
      return this.updateProduct(updated);
    }
    if (!updated.id) {
      throw new Error('Product id is required for update');
    }

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('name', updated.name);
    formData.append('description', updated.description ?? '');
    formData.append('price', String(updated.price ?? 0));
    formData.append('category', updated.category ?? '');
    formData.append('type', updated.type ?? '');
    formData.append('featured', updated.featured ? '1' : '0');

    const mainImageFile = options.mainImageFile ?? null;
    if (mainImageFile) {
      formData.append('image', mainImageFile, mainImageFile.name);
    } else if (options.keepMainImage) {
      const keepPath = this.stripBackendOrigin(options.keepMainImage);
      if (keepPath) {
        formData.append('image', keepPath);
      }
    }

    const additionalImageFiles = (options.additionalImageFiles ?? []).filter((file): file is File => !!file);
    additionalImageFiles.forEach(file => {
      formData.append('images[]', file, file.name);
    });

    const normalizedExisting = (options.keepImages ?? [])
      .map(path => this.stripBackendOrigin(path))
      .filter((path): path is string => !!path);
    formData.append('images', JSON.stringify(normalizedExisting));

    const resp: any = await this.api.post<any>(`products/${updated.id}`, formData);
    const updatedProduct = this.unwrapResponse<Product | null>(resp, null);
    if (updatedProduct) {
      const normalized = this.normalizeProductFromBackend(updatedProduct);
      const idx = this.products.findIndex(p => p.id === normalized.id);
      if (idx === -1) {
        this.products.push(normalized);
      } else {
        this.products[idx] = normalized;
      }
    } else {
      this.updateProduct(updated);
    }
    return true;
  }

  deleteProduct(id: number): boolean {
    const prevLen = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    return this.products.length !== prevLen;
  }

  async deleteProductAsync(id: number): Promise<boolean> {
    const base = APP_CONFIG.backendBaseUrl;
    if (!base) {
      return this.deleteProduct(id);
    }
    await this.api.delete(`products/${id}`);
    this.deleteProduct(id);
    return true;
  }

  private normalizeProductFromBackend(raw: Product): Product {
    const gallery: string[] = [];
    const main = this.resolveMediaUrl(raw.image);
    if (main) {
      gallery.push(main);
    }
    if (Array.isArray(raw.images)) {
      for (const img of raw.images) {
        const resolved = this.resolveMediaUrl(img);
        if (resolved && !gallery.includes(resolved)) {
          gallery.push(resolved);
        }
      }
    }
    return {
      ...raw,
      image: main || raw.image,
      images: gallery.length ? gallery : raw.images ?? []
    };
  }

  private resolveMediaUrl(path?: string | null): string {
    if (!path) {
      return '';
    }
    if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
      return path;
    }
    const origin = this.getBackendOrigin();
    if (!origin) {
      return path;
    }
    if (path.startsWith('/')) {
      return `${origin}${path}`;
    }
    return `${origin}/${path}`;
  }

  private getBackendOrigin(): string | null {
    const base = APP_CONFIG.backendBaseUrl;
    if (!base) {
      return null;
    }
    try {
      return new URL(base).origin;
    } catch {
      return null;
    }
  }

  private stripBackendOrigin(path: string | null | undefined): string | null {
    if (!path) {
      return null;
    }
    const origin = this.getBackendOrigin();
    if (origin && path.startsWith(origin)) {
      return path.slice(origin.length);
    }
    return path;
  }

  private unwrapResponse<T>(resp: any, fallback: T): T {
    if (resp && typeof resp === 'object') {
      if ('data' in resp) {
        return resp.data as T;
      }
      return resp as T;
    }
    return fallback;
  }
}
