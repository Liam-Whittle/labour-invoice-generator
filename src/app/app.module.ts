import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CreateModule } from './create/create.module';

import { SQLite } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';

import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx'
import { HttpClientModule } from '@angular/common/http'
import { DatabaseService } from './services/database.service';
import { MenuPageModule } from './Menu/menu.module';
import { EditModule } from './edit/edit.module';
import { ViewModule } from './view/view.module';
import { File } from '@ionic-native/file/ngx';




@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, CreateModule, HttpClientModule, MenuPageModule, EditModule, ViewModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLitePorter,
    SQLite,
    DatabaseService,
    EmailComposer,
    File
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
