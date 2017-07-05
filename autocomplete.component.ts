import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { KeyboardKeys, KeyMapper, AutoComplete } from './keys'; // Import Keyboard keys and mapper

@Component({
  selector: 'app-autocomplete',
  styleUrls: ['./autocomplete.component.css'],
  template: `
  
  <div class="autocomplete" *ngIf="autoComplete.options">
			<ul class="autocomplete-options">
				<li *ngFor="let option of autoComplete.options; let i = index" tabindex="2">
          <span *ngIf="i < optionsLimit">
          <a (click)="onOptionSelect(option)" [ngClass]="{ active: (optionIndex === i && originInput === false)}">{{ option }}</a>
          </span>
				</li>
			</ul>
  </div>
  `
})
export class AutocompleteComponent implements OnInit {
  @Output() optionSelected: EventEmitter<string> = new EventEmitter<string>(); // Outputs the selected autocomplete option
  @Input() autoComplete: AutoComplete; // Pass in an object of AutoComplete which defines various values required
  optionIndex: number = 0; // changes active item in autocomplete options
  originInput: boolean = true;

  constructor() { }

  ngOnInit() {
    // Ensure optionSelected is null
    this.optionSelected = null;
  }

  // Listen for keyboard event - Filter auto complete options list 
  @HostListener('window:keydown', ['$event'])
  findInAutoCompleteOptions(event: KeyboardEvent) {
    // Call helper class to map keyboard key
    let direction = KeyMapper.MapKeyBoardKey(event);

    // Return if key pressed is not mapped
    if (direction === KeyboardKeys.KeyNotMapped) { this.optionIndex = 0; return; }

    // Return if there are no autocomplete options to show
    if (!this.autoComplete.options) { return; }

    // Increment active option depennding on direction
    switch (direction) {
      case KeyboardKeys.Down:
        // dont increment if directly from input
        if (this.originInput) {
          this.originInput = false;
          return;
        }
        // check index and loop to beginning of list if needed.
        if (this.optionIndex === (this.autoComplete.optionsLimit - 1) || this.optionIndex === (this.autoComplete.options.length - 1)) {
          this.optionIndex = 0;
          return;
        }
        this.optionIndex++; // increment to nav down
        break;
      case KeyboardKeys.Up:
        event.preventDefault(); // stops the cursor from moving
        this.optionIndex != -1 ? this.optionIndex-- : -1;
        break;
      case KeyboardKeys.Enter:
        this.onOptionSelect(this.autoComplete.options[this.optionIndex]);
        break;
      case KeyboardKeys.Escape:
        this.reset();
      default:
        break;
    }
  }

  // Auto Complete option has been selected
  onOptionSelect(option: string) {
    this.autoComplete.options = null;
    this.optionSelected.emit(option);
    this.reset();
  }

  // Reset back to defaults (safety precaution more than anything)
  reset() {
    this.autoComplete = null;
    this.optionIndex = 0;
    this.originInput = true;
  }

}
