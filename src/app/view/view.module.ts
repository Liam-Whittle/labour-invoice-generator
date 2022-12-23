import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MenuPageModule } from '../Menu/menu.module';

import { IonicModule } from '@ionic/angular';

import { ViewComponent } from './view.component';

@NgModule({
  
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BrowserModule,
    MenuPageModule,
  ],
  declarations: [ViewComponent]
})
export class ViewModule {}