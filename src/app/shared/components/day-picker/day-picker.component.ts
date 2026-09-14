import {
  Component,
  Input,
  forwardRef,
  signal,
  computed,
  inject,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
  EmbeddedViewRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HapticsService } from '../../../core/platform/haptics.service';

@Component({
  selector: 'app-day-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DayPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="day-picker-wrapper" [class.has-error]="invalid && touched" [class.disabled]="disabled">
      @if (label) {
        <label [for]="id" class="day-label">
          {{ label }}
          @if (required) { <span class="required-star">*</span> }
        </label>
      }

      <div
        class="day-input-container"
        [class.focused]="isOpen()"
        (click)="openPicker()">
        <span class="material-symbols-rounded leading-icon">today</span>
        <input
          [id]="id"
          type="text"
          readonly
          [placeholder]="placeholder"
          [value]="displayFormattedDay()"
          [disabled]="disabled"
          class="day-input-field"
        />
        <span class="material-symbols-rounded dropdown-icon">expand_more</span>
      </div>

      @if (invalid && touched && errorMessage) {
        <span class="error-msg">{{ errorMessage }}</span>
      }
    </div>

    <!-- Template do Modal do Seletor de Dia (Teleportado para document.body) -->
    <ng-template #dayPortalTemplate>
      <div class="day-backdrop" (click)="closePicker()">
        <div class="day-sheet glass-card animate-slide-up" (click)="$event.stopPropagation()">
          <!-- Drag Handle Mobile -->
          <div class="sheet-drag-handle"></div>

          <!-- Cabecalho do Modal -->
          <div class="sheet-header">
            <div class="header-title-box">
              <span class="material-symbols-rounded icon-gold">credit_card</span>
              <h4>{{ label || 'Selecionar Dia do Mês' }}</h4>
            </div>
            <button type="button" class="btn-close" (click)="closePicker()">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>

          <p class="sheet-subtitle">Escolha o dia recorrente do mês (1 a 31)</p>

          <!-- Atalhos Rápidos de Dias Comuns -->
          <div class="quick-presets">
            @for (preset of presets; track preset) {
              <button
                type="button"
                class="preset-pill"
                [class.active]="value() === preset"
                (click)="selectDay(preset)">
                Dia {{ preset }}
              </button>
            }
          </div>

          <!-- Grid de Dias (1 a 31) -->
          <div class="days-grid">
            @for (dayNum of daysList; track dayNum) {
              <button
                type="button"
                class="day-btn"
                [class.selected]="value() === dayNum"
                (click)="selectDay(dayNum)">
                {{ dayNum }}
              </button>
            }
          </div>

          <!-- Rodapé de Confirmação -->
          <div class="sheet-footer">
            <button type="button" class="btn-confirm" (click)="confirmSelection()">
              <span class="material-symbols-rounded">check</span>
              Confirmar Dia {{ value() ? '(' + value() + ')' : '' }}
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .day-picker-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      box-sizing: border-box;

      &.disabled {
        opacity: 0.6;
        pointer-events: none;
      }
    }

    .day-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-secondary, #ebd9b6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .required-star {
      color: #fb7185;
    }

    .day-input-container {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.25);
      border-radius: var(--radius-md, 12px);
      cursor: pointer;
      padding: 0 14px;
      height: 46px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: rgba(216, 184, 126, 0.5);
      }

      &.focused {
        border-color: #d8b87e;
        box-shadow: 0 0 15px rgba(216, 184, 126, 0.25);
        background: rgba(26, 10, 14, 0.85);
      }
    }

    .leading-icon {
      color: #d8b87e;
      font-size: 20px;
      margin-right: 10px;
      flex-shrink: 0;
    }

    .day-input-field {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--font-primary, inherit);
      font-size: 14px;
      color: #fbf5eb;
      cursor: pointer;

      &::placeholder {
        color: rgba(214, 200, 180, 0.45);
      }
    }

    .dropdown-icon {
      color: rgba(216, 184, 126, 0.7);
      font-size: 22px;
      flex-shrink: 0;
      margin-left: 6px;
    }

    .error-msg {
      font-size: 11px;
      color: #fb7185;
      font-weight: 600;
    }

    /* Modal Backdrop e Sheet Teleportado */
    .day-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(10, 3, 5, 0.82);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 200000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;

      @media (min-width: 600px) {
        align-items: center;
      }
    }

    .day-sheet {
      width: 100%;
      max-width: 400px;
      max-height: 90vh;
      overflow-y: auto;
      background: #180609;
      border: 1px solid rgba(216, 184, 126, 0.35);
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      padding: 14px 16px 20px 16px;
      box-sizing: border-box;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      gap: 12px;

      @media (min-width: 600px) {
        border-radius: 24px;
      }
    }

    .sheet-drag-handle {
      width: 40px;
      height: 4px;
      background: rgba(216, 184, 126, 0.35);
      border-radius: 2px;
      margin: 0 auto 2px auto;
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-title-box {
        display: flex;
        align-items: center;
        gap: 8px;

        .icon-gold { color: #d8b87e; font-size: 20px; }
        h4 { margin: 0; font-size: 15px; font-weight: 700; color: #ebd9b6; }
      }

      .btn-close {
        background: none;
        border: none;
        color: rgba(235, 217, 182, 0.6);
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover { color: #ebd9b6; background: rgba(255, 255, 255, 0.08); }
      }
    }

    .sheet-subtitle {
      margin: 0;
      font-size: 12px;
      color: rgba(235, 217, 182, 0.6);
    }

    /* Atalhos de Dias Comuns */
    .quick-presets {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .preset-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 16px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: #ebd9b6;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(216, 184, 126, 0.15);
        border-color: #d8b87e;
      }

      &.active {
        background: #d8b87e;
        color: #2b0b10;
        font-weight: 700;
        border-color: #d8b87e;
      }
    }

    /* Grid de Dias (1 a 31) */
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }

    .day-btn {
      height: 38px;
      width: 100%;
      border: 1px solid rgba(216, 184, 126, 0.15);
      background: rgba(255, 255, 255, 0.03);
      color: #ebd9b6;
      font-size: 13px;
      font-weight: 600;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        background: rgba(216, 184, 126, 0.15);
        border-color: rgba(216, 184, 126, 0.4);
      }

      &.selected {
        background: linear-gradient(135deg, #a13d63 0%, #c9a74e 100%) !important;
        color: #ffffff !important;
        font-weight: 800;
        box-shadow: 0 4px 12px rgba(161, 61, 99, 0.45);
        border: none !important;
      }
    }

    .sheet-footer {
      margin-top: 4px;
    }

    .btn-confirm {
      width: 100%;
      height: 44px;
      background: linear-gradient(135deg, #d8b87e 0%, #c19b56 100%);
      border: none;
      border-radius: 12px;
      color: #2b0b10;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(216, 184, 126, 0.3);
      transition: transform 0.15s ease;

      &:active {
        transform: scale(0.98);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `],
})
export class DayPickerComponent implements ControlValueAccessor, OnDestroy {
  private readonly haptics = inject(HapticsService);
  private readonly vcr = inject(ViewContainerRef);

  @ViewChild('dayPortalTemplate', { static: false }) dayPortalTemplate!: TemplateRef<any>;
  private portalViewRef: EmbeddedViewRef<any> | null = null;

  @Input() id = `day-picker-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder = 'Ex: 25';
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage?: string;

  value = signal<number | null>(null);
  isOpen = signal<boolean>(false);
  disabled = false;
  touched = false;

  readonly daysList = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly presets = [1, 5, 10, 15, 20, 25, 30];

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  readonly displayFormattedDay = computed(() => {
    const val = this.value();
    if (!val || val < 1 || val > 31) return '';
    return `Dia ${val}`;
  });

  writeValue(val: any): void {
    if (val !== null && val !== undefined && val !== '') {
      const num = Number(val);
      if (!isNaN(num) && num >= 1 && num <= 31) {
        this.value.set(num);
      } else {
        this.value.set(null);
      }
    } else {
      this.value.set(null);
    }
  }

  registerOnChange(fn: (val: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  openPicker(): void {
    if (this.disabled) return;
    this.haptics.impactLight();
    this.isOpen.set(true);
    setTimeout(() => this.attachToBody(), 0);
  }

  closePicker(): void {
    this.detachFromBody();
    this.isOpen.set(false);
    this.touched = true;
    this.onTouched();
  }

  selectDay(dayNum: number): void {
    this.haptics.impactMedium();
    this.value.set(dayNum);
    this.onChange(dayNum);
  }

  confirmSelection(): void {
    this.haptics.impactMedium();
    this.closePicker();
  }

  private attachToBody(): void {
    if (this.portalViewRef || !this.dayPortalTemplate) return;
    this.portalViewRef = this.vcr.createEmbeddedView(this.dayPortalTemplate);
    for (const node of this.portalViewRef.rootNodes) {
      document.body.appendChild(node);
    }
  }

  private detachFromBody(): void {
    if (!this.portalViewRef) return;
    for (const node of this.portalViewRef.rootNodes) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    this.portalViewRef.destroy();
    this.portalViewRef = null;
  }

  ngOnDestroy(): void {
    this.detachFromBody();
  }
}
