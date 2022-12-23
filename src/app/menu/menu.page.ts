import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { CreateComponent } from '../create/create.component';
import { IInvoiceHours } from '../models/iinvoice-hours.model';
import { IInvoice } from '../models/iinvoice.model';
import { DatabaseService } from '../services/database.service';
import { ToastController } from '@ionic/angular';
import { EditComponent } from '../edit/edit.component';
import { ViewComponent } from '../view/view.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  public menu: string;
  invoices: IInvoice[] = [];
  invoicesPopulated: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private db: DatabaseService,
    private toastController: ToastController,
    private alertController: AlertController) { }

  ngOnInit() {
    this.db.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.db.getInv().subscribe(invs => {
          this.invoices = invs;
          this.invoicePopulatedSwitch();
        });
      }
    })
    this.menu = this.activatedRoute.snapshot.paramMap.get('id');
    this.getAllInvoiceNames();
  }

  invoicePopulatedSwitch() {
    if (this.invoices.length > 0) {
      this.invoicesPopulated = true;
    }
    else if (this.invoices.length == 0) {
      this.invoicesPopulated = false;
    }
  }

  getAllInvoiceNames() {
    this.db.getInv().subscribe(data => {
      this.invoices = data;
    })
  }

  //use find instead of foreach on only one element
  //use filter for more than one element
  //predicate is condition to be meet
  deleteInvoiceItem(item) {
    let currInvoice = this.invoices.find(x => x.id === item.id);
    this.db.deleteInvoiceByID(currInvoice.id).then(_ => {
      this.db.deleteInvoiceHoursByInvoice(currInvoice.id).then(_ => {
        console.log('successfully deleted invoice and hours');
        this.invoicePopulatedSwitch();
      });
    });
  }

  async presentAlertMultipleButtons(item) {
    const alert = await this.alertController.create({
      header: 'Delete Invoice',
      subHeader: 'Delete ' + item.name + ' ?',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        }, {
          text: 'Yes',
          handler: () => {
            this.presentToast();
            this.deleteInvoiceItem(item);
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Invoice Deleted.',
      duration: 2000
    });
    toast.present();
  }

  async redirectToCreate() {
    const modal = await this.modalController.create({
      component: CreateComponent,
    });

    modal.onDidDismiss().then(_ => {
      this.invoicePopulatedSwitch();
    });

    await modal.present();
  }

  async redirectToEdit(invoice: IInvoice) {
    const modal = await this.modalController.create({
      component: EditComponent,
      componentProps: {
        invoice
      }
    });
    await modal.present();
  }

  async redirectToView(invoice: IInvoice) {
    const modal = await this.modalController.create({
      component: ViewComponent,
      componentProps: {
        invoice
      }
    });
    await modal.present();
  }

}
