import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IInvoiceHours } from '../models/iinvoice-hours.model';
import { IInvoice } from '../models/iinvoice.model';
import { IWeekday } from '../models/iweekday.model';
import { DatabaseService } from '../services/database.service';
import { Papa } from 'ngx-papaparse';
import { EmailComposer, EmailComposerOptions } from '@awesome-cordova-plugins/email-composer/ngx';
import { File } from '@ionic-native/file/ngx'

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {

  natURL;
  hasAccount = "false";
  showPreview;
  formatedCSV;
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
  constructor(private modalController: ModalController, private db: DatabaseService, private papa: Papa, private emailComposer: EmailComposer, private file: File) { }
  ngOnInit() {
    this.db.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.db.getInvHoursByInvID(this.invoice.id).then(invhours => {
          this.invoiceHours = invhours;
          this.getInvoiceSelectedValues();
          this.createCSVTemplate();
          this.checkAccount()
          this.file.writeFile(this.file.dataDirectory, 'invoice.csv', this.formatedCSV, { replace: true }).then(res => {
            this.natURL = res.nativeURL;
            console.log('naturl', this.natURL)
            console.log('naturl', this.showPreview)
          })
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

  closeModal() {
    this.modalController.dismiss();
  }

  createCSVTemplate() {
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    var subtotalNum = 0;

    var csv: Array<any> = [
      ["NAME:", this.invoice.name, , , , "DATE:", today.toLocaleDateString()],
      [, , , , , ,],
      [, , , , , ,],
      [" DAYS & INTERVALS ", , , , "HRS", "RATE", "SUM"],
    ];

    this.daysSelected.forEach(day => {
      var hour = (this.timeStringToFloat(day.EndTime) - this.timeStringToFloat(day.StartTime)) - (this.invoice.customDeduction / 60);
      var amount = hour * this.invoice.rate;
      csv.push([day.Day, day.StartTime + " - " + day.EndTime, , , hour.toFixed(2), this.invoice.rate, amount.toFixed(2)]);
      subtotalNum = subtotalNum + amount;
    })

    var taxAmount = subtotalNum * (this.invoice.tax / 100)

    csv.push(
      [, , , , , ,],
      [, , , , , ,],
      [, , , , , "SUBTOTAL", "$" + subtotalNum.toFixed(2)],
      [, , , , , "TAX RATE", -this.invoice.tax.toFixed(2) + ".00" + "%"],
      [, , , , , "TAX", "$-" + taxAmount.toFixed(2)],
      [, , , , , "TOTAL", "$" + (subtotalNum - taxAmount).toFixed(2)])

    console.log(subtotalNum)
    console.log(this.papa.unparse(csv))

    this.showPreview = csv
    this.formatedCSV = this.papa.unparse(csv)
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

  timeStringToFloat(time) {
    var hoursMinutes = time.split(/[.:]/);
    var hours = parseInt(hoursMinutes[0], 10);
    var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
    return hours + minutes / 60;
  }

  async checkAccount() {
    this.hasAccount = await this.emailComposer.hasAccount();
  }

  async sendInvoiceCSV() {
    const email: EmailComposerOptions = {
      to: '',
      cc: '',
      attachments: [this.natURL],
      subject: this.invoice.name,
      body: '',
    }

    await this.emailComposer.open(email)
  }

}
