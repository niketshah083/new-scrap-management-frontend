import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qc-report-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qc-report-list">
      <h1>QC Reports</h1>
      <p>View and export QC inspection reports with filtering options.</p>
    </div>
  `,
  styles: [
    `
      .qc-report-list {
        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }
        p {
          color: #64748b;
        }
      }
    `,
  ],
})
export class QcReportListComponent {}
