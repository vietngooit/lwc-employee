import { api, LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import EmployeeDetail from 'c/employeeDetail';
import searchData from '@salesforce/apex/EmployeeIndex.searchData'
import deleteEmployee from '@salesforce/apex/EmployeeIndex.deleteEmployee'
import getDataEmployees from '@salesforce/apex/EmployeeIndex.getDataEmployees';
import detailEmployee from '@salesforce/apex/EmployeeIndex.detailEmployee';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';
import { NavigationMixin } from 'lightning/navigation';

import CRUD from 'c/cRUD';

const actions = [
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' },
];

const columns = [
    { label: 'No', initialWidth: 60, fieldName: 'rowNumber' },
    { label: 'Name', fieldName: 'Name__c' },
    { label: 'Email', fieldName: 'Email__c', type: 'email' },
    { label: 'Phone', fieldName: 'Phone__c', type: 'phone' },
    { label: 'BirthDay', fieldName: 'Birthday__c' },
    {
        label: 'Actions',
        type: 'action',
        fixedWidth: 80,
        typeAttributes: { rowActions: actions },
    }
];
export default class EmployeeIndex extends NavigationMixin(LightningElement) {
    @api pre = false;
    @api next = false;
    @track EmployeeList = [];
    EmployeeData;
    processing = true;
    columns = columns;
    @track searchParams = {
        name: '',
        phone: ''
    }
    @track sizeData = false;
    limitSize = 2;
    @track startingRecord = 1;
    @track endingRecord = 0;
    @track totalRecord;
    @track page = 1;
    @track totalPage = 0;
    @track pageSize = 2;
    @track listPageSize = [2, 5, 10, 15, 20];
    @track data;
    @track selectedRows = [];
    @wire(getDataEmployees)
    getListItems(response) {
        this.EmployeeData = response;
        this.data = response.data;
        let data = response.data;
        let error = response.error;
        this.getSize(response.length);
        if (data || error) {
            this.processing = false;
        }
        if (data) {
            this.EmployeeList = [];
            this.sizeData = true;
            data.forEach(employee => {
                this.EmployeeList.push(employee);
            });
            // ---- set pagination---------
            this.totalRecord = this.EmployeeList.length;
            this.totalPage = Math.ceil(this.totalRecord/this.pageSize);
            this.EmployeeList = this.EmployeeList.slice(0, this.pageSize);
            this.endingRecord = this.pageSize;
            // ---------------------------
            this.setDisable();
        } else if (error) {
            this.dispatchToast(error.body.message, "error", "")
        }
    }
    get rowNumbers() {
        return this.EmployeeList.map((row, index) => {
            return { rowNumber: index + 1, ...row };
        });
    }
    getSize(size) {
        if(size > 0) {
            this.sizeData = true;
        }
        else {
            this.sizeData = false;
        }
    }
    searchChangeValue(event) {
        this.searchParams[event.target.dataset.index] = event.target.value;
    }
    handleGetSelectedValue(event) {
        this.pageSize = event.target.value;
        this.resetDataPagination(this.data);
        this.setDisable();
    }
    dispatchToast(message, variant, label) {
        this.dispatchEvent(
            new ShowToastEvent({
                message: message,
                variant: variant,
                label: label,
            })
        );
    }
    search(event) {
        this.processing = true;
        searchData({ name: this.searchParams.name, phone: this.searchParams.phone })
        .then(response => {
            this.data = response;
            this.EmployeeList = [];
            this.getSize(response.length);
            this.resetDataPagination(this.data);
            this.setDisable();
        })
        .catch(error => this.dispatchToast(error.body.message, "error", ""))
        .finally(() => this.processing = false);
    }
    async confirmDialog(message, variant, label) {
        const result = await LightningConfirm.open({
            message: message,
            variant: variant,
            label: label,
        });
        return result;
    }
    async callRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'edit':
                detailEmployee({RecordId: row.Id})
                .then(response => {
                    if (
                        response.Name__c == row.Name__c && 
                        response.Phone__c == row.Phone__c &&
                        response.Email__c == row.Email__c && 
                        response.BirthDay__c == row.BirthDay__c &&
                        response.Memo__c == row.Memo__c
                    ) {
                        this.showModelCrud('Edit Employee', {
                            Id: response.Id,
                            name: response.Name__c,
                            email: response.Email__c,
                            phone: response.Phone__c,
                            birthday: response.Birthday__c,
                            memo: response.Memo__c
                        });
                    } else {
                        this.dispatchToast("Employee is out of date. Please refresh page again", "error", "")
                    }
                })
                .catch(error => this.dispatchToast(error.body.message, "error", ""))
                .finally(() => this.processing = false);
                break;
            case 'delete':
                const result = await LightningConfirm.open({
                    message: 'Are you sure you want to delete this employee: ' + row.Name__c,
                    variant: 'headerless',
                    label: 'Delete',
                });
                if(result == true) {
                    console.log(result);
                    this.processing = true;
                    deleteEmployee({recordId: row.Id})
                    .then(response => {
                        if(response) {
                         this.dispatchToast("Deleted " + row.Name__c + " Success!", "success", "");
                        }
                        this.close('okay');
                     })
                     .catch(error =>  this.dispatchToast(error.body.message, "error", ""))
                     .finally(() => this.processing = false);
                }
                break;
            default:
        }
    }
    getSelectedRecord(event) {
        var value = {
            componentDef: "c:employeeDetail",
            attributes: {
                recordId: event.detail.selectedRows[0].Id,
                No: event.detail.selectedRows[0].rowNumber
            }
        }
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url: './one/one.app#' + btoa(JSON.stringify(value))
            }
        }).then((url) => {
            window.open(url);
        });
    }
    addEmployee(event) {
        this.showModelCrud('Add Employee', '');
    }
    async showModelCrud(title, params) {
        await CRUD.open({
            title: title,
            Params: params
        });
    }
    refreshPage() {
        this.processing = true;
        refreshApex(this.EmployeeData)
            .finally(() => this.processing = false,  this.dispatchToast("Refresh page was Successfully.", "success", ""));
        this.setDisable();
        this.resetDataPagination(this.EmployeeData.data);
    }

    //------ start pagination--------------
    setDisable() {
        if(this.totalPage == 1) {
            this.pre = true;
            this.next = true;
        }
        else {
            if(this.page == 1) {
                this.pre = true;
            }
            else {
                this.pre = false;
            }
            if(this.page == this.totalPage) {
                this.next = true;
            }
            else {
                this.next = false;
            }
        }
    }
    previuosHandle(event, data){
        if(this.page > 1) {
            this.page = this.page - 1;
            this.displayRecordPerPage(this.page);
        }
        this.setDisable();
    }
    nextHandle(event) {
        if(this.page  < this.totalPage && this.page !== this.totalPage) {
            this.page = this.page + 1;
            this.displayRecordPerPage(this.page);
        }
        this.setDisable();
    }
    displayRecordPerPage(page) {
        this.startingRecord = (page - 1) * this.pageSize;
        this.endingRecord = page * this.pageSize;
        this.endingRecordPerPage = this.endingRecord > this.totalRecord ? this.totalRecord : this.endingRecord;
        this.EmployeeList = [];
        for (let i = this.startingRecord; i < this.endingRecord; i++) {
            this.EmployeeList.push(this.data[i]);
        }
        this.startingRecord += 1;
    }
    resetDataPagination(data) {
        this.startingRecord = 1;
        this.endingRecord = 0;
        this.page = 1;
        this.EmployeeList = [];
        data.forEach(employee => {
            this.EmployeeList.push(employee);
        });
        this.totalRecord = this.EmployeeList.length;
        this.totalPage = Math.ceil(this.totalRecord/this.pageSize);
        this.EmployeeList = this.EmployeeList.slice(0, this.pageSize);
        this.endingRecord = this.pageSize;
    }
    //------ end pagination--------------

}