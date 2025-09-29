import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { APP_CONFIG } from '../../../config/app.config';

interface ImageEntry {
  preview: string;
  file: File | null;
  existingPath?: string;
}

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent {
  product!: Product;
  imageEntries: ImageEntry[] = [];
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

  private readonly backendOrigin = this.getBackendOrigin();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct(id);
  }

  private async loadProduct(id: number) {
    const fromCache = this.productService.getProductById(id);
    if (fromCache) {
      this.product = JSON.parse(JSON.stringify(fromCache));
      if (typeof this.product.featured !== 'boolean') {
        this.product.featured = false;
      }
      this.initializeImageEntries(fromCache);
      return;
    }

    const fromBackend = await this.productService.getProductByIdAsync(id);
    if (!fromBackend) {
      alert('Producto no encontrado');
      this.router.navigate(['/admin/products']);
      return;
    }
    this.product = JSON.parse(JSON.stringify(fromBackend));
    if (typeof this.product.featured !== 'boolean') {
      this.product.featured = false;
    }
    this.initializeImageEntries(fromBackend);
  }

  async onSubmit(form: NgForm) {
    this.formSubmitted = true;
    if (!form.valid || this.isSaving) {
      return;
    }

    if (!this.imageEntries.length) {
      alert('El producto debe tener una imagen principal.');
      return;
    }

    const mainEntry = this.imageEntries[0];
    if (!mainEntry.file && !mainEntry.existingPath) {
      alert('Selecciona una imagen principal.');
      return;
    }

    this.isSaving = true;
    try {
      const { mainImageFile, additionalImageFiles } = this.prepareFiles();
      const keepMainImage = mainImageFile ? null : (mainEntry.existingPath ?? null);
      const keepImages = this.imageEntries
        .slice(1)
        .filter(entry => !entry.file && entry.existingPath)
        .map(entry => entry.existingPath!)
        .filter(Boolean);

      await this.productService.updateProductAsync({
        ...this.product,
        image: this.imageEntries[0].preview,
        images: this.imageEntries.map(entry => entry.preview)
      }, {
        mainImageFile,
        additionalImageFiles,
        keepMainImage,
        keepImages
      });

      alert('Producto actualizado');
      this.router.navigate(['/admin/products']);
    } catch (error) {
      console.error(error);
      alert('No fue posible actualizar el producto. Intenta de nuevo.');
    } finally {
      this.isSaving = false;
    }
  }

  async onMainImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('El archivo seleccionado no es una imagen.');
      input.value = '';
      return;
    }

    const preview = await this.readAsDataURL(file);
    if (this.imageEntries.length) {
      this.imageEntries[0] = { preview, file, existingPath: undefined };
    } else {
      this.imageEntries.push({ preview, file });
    }
    this.syncProductImages();
    input.value = '';
  }

  async onAdditionalImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) {
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue;
      }
      const preview = await this.readAsDataURL(file);
      if (this.imageEntries.some(entry => entry.preview === preview)) {
        continue;
      }
      this.imageEntries.push({ preview, file });
    }
    this.syncProductImages();
    input.value = '';
  }

  removeImage(index: number) {
    if (index < 0 || index >= this.imageEntries.length) {
      return;
    }
    this.imageEntries.splice(index, 1);
    this.syncProductImages();
  }

  moveImageLeft(index: number) {
    if (index <= 0 || index >= this.imageEntries.length) {
      return;
    }
    const entries = this.imageEntries;
    [entries[index - 1], entries[index]] = [entries[index], entries[index - 1]];
    this.syncProductImages();
  }

  moveImageRight(index: number) {
    if (index < 0 || index >= this.imageEntries.length - 1) {
      return;
    }
    const entries = this.imageEntries;
    [entries[index], entries[index + 1]] = [entries[index + 1], entries[index]];
    this.syncProductImages();
  }

  setAsMain(index: number) {
    if (index <= 0 || index >= this.imageEntries.length) {
      return;
    }
    const [entry] = this.imageEntries.splice(index, 1);
    this.imageEntries.unshift(entry);
    this.syncProductImages();
  }

  private initializeImageEntries(product: Product) {
    const gallery = this.buildInitialGallery(product);
    this.imageEntries = gallery.map(path => ({
      preview: path,
      file: null,
      existingPath: this.stripBackendOrigin(path)
    }));
    this.syncProductImages();
  }

  private buildInitialGallery(product: Product): string[] {
    const gallery: string[] = [];
    if (product.image) {
      gallery.push(product.image);
    }
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img && !gallery.includes(img)) {
          gallery.push(img);
        }
      }
    }
    return gallery;
  }

  private syncProductImages() {
    if (!this.imageEntries.length) {
      this.product.image = '';
      this.product.images = [];
      return;
    }
    this.product.image = this.imageEntries[0].preview;
    this.product.images = this.imageEntries.map(entry => entry.preview);
  }

  private prepareFiles(): { mainImageFile: File | null; additionalImageFiles: File[] } {
    const files: (File | null)[] = this.imageEntries.map(entry => entry.file ?? null);
    const mainImageFile = files.length ? files[0] : null;
    const additionalImageFiles = files.slice(1).filter((file): file is File => !!file);
    return { mainImageFile, additionalImageFiles };
  }

  private stripBackendOrigin(path: string): string | undefined {
    if (!path) {
      return undefined;
    }
    if (this.backendOrigin && path.startsWith(this.backendOrigin)) {
      return path.slice(this.backendOrigin.length);
    }
    return path;
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

  private readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
