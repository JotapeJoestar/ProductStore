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
    images: [],
    featured: false
  };

  private imageFiles: (File | null)[] = [];
  formSubmitted = false;
  isSaving = false;

  brandOptions = ['Todas','BMW', 'MERCEDES', 'MINI'];
  typeOptions = [
    'Todos',
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

  async onSubmit(form: NgForm) {
    this.formSubmitted = true;
    if (!form.valid || this.isSaving) {
      return;
    }

    const mainImageFile = this.imageFiles[0];
    if (!mainImageFile) {
      alert('Selecciona una imagen principal.');
      return;
    }

    this.isSaving = true;
    const additionalImageFiles = this.imageFiles.slice(1).filter((file): file is File => !!file);
    const payload: Product = {
      ...this.product,
      image: '',
      images: []
    };

    try {
      const created = await this.productService.addProductAsync(payload, {
        mainImageFile,
        additionalImageFiles
      });
      if (created && created.id) {
        alert('Producto agregado con exito');
        this.router.navigate(['/admin/products']);
      }
    } catch (error) {
      console.error(error);
      alert('No fue posible guardar el producto. Intenta de nuevo.');
    } finally {
      this.isSaving = false;
    }
  }

  async onMainImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('El archivo seleccionado no es una imagen.');
      input.value = '';
      return;
    }

    const dataUrl = await this.readAsDataURL(file);
    if (!this.product.images) {
      this.product.images = [];
    }

    const existingIndex = this.product.images.findIndex(img => img === dataUrl);
    if (existingIndex !== -1) {
      this.product.images.splice(existingIndex, 1);
      this.imageFiles.splice(existingIndex, 1);
    }

    this.product.images.unshift(dataUrl);
    this.imageFiles.unshift(file);
    this.product.image = dataUrl;
    input.value = '';
  }

  async onAdditionalImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) {
      return;
    }
    if (!this.product.images) {
      this.product.images = [];
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue;
      }
      const url = await this.readAsDataURL(file);
      if (this.product.images.includes(url)) {
        continue;
      }
      this.product.images.push(url);
      this.imageFiles.push(file);
    }

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
    if (!this.product.images || index < 0 || index >= this.product.images.length) {
      return;
    }
    this.product.images.splice(index, 1);
    this.imageFiles.splice(index, 1);
    if (index === 0) {
      this.product.image = this.product.images[0] ?? '';
    }
  }

  moveImageLeft(index: number) {
    if (!this.product.images || index <= 0 || index >= this.product.images.length) {
      return;
    }
    const imgs = this.product.images;
    const files = this.imageFiles;
    [imgs[index - 1], imgs[index]] = [imgs[index], imgs[index - 1]];
    [files[index - 1], files[index]] = [files[index], files[index - 1]];
    if (index === 0 || index === 1) {
      this.product.image = imgs[0];
    }
  }

  moveImageRight(index: number) {
    if (!this.product.images || index < 0 || index >= this.product.images.length - 1) {
      return;
    }
    const imgs = this.product.images;
    const files = this.imageFiles;
    [imgs[index + 1], imgs[index]] = [imgs[index], imgs[index + 1]];
    [files[index + 1], files[index]] = [files[index], files[index + 1]];
    if (index === 0 || index === 1) {
      this.product.image = imgs[0];
    }
  }

  setAsMain(index: number) {
    if (!this.product.images || index < 0 || index >= this.product.images.length) {
      return;
    }
    const [img] = this.product.images.splice(index, 1);
    const [file] = this.imageFiles.splice(index, 1);
    this.product.images.unshift(img);
    this.imageFiles.unshift(file ?? null);
    this.product.image = img;
  }
}
