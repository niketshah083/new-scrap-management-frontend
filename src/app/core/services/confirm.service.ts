import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  constructor(private confirmationService: ConfirmationService) {}

  confirmDelete(itemName: string = 'this item'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: `Are you sure you want to delete ${itemName}?`,
        header: 'Confirm Delete',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  confirmStatusChange(action: string, itemName: string = 'this item'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: `Are you sure you want to ${action} ${itemName}?`,
        header: 'Confirm Action',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  confirm(message: string, header: string = 'Confirm'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message,
        header,
        icon: 'pi pi-question-circle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
