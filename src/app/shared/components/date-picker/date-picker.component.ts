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

export interface CalendarDay {
  date: Date;
  isoString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="date-picker-wrapper" [class.has-error]="invalid && touched" [class.disabled]="disabled">
      @if (label) {
        <label [for]="id" class="date-label">
          {{ label }}
          @if (required) { <span class="required-star">*</span> }
        </label>
      }

      <div
        class="date-input-container"
        [class.focused]="isOpen()"
        (click)="openPicker()">
        <span class="material-symbols-rounded leading-icon">calendar_month</span>
        <input
          [id]="id"
          type="text"
          readonly
          [placeholder]="placeholder"
          [value]="displayFormattedDate()"
          [disabled]="disabled"
          class="date-input-field"
        />
        <span class="material-symbols-rounded dropdown-icon">expand_more</span>
      </div>

      @if (invalid && touched && errorMessage) {
        <span class="error-msg">{{ errorMessage }}</span>
      }
    </div>

    <!-- Template do Modal/Sheet do Calendario (Teleportado para document.body) -->
    <ng-template #calendarPortalTemplate>
      <div class="calendar-backdrop" (click)="closePicker()">
        <div class="calendar-sheet glass-card animate-slide-up" (click)="$event.stopPropagation()">
          <!-- Drag Handle Mobile -->
          <div class="sheet-drag-handle"></div>

          <!-- Cabecalho do Modal -->
          <div class="sheet-header">
            <div class="header-title-box">
              <span class="material-symbols-rounded icon-gold">event</span>
              <h4>Selecionar Data</h4>
            </div>
            <button type="button" class="btn-close" (click)="closePicker()">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>

          <!-- Navegação Mês e Ano -->
          <div class="month-nav">
            <button type="button" class="nav-btn" (click)="prevMonth()" title="Mês Anterior">
              <span class="material-symbols-rounded">chevron_left</span>
            </button>

            <span class="month-year-title">{{ nomeMesAnoAtual() }}</span>

            <button type="button" class="nav-btn" (click)="nextMonth()" title="Próximo Mês">
              <span class="material-symbols-rounded">chevron_right</span>
            </button>
          </div>

          <!-- Dias da Semana -->
          <div class="weekdays-grid">
            <span>D</span>
            <span>S</span>
            <span>T</span>
            <span>Q</span>
            <span>Q</span>
            <span>S</span>
            <span>S</span>
          </div>

          <!-- Grid de Dias do Mês -->
          <div class="days-grid">
            @for (day of daysGrid(); track day.isoString) {
              <button
                type="button"
                class="day-btn"
                [class.other-month]="!day.isCurrentMonth"
                [class.today]="day.isToday"
                [class.selected]="day.isSelected"
                (click)="selectDay(day)">
                <span class="day-number">{{ day.dayNumber }}</span>
              </button>
            }
          </div>

          <!-- Atalhos Rápidos Mobile -->
          <div class="quick-actions">
            <button type="button" class="quick-pill" (click)="selectToday()">Hoje</button>
            <button type="button" class="quick-pill" (click)="selectTomorrow()">Amanhã</button>
            <button type="button" class="quick-pill" (click)="selectNextWeek()">+7 Dias</button>
            @if (value()) {
              <button type="button" class="quick-pill clear" (click)="clearSelection()">Limpar</button>
            }
          </div>

          <!-- Rodapé de Confirmação -->
          <div class="sheet-footer">
            <button type="button" class="btn-confirm" (click)="confirmSelection()">
              <span class="material-symbols-rounded">check</span>
              Confirmar Data
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .date-picker-wrapper {
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

    .date-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-secondary, #ebd9b6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .required-star {
      color: #fb7185;
    }

    .date-input-container {
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

    .date-input-field {
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

    /* Modal Backdrop e Bottom Sheet Teleportados para document.body */
    .calendar-backdrop {
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

    .calendar-sheet {
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

    /* Mês e Ano Header */
    .month-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 12px;
      padding: 4px 10px;

      .month-year-title {
        font-size: 14px;
        font-weight: 700;
        color: #ebd9b6;
        text-transform: capitalize;
      }

      .nav-btn {
        background: none;
        border: none;
        color: #d8b87e;
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(216, 184, 126, 0.15);
        }
      }
    }

    /* Dias da Semana */
    .weekdays-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      color: rgba(216, 184, 126, 0.8);
      padding: 0 2px;
    }

    /* Grid de Dias */
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      padding: 0;
    }

    .day-btn {
      height: 36px;
      width: 100%;
      border: none;
      background: transparent;
      color: #ebd9b6;
      font-size: 13px;
      font-weight: 600;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover:not(.other-month) {
        background: rgba(216, 184, 126, 0.15);
      }

      &.other-month {
        color: rgba(235, 217, 182, 0.2);
      }

      &.today {
        border: 1.5px solid #d8b87e;
        color: #d8b87e;
        font-weight: 800;
      }

      &.selected {
        background: linear-gradient(135deg, #a13d63 0%, #c9a74e 100%) !important;
        color: #ffffff !important;
        font-weight: 800;
        box-shadow: 0 4px 12px rgba(161, 61, 99, 0.45);
        border: none !important;
      }
    }

    /* Atalhos Rápidos */
    .quick-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .quick-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 16px;
      padding: 5px 12px;
      font-size: 11px;
      font-weight: 600;
      color: #ebd9b6;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(216, 184, 126, 0.15);
        border-color: #d8b87e;
      }

