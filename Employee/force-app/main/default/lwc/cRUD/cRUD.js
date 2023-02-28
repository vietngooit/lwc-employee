import LightningModal from 'lightning/modal';
import { api, track } from 'lwc';
import newEmployee from '@salesforce/apex/EmployeeIndex.newEmployee';
import updateEmployee from '@salesforce/apex/EmployeeIndex.updateEmployee';
import LightningAlert from "lightning/alert"
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class CRUD extends LightningModal {
    @api title;
    @api Params = {
        Id: '',
        name: '',
        email: '',
        phone: '',
        birthday: '',
        memo: ''
    };
    @track employee = {
        name: '',
        email: '',
        phone: '',
        birthday: '',
        memo: ''
    }

    @track cnt = true;
    onChangeValue(event) {
        if(this.Params && this.cnt) {
            this.employee = {
                name: this.Params.name,
                email: this.Params.email,
                phone: this.Params.phone,
                birthday: this.Params.birthday,
                memo: this.Params.memo
            }
            this.cnt = false;
        }
        this.employee[event.target.dataset.index] = event.target.value;
    }
    async showAlterMessage(message, theme, label) {
        await LightningAlert.open({
            message: message,
            theme: theme,
            label: label,
        });
    }
    dispatchToast(message, variant, label) {
        this.dispatchEvent(
            new ShowToastEvent({
                message: message,
                variant: variant,
                label: label,
            })
        );
        this.close('okay');
    }
    addEmployee() {
        if(!this.Params) {
            newEmployee({
                Name: this.employee.name, 
                Email: this.employee.email,
                Phone: this.employee.phone,
                Birthday: this.employee.birthday,
                Memo: this.employee.memo,
            })
            .then(response => {
               if(response) {
                this.dispatchToast("Add " + this.employee.name + " Success!", "success", "");
                    this.employee = {
                        name: '',
                        email: '',
                        phone: '',
                        birthday: '',
                        memo: ''
                    }
               }
               this.close('okay');
            })
            .catch(error =>  this.dispatchToast(error.body.message, "error", ""))
            .finally(() => this.processing = false);
        }
        else {
            updateEmployee({
                recordId: this.Params.Id,
                Name: this.employee.name, 
                Email: this.employee.email,
                Phone: this.employee.phone,
                Birthday: this.employee.birthday,
                Memo: this.employee.memo,
            })
            .then(response => {
               if(response) {
                    this.cnt = true;
                    this.dispatchToast("Updated " + this.employee.name + " Success!", "success", "");
                    this.employee = {
                        name: '',
                        email: '',
                        phone: '',
                        birthday: '',
                        memo: ''
                    };
                    this.Params = {
                        Id: '',
                        name: '',
                        email: '',
                        phone: '',
                        birthday: '',
                        memo: ''
                    };
               }
            })
            .catch(error =>  this.dispatchToast(error.body.message, "error", ""))
            .finally(() => this.processing = false);
        }
    }
    cancel() {
        this.close('okay');
    }
}