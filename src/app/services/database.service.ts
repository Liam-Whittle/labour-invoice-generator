import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { SQLitePorter } from "@ionic-native/sqlite-porter/ngx";
import { HttpClient } from "@angular/common/http";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite/ngx";
import { BehaviorSubject, Observable } from "rxjs";
import { IInvoice } from "../models/iinvoice.model";
import { IInvoiceHours } from "../models/iinvoice-hours.model";
import { IInvoiceDOW } from "../models/iinvoice-dow.model";
import { element } from "protractor";
import { WeekDay } from "@angular/common";

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    private database: SQLiteObject;
    private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

    invoice = new BehaviorSubject([]);
    invoiceHours = new BehaviorSubject([]);
    invoiceDOW = new BehaviorSubject([]);

    constructor(private plt: Platform, private sqlitePorter: SQLitePorter, private sqlite: SQLite, private http: HttpClient) {
        this.plt.ready().then(() => {
            this.sqlite.create({
                name: 'invoiceStorage.db',
                location: 'default'
            })
                .then((db: SQLiteObject) => {
                    console.log("Then Fired!",);
                    this.database = db;
                    console.log("DB: ", this.database);
                    this.seedDatabase();
                });
        });
    }

    seedDatabase() {
        this.http.get('../../assets/seed.sql', { responseType: 'text' })
            .subscribe(sql => {
                console.log("Seed SQL: ", sql);
                this.sqlitePorter.importSqlToDb(this.database, sql)
                    .then(_ => {
                        this.loadInvoices();
                        this.loadInvoiceHours();
                        this.loadInvoiceDOW();
                        this.dbReady.next(true);
                    })
                    .catch(e => console.error(e))
            });
    }

    getDatabaseState() {
        return this.dbReady.asObservable();
    }

    getInv(): Observable<IInvoice[]> {
        return this.invoice.asObservable();
    }

    getInvHours(): Observable<IInvoiceHours[]> {
        return this.invoiceHours.asObservable();
    }

    loadInvoices() {
        return this.database.executeSql('SELECT * FROM Invoice', []).then(data => {
            let invoices: IInvoice[] = [];

            if (data.rows.length > 0) {
                for (var i = 0; i < data.rows.length; i++) {
                    invoices.push({
                        id: data.rows.item(i).id,
                        name: data.rows.item(i).name,
                        rate: data.rows.item(i).rate,
                        tax: data.rows.item(i).deductableTaxPercentage,
                        customDeduction: data.rows.item(i).deductableTaxTime
                    });
                }
            }
            this.invoice.next(invoices);
        });
    }

    loadInvoiceHours() {
        return this.database.executeSql('SELECT * FROM InvoiceHoursWorked', []).then(data => {
            let invoicesHours: IInvoiceHours[] = [];

            if (data.rows.length > 0) {
                for (var i = 0; i < data.rows.length; i++) {
                    invoicesHours.push({
                        id: data.rows.item(i).id,
                        endTime: data.rows.item(i).endTime,
                        startTime: data.rows.item(i).startTime,
                        dowID: data.rows.item(i).dowID,
                        invoiceID: data.rows.item(i).invoiceID,
                    });
                }
            }
            console.log('test load inv hours', invoicesHours);
            this.invoiceHours.next(invoicesHours);
        });
    }

    loadInvoiceDOW() {
        return this.database.executeSql('SELECT * FROM DaysOfWeek', []).then(data => {
            let invoicesDOW: IInvoiceDOW[] = [];

            if (data.rows.length > 0) {
                for (var i = 0; i < data.rows.length; i++) {
                    invoicesDOW.push({
                        id: data.rows.item(i).id,
                        weekName: data.rows.item(i).id
                    });
                }
            }
            this.invoiceDOW.next(invoicesDOW);
        });
    }

    addInvoiceHours(daysSelected: any[], invoiceID: number) {
        const sqlQueries = [];
        daysSelected.forEach(day => {
            sqlQueries.push(`
                INSERT INTO InvoiceHoursWorked (startTime, endTime, dowID, invoiceID) VALUES ('${day.StartTime}', '${day.EndTime}', ${day.id}, ${invoiceID})
            `)
        });
        console.log('sqlQueries', sqlQueries);
        return this.database.sqlBatch(sqlQueries).then(() => {
            this.loadInvoiceHours();
        });
    }

    addInvoice(name, rate, tax, ctd) {
        let data = [name, rate, tax, ctd]
        return this.database.executeSql('INSERT INTO Invoice (name, rate, deductableTaxPercentage, deductableTaxTime) VALUES (?, ?, ?, ?)', data).then((data: any) => {
            this.loadInvoices();
            return data.insertId;
        });
    }

    getInvoiceByID(id): Promise<IInvoice> {
        return this.database.executeSql('SELECT * FROM Invoice WHERE id = ?', [id]).then(data => {
            return {
                id: data.rows.item(0).id,
                name: data.rows.item(0).name,
                rate: data.rows.item(0).rate,
                tax: data.rows.item(0).deductableTaxPercentage,
                customDeduction: data.rows.item(0).deductableTaxTime
            }
        });
    }

    getInvHoursByInvID(id): Promise<IInvoiceHours[]> {
        return this.database.executeSql('SELECT * FROM InvoiceHoursWorked WHERE invoiceID = ?', [id]).then(data => {
            let invoicesHours: IInvoiceHours[] = [];

            if (data.rows.length > 0) {
                for (var i = 0; i < data.rows.length; i++) {
                    invoicesHours.push({
                        id: data.rows.item(i).id,
                        endTime: data.rows.item(i).endTime,
                        startTime: data.rows.item(i).startTime,
                        dowID: data.rows.item(i).dowID,
                        invoiceID: data.rows.item(i).invoiceID,
                    });
                }
            }
            return invoicesHours;
        });
    }

    deleteInvoiceByID(id) {
        let deleteInvoice = `DELETE FROM Invoice WHERE id = ${id}`;
        let deleteInvoiceHoursWorked = `DELETE FROM InvoiceHoursWorked WHERE invoiceID = ${id}`;
        const sqlQueries = [deleteInvoiceHoursWorked, deleteInvoice];
        return this.database.sqlBatch(sqlQueries).then(_ => {
            this.loadInvoices();
            this.loadInvoiceHours();
        });
    }

    deleteInvoiceHoursRowByID(id: IInvoiceHours) {
        return this.database.executeSql(`DELETE FROM InvoiceHoursWorked WHERE id = ${id.id}`).then(data => {
            this.loadInvoiceHours();
        })
    }

    deleteInvoiceHoursByInvoice(id: number){
        return this.database.executeSql(`DELETE FROM InvoiceHoursWorked WHERE invoiceID = ${id}`).then(data => {
            console.log('data delete inv hours', data);
            this.loadInvoiceHours();
        })
    }

    deleteAllInvoices() {
        let deleteInvoice = 'DELETE FROM Invoice';
        let deleteInvoiceHoursWorked = 'DELETE FROM InvoiceHoursWorked';
        const sqlQueries = [deleteInvoiceHoursWorked, deleteInvoice];

        this.database.sqlBatch(sqlQueries).then(_ => {
            this.loadInvoices();
            this.loadInvoiceHours();
        });
    }

    updateInvoiceByID(inv: IInvoice) {
        let data = [inv.name, inv.rate, inv.tax, inv.customDeduction];
        return this.database.executeSql(`UPDATE Invoice SET name = ?, rate = ?, deductableTaxPercentage = ?, deductableTaxTime = ? WHERE id = ${inv.id}`, data).then(data => {
            this.loadInvoices();
        })
    }

    updateInvoiceHoursByID(rowID, startTime, endTime, dowID) {
        let data = [startTime, endTime, dowID];
        console.log('update', data);
        return this.database.executeSql(`UPDATE InvoiceHoursWorked SET startTime = ?, endTime = ?, dowID = ? WHERE id = ${rowID}`, data).then(data => {
            console.log("data", data)
            this.loadInvoiceHours();
        })
    }
}