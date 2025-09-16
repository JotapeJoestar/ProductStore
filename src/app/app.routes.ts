import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ProductFormComponent } from './components/admin/product-form/product-form.component'; 
import { ContactComponent } from './components/contact/contact.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:brand', component: ProductListComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'admin/product-form', component: ProductFormComponent },
  { path: '**', redirectTo: '' }
];
