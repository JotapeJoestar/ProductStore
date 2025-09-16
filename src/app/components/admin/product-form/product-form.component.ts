import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent {
  product: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    category: '',
    type: '',
    image: '',
    images: []
  };

  brandOptions = ['BMW', 'MERCEDES', 'MINI'];
  typeOptions = [
    'Motores y componentes',
    'Transmision y cajas de cambio',
    'Sistemas de frenado',
    'Sistemas de arranque',
    'Sistemas electronicos',
    'Aire acondicionado y climatizacion',
    'Frenos y pastillas',
    'Alternadores y generadores'
  ];

  constructor(private productService: ProductService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.product.id = Date.now();
      this.productService.addProduct(this.product);
      alert('Producto agregado con éxito');
      this.router.navigate(['/products']);
    }
  }

  async onMainImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('El archivo seleccionado no es una imagen.');
      input.value = '';
      return;
    }
    const dataUrl = await this.readAsDataURL(file);
    this.product.image = dataUrl;
    // Mantener la imagen principal como primera del arreglo "images"
    if (!this.product.images) this.product.images = [];
    // Elimina duplicados de la misma imagen
    this.product.images = this.product.images.filter(img => img !== dataUrl);
    this.product.images.unshift(dataUrl);
    // Limpia el input para permitir re-seleccionar el mismo archivo si se desea
    input.value = '';
  }

  async onAdditionalImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const validImages = files.filter(f => f.type.startsWith('image/'));
    if (!this.product.images) this.product.images = [];
    for (const f of validImages) {
      const url = await this.readAsDataURL(f);
      if (!this.product.images.includes(url)) {
        this.product.images.push(url);
      }
    }
    // Si no hay principal aún, usar la primera
    if (!this.product.image && this.product.images.length) {
      this.product.image = this.product.images[0];
    }
    input.value = '';
  }

  private readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    if (!this.product.images) return;
    const removed = this.product.images.splice(index, 1)[0];
    if (removed && removed === this.product.image) {
      // Si eliminan la principal, tomar la siguiente disponible o limpiar
      this.product.image = this.product.images[0] ?? '';
    }
  }

  moveImageLeft(index: number) {
    if (!this.product.images || index <= 0) return;
    const imgs = this.product.images;
    [imgs[index - 1], imgs[index]] = [imgs[index], imgs[index - 1]];
  }

  moveImageRight(index: number) {
    if (!this.product.images || index >= this.product.images.length - 1) return;
    const imgs = this.product.images;
    [imgs[index + 1], imgs[index]] = [imgs[index], imgs[index + 1]];
  }

  setAsMain(index: number) {
    if (!this.product.images || !this.product.images[index]) return;
    const newMain = this.product.images[index];
    this.product.image = newMain;
    // Moverla al inicio del arreglo
    this.product.images.splice(index, 1);
    this.product.images.unshift(newMain);
  }
}
