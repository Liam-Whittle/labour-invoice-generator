import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { IInvoice } from '../models/iinvoice.model';
import { IInvoiceHours } from '../models/iinvoice-hours.model';
import { IWeekday } from '../models/iweekday.model';


@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {

  invoice: IInvoice;
  invoiceHours: IInvoiceHours[];
  daysSelected: IWeekday[] = [];
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
  constructor(private router: Router, private modalController: ModalController, private db: DatabaseService) { }
  ngOnInit() {
    this.db.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.db.getInvHoursByInvID(this.invoice.id).then(invhours => {
          this.invoiceHours = invhours;
          this.getInvoiceSelectedValues();
        });
      }
    })
  }

  getInvoiceSelectedValues() {
    console.log("inv hours table", this.invoiceHours);
    this.invoiceHours.forEach(invHourItem => {
      this.weekdays.forEach(day => {
        if (invHourItem.dowID === day.id) {
          this.daysSelected.push(
            {
              id: invHourItem.dowID,
              Day: day.Day,
              StartTime: invHourItem.startTime,
              EndTime: invHourItem.endTime
            }
          );
        };
      });
    });
  }

  editInvoiceInDB() {
    this.db.updateInvoiceByID(this.invoice).then(_ => {
      this.db.deleteInvoiceHoursByInvoice(this.invoice.id);
      this.db.addInvoiceHours(this.daysSelected, this.invoice.id);
    this.closeModal();
    });
  }

  closeModal() {
    this.modalController.dismiss();
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