      &.clear {
        color: #fb7185;
        border-color: rgba(251, 113, 133, 0.3);

        &:hover {
          background: rgba(251, 113, 133, 0.15);
        }
      }
    }

    .sheet-footer {
      margin-top: 2px;
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
export class DatePickerComponent implements ControlValueAccessor, OnDestroy {
  private readonly haptics = inject(HapticsService);
  private readonly vcr = inject(ViewContainerRef);

  @ViewChild('calendarPortalTemplate', { static: false }) calendarPortalTemplate!: TemplateRef<any>;
  private portalViewRef: EmbeddedViewRef<any> | null = null;

  @Input() id = `date-picker-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder = 'DD/MM/AAAA';
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage?: string;

  value = signal<string>(''); // Formato YYYY-MM-DD
  isOpen = signal<boolean>(false);
  disabled = false;
  touched = false;

  currentMonthDate = signal<Date>(new Date());

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  readonly nomeMesAnoAtual = computed(() => {
    const d = this.currentMonthDate();
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  readonly displayFormattedDate = computed(() => {
    const iso = this.value();
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  });

  readonly daysGrid = computed<CalendarDay[]>(() => {
    const viewingDate = this.currentMonthDate();
    const year = viewingDate.getFullYear();
    const month = viewingDate.getMonth();

    const selectedIso = this.value();

    const todayObj = new Date();
    const todayIso = this.formatToIso(todayObj);

    // Primeiro dia do mês e dia da semana (0 = Dom, 1 = Seg...)
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Dias do mês anterior para preencher a primeira semana
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Preencher dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDate - i);
      const iso = this.formatToIso(prevDate);
      days.push({
        date: prevDate,
        isoString: iso,
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: iso === todayIso,
        isSelected: iso === selectedIso,
      });
    }

    // Preencher dias do mês atual
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const currDate = new Date(year, month, d);
      const iso = this.formatToIso(currDate);
      days.push({
        date: currDate,
        isoString: iso,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: iso === todayIso,
        isSelected: iso === selectedIso,
      });
    }

    // Preencher dias do próximo mês até completar semanas (múltiplo de 7)
    const remainingDays = 42 - days.length; // 6 semanas completas de 7 dias
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      const iso = this.formatToIso(nextDate);
      days.push({
        date: nextDate,
        isoString: iso,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: iso === todayIso,
        isSelected: iso === selectedIso,
      });
    }

    return days;
  });

  writeValue(val: any): void {
    if (val) {
      if (val instanceof Date) {
        const iso = this.formatToIso(val);
        this.value.set(iso);
        this.currentMonthDate.set(new Date(val.getFullYear(), val.getMonth(), 1));
      } else if (typeof val === 'string') {
        const iso = val.substring(0, 10);
        this.value.set(iso);
        const parts = iso.split('-');
        if (parts.length === 3) {
          this.currentMonthDate.set(new Date(Number(parts[0]), Number(parts[1]) - 1, 1));
        }
      }
    } else {
      this.value.set('');
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
    const currentVal = this.value();
    if (currentVal) {
      const parts = currentVal.split('-');
      if (parts.length === 3) {
        this.currentMonthDate.set(new Date(Number(parts[0]), Number(parts[1]) - 1, 1));
      }
    } else {
      this.currentMonthDate.set(new Date());
    }

    this.isOpen.set(true);
    // Usar setTimeout para garantir que ViewChild template foi inicializado antes do attach
    setTimeout(() => this.attachToBody(), 0);
  }

  closePicker(): void {
    this.detachFromBody();
    this.isOpen.set(false);
    this.touched = true;
    this.onTouched();
  }

  prevMonth(): void {
    this.haptics.selectionChanged();
    const curr = this.currentMonthDate();
    this.currentMonthDate.set(new Date(curr.getFullYear(), curr.getMonth() - 1, 1));
  }

  nextMonth(): void {
    this.haptics.selectionChanged();
    const curr = this.currentMonthDate();
    this.currentMonthDate.set(new Date(curr.getFullYear(), curr.getMonth() + 1, 1));
  }

  selectDay(day: CalendarDay): void {
    this.haptics.impactMedium();
    this.value.set(day.isoString);
    if (!day.isCurrentMonth) {
      this.currentMonthDate.set(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
    }
    this.onChange(day.isoString);
  }

  selectToday(): void {
    this.haptics.impactMedium();
    const today = new Date();
    const iso = this.formatToIso(today);
    this.value.set(iso);
    this.currentMonthDate.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.onChange(iso);
  }

  selectTomorrow(): void {
    this.haptics.impactMedium();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = this.formatToIso(tomorrow);
    this.value.set(iso);
    this.currentMonthDate.set(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1));
    this.onChange(iso);
  }

  selectNextWeek(): void {
    this.haptics.impactMedium();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const iso = this.formatToIso(nextWeek);
    this.value.set(iso);
    this.currentMonthDate.set(new Date(nextWeek.getFullYear(), nextWeek.getMonth(), 1));
    this.onChange(iso);
  }

  clearSelection(): void {
    this.haptics.impactLight();
    this.value.set('');
    this.onChange('');
  }

  confirmSelection(): void {
    this.haptics.impactMedium();
    this.closePicker();
  }

  private attachToBody(): void {
    if (this.portalViewRef || !this.calendarPortalTemplate) return;
    this.portalViewRef = this.vcr.createEmbeddedView(this.calendarPortalTemplate);
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

  private formatToIso(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
