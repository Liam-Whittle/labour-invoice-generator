import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { IInvoice } from '../models/iinvoice.model';
import { IInvoiceHours } from '../models/iinvoice-hours.model';
import { element } from 'protractor';
import { IWeekday } from '../models/iweekday.model';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {

  invoices: IInvoice[] = [];
  invoiceHours: IInvoiceHours[] = [];

  rateModel = null;
  taxModel = null;
  nameModel = "";
  CTDModel = null;
  daysSelected = [];
  weekdays: IWeekday[] = [
    {
      id: 1,
      Day: 'Monday',
      StartTime: "07:30",
      EndTime: "16:30",
    },
    {
      id: 2,
      Day: 'Tuesday',
      StartTime: "07:30",
      EndTime: "16:30",
    },
    {
      id: 3,
      Day: 'Wednesday',
      StartTime: "07:30",
      EndTime: "16:30",
    },
    {
      id: 4,
      Day: 'Thursday',
      StartTime: "07:30",
      EndTime: "16:30",
    },
    {
      id: 5,
      Day: 'Friday',
      StartTime: "07:30",
      EndTime: "16:30",
    },
    {
      id: 6,
      Day: 'Saturday',
      StartTime: "07:30",
      EndTime: "16:30",
    },
    {
      id: 7,
      Day: 'Sunday',
      StartTime: "07:30",
      EndTime: "16:30",
    },

  ];
  constructor(private router: Router, private modalController: ModalController, private db: DatabaseService, private alertController: AlertController) { }
  ngOnInit() {
    this.db.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.db.getInv().subscribe(invs => {
          this.invoices = invs;
        });
        this.db.getInvHours().subscribe(invhours => {
          this.invoiceHours = invhours;
        });
      }
    })
  }

  addInvoiceToDB() {
    if(this.CTDModel == null){
      this.CTDModel = 0
    }
    this.db.addInvoice(this.nameModel, this.rateModel, this.taxModel, this.CTDModel).then(data => {
      let invoiceId = data;
      if (invoiceId !== null) {
        this.db.addInvoiceHours(this.daysSelected, invoiceId);
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async CTDAlert() {
    const alert = await this.alertController.create({
      header: 'Info',
      subHeader: 'Custom Time Deduction',
      message: 'This is a deduction of time for each day selected in minutes, if left empty 0 is set to default. E.g 30 minutes break for each day',
      buttons: ['OK']
    });

    await alert.present();
  }

  onWeekdaySelectChange(e: any) {
    console.log('e', e.detail.value);

    this.daysSelected = [];

    let selectedDays = e.detail.value;

    this.weekdays.forEach(day => {
      selectedDays.forEach(selDay => {
        if (day.id === selDay) {
          this.daysSelected.push(day);
        }
      });
    });

  }

}
