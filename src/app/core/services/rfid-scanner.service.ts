import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

/**
 * RFID Scanner Service
 *
 * Listens for keyboard input from USB HID RFID readers.
 * USB HID readers act as keyboards and send card data followed by Enter key.
 *
 * Features:
 * - Captures rapid keystrokes (typical of RFID readers)
 * - Filters out normal typing (slower input)
 * - Emits complete card numbers when Enter is pressed
 */
@Injectable({
  providedIn: 'root',
})
export class RFIDScannerService {
  private buffer = '';
  private lastKeyTime = 0;
  private readonly MAX_KEY_INTERVAL = 50; // Max ms between keystrokes for RFID
  private readonly MIN_CARD_LENGTH = 4; // Minimum card number length

  private scanSubject = new Subject<string>();
  private isListening = false;
  private boundKeyHandler: (event: KeyboardEvent) => void;

  constructor(private ngZone: NgZone) {
    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  /**
   * Start listening for RFID scans
   */
  startListening(): void {
    if (this.isListening) return;

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('keydown', this.boundKeyHandler, true);
    });
    this.isListening = true;
    console.log('RFID Scanner: Started listening');
  }

  /**
   * Stop listening for RFID scans
   */
  stopListening(): void {
    if (!this.isListening) return;

    document.removeEventListener('keydown', this.boundKeyHandler, true);
    this.isListening = false;
    this.buffer = '';
    console.log('RFID Scanner: Stopped listening');
  }

  /**
   * Get observable for scan events
   */
  onScan(): Observable<string> {
    return this.scanSubject
      .asObservable()
      .pipe(filter((cardNumber) => cardNumber.length >= this.MIN_CARD_LENGTH));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const now = Date.now();
    const timeDiff = now - this.lastKeyTime;

    // Check if user is typing in an input field (allow normal typing)
    const target = event.target as HTMLElement;
    const isInputField =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // If typing in input and slow typing, ignore (normal user input)
    if (isInputField && timeDiff > this.MAX_KEY_INTERVAL && this.buffer.length === 0) {
      return;
    }

    // Enter key - process the buffer
    if (event.key === 'Enter') {
      if (this.buffer.length >= this.MIN_CARD_LENGTH) {
        const cardNumber = this.buffer;
        this.buffer = '';

        // Prevent form submission if this was an RFID scan
        event.preventDefault();
        event.stopPropagation();

        this.ngZone.run(() => {
          console.log('RFID Scanner: Card scanned:', cardNumber);
          this.scanSubject.next(cardNumber);
        });
      } else {
        this.buffer = '';
      }
      this.lastKeyTime = now;
      return;
    }

    // Only accept alphanumeric characters
    if (event.key.length === 1 && /^[a-zA-Z0-9]$/.test(event.key)) {
      // If too much time passed, reset buffer (user typing, not RFID)
      if (timeDiff > this.MAX_KEY_INTERVAL && this.buffer.length > 0) {
        this.buffer = '';
      }

      this.buffer += event.key;
      this.lastKeyTime = now;

      // If we're building a buffer rapidly, prevent the character from appearing
      if (this.buffer.length > 1 && timeDiff <= this.MAX_KEY_INTERVAL) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  /**
   * Check if currently listening
   */
  get listening(): boolean {
    return this.isListening;
  }
}
