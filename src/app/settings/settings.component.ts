import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  constructor(private db: DatabaseService) { }

  ngOnInit() {}

  //-- POTENTIAL SETTINGS --
  //Default name template e.g "Invoice " + whatever suffix you want  
  //Set Default Deducted tax percentage to replace placeholder for create modal field
  
  //-- DEBUG SETTING --
  deleteAllInvoices(){
   this.db.deleteAllInvoices();
  }
}
