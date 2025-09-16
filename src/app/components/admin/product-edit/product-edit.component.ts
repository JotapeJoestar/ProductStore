import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent {
  product!: Product;

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

  constructor(private route: ActivatedRoute, private productService: ProductService, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const p = this.productService.getProductById(id);
    if (!p) {
      alert('Producto no encontrado');
      this.router.navigate(['/admin/products']);
      return;
    }
    // Clonar para edición
    this.product = JSON.parse(JSON.stringify(p));
  }

  onSubmit(form: NgForm) {
    if (!form.valid) return;
    const ok = this.productService.updateProduct(this.product);
    if (!ok) {
      alert('No se pudo actualizar el producto');
      return;
    }
    alert('Producto actualizado');
    this.router.navigate(['/admin/products']);
  }

  async onMainImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Archivo no válido'); input.value=''; return; }
    const dataUrl = await this.readAsDataURL(file);
    this.product.image = dataUrl;
    if (!this.product.images) this.product.images = [];
    this.product.images = this.product.images.filter(img => img !== dataUrl);
    this.product.images.unshift(dataUrl);
    input.value = '';
  }

  async onAdditionalImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!this.product.images) this.product.images = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const url = await this.readAsDataURL(f);
      if (!this.product.images.includes(url)) this.product.images.push(url);
    }
    if (!this.product.image && this.product.images.length) this.product.image = this.product.images[0];
    input.value = '';
  }

  removeImage(i: number) {
    if (!this.product.images) return;
    const removed = this.product.images.splice(i,1)[0];
    if (removed && removed === this.product.image) this.product.image = this.product.images[0] ?? '';
  }
  moveImageLeft(i: number) {
    if (!this.product.images || i<=0) return; const a=this.product.images; [a[i-1],a[i]]=[a[i],a[i-1]];
  }
  moveImageRight(i: number) {
    if (!this.product.images || i>=this.product.images.length-1) return; const a=this.product.images; [a[i+1],a[i]]=[a[i],a[i+1]];
  }
  setAsMain(i: number) {
    if (!this.product.images) return; const m=this.product.images[i]; this.product.image=m; this.product.images.splice(i,1); this.product.images.unshift(m);
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

