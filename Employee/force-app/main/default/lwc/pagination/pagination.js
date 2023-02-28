import { api, LightningElement } from 'lwc';

export default class Pagination extends LightningElement {
    @api dis_next = false;
    @api dis_pre = false;
    handlePrevious(event) {
        this.dispatchEvent(new CustomEvent('previous'));
    }
    handleNext(event) {
        this.dispatchEvent(new CustomEvent('next'));
    }
}