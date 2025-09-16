import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ProductFormComponent } from './components/admin/product-form/product-form.component'; 
import { ContactComponent } from './components/contact/contact.component';
import { AboutComponent } from './components/about/about.component';
import { ProductListAdminComponent } from './components/admin/product-list-admin/product-list-admin.component';
import { ProductEditComponent } from './components/admin/product-edit/product-edit.component';
import { AdminLoginComponent } from './components/admin/login/login.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:brand', component: ProductListComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/products', component: ProductListAdminComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/product-edit/:id', component: ProductEditComponent, canActivate: [AdminAuthGuard] },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'admin/product-form', component: ProductFormComponent, canActivate: [AdminAuthGuard] },
  { path: '**', redirectTo: '' }
];
