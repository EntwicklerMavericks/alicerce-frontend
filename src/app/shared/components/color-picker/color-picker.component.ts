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
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { HapticsService } from '../../../core/platform/haptics.service';

export interface ColorPreset {
  hex: string;
  name: string;
}

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="color-picker-wrapper" [class.disabled]="disabled">
      @if (label) {
        <label [for]="id" class="color-label">
          {{ label }}
        </label>
      }

      <div class="color-trigger-card" (click)="openPicker()">
        <div class="color-swatch" [style.background-color]="effectiveColor()"></div>
        <span class="color-hex-text">{{ effectiveColor().toUpperCase() }}</span>
        <span class="material-symbols-rounded palette-icon">palette</span>
      </div>

      <!-- Modal Bottom Sheet do ColorPicker Customizado (Teleportado para document.body) -->
      <ng-template #colorPortalTemplate>
        <div class="color-backdrop" (click)="closePicker()">
          <div class="color-sheet glass-card animate-slide-up" (click)="$event.stopPropagation()">
            <!-- Drag Handle Mobile -->
            <div class="sheet-drag-handle"></div>

            <!-- Cabecalho -->
            <div class="sheet-header">
              <div class="header-title-box">
                <span class="material-symbols-rounded icon-gold">palette</span>
                <h4>Cor do Cartão</h4>
              </div>
              <button type="button" class="btn-close" (click)="closePicker()">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>

            <!-- Previsualizacao do Cartao em Tempo Real -->
            <div class="card-preview-box" [style.background]="cardGradient()">
              <div class="card-preview-top">
                <span class="card-chip"></span>
                <span class="material-symbols-rounded contactless">contactless</span>
              </div>
              <div class="card-preview-bottom">
                <span class="card-holder">{{ cardName || 'SEU CARTÃO' }}</span>
                <span class="card-brand-dot"></span>
              </div>
            </div>

            <!-- Paleta de Cores Famosas / Predefinidas -->
            <div class="presets-section">
              <span class="section-title">Cores Recomendadas & Bancos</span>
              <div class="presets-grid">
                @for (preset of presets; track preset.hex) {
                  <button
                    type="button"
                    class="preset-circle-btn"
                    [style.background-color]="preset.hex"
                    [class.selected]="effectiveColor().toLowerCase() === preset.hex.toLowerCase()"
                    (click)="selectColor(preset.hex)"
                    [title]="preset.name">
                    @if (effectiveColor().toLowerCase() === preset.hex.toLowerCase()) {
                      <span class="material-symbols-rounded check-icon">check</span>
                    }
                  </button>
                }
              </div>
            </div>

            <!-- Custom Hex Code Input & Range Slider -->
            <div class="custom-color-row">
              <div class="hex-input-box">
                <span class="hex-prefix">#</span>
                <input
                  type="text"
                  maxlength="6"
                  [value]="cleanHexInput()"
                  (input)="onHexInputChange($event)"
                  placeholder="820AD1"
                  class="hex-input-field"
                />
              </div>

              <input
                type="color"
                [value]="effectiveColor()"
                (input)="onNativeColorInput($event)"
                class="native-color-swatch"
                title="Escolher Cor Livre"
              />
            </div>

            <!-- Rodape de Confirmacao -->
            <div class="sheet-footer">
              <button type="button" class="btn-confirm" (click)="confirmSelection()">
                <span class="material-symbols-rounded">check</span>
                Aplicar Cor
              </button>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .color-picker-wrapper {
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

    .color-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-secondary, #ebd9b6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .color-trigger-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.25);
      border-radius: var(--radius-md, 12px);
      padding: 8px 14px;
      height: 46px;
      cursor: pointer;
      box-sizing: border-box;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: rgba(216, 184, 126, 0.5);
        background: rgba(255, 255, 255, 0.08);
      }
    }

    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      flex-shrink: 0;
    }

    .color-hex-text {
      font-family: var(--font-primary, inherit);
      font-size: 14px;
      font-weight: 600;
      color: #fbf5eb;
      flex-grow: 1;
      letter-spacing: 1px;
    }

    .palette-icon {
      color: #d8b87e;
      font-size: 20px;
      flex-shrink: 0;
    }

    /* Backdrop Modal Teleportado para document.body */
    .color-backdrop {
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

    .color-sheet {
      width: 100%;
      max-width: 400px;
      max-height: 90vh;
      overflow-y: auto;
      background: #180609;
      border: 1px solid rgba(216, 184, 126, 0.35);
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      padding: 14px 18px 20px 18px;
      box-sizing: border-box;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      gap: 14px;

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

    /* Previsualização do Cartao de Crédito */
    .card-preview-box {
      width: 100%;
      height: 110px;
      border-radius: 16px;
      padding: 14px 16px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: background 0.3s ease;
    }

    .card-preview-top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-chip {
        width: 28px;
        height: 20px;
        background: linear-gradient(135deg, #d8b87e 0%, #a68444 100%);
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.4);
      }

      .contactless {
        color: rgba(255, 255, 255, 0.8);
        font-size: 20px;
      }
    }

    .card-preview-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-holder {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #ffffff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        text-transform: uppercase;
      }

      .card-brand-dot {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.5);
      }
    }

    /* Paleta Predefinida */
    .presets-section {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .section-title {
        font-size: 11px;
        font-weight: 700;
        color: rgba(235, 217, 182, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .presets-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;

      @media (max-width: 360px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .preset-circle-btn {
      aspect-ratio: 1;
      width: 100%;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

      &:hover {
        transform: scale(1.1);
        border-color: #ffffff;
      }

      &.selected {
        transform: scale(1.12);
        border-color: #ffffff;
        box-shadow: 0 0 14px rgba(255, 255, 255, 0.6);
      }

      .check-icon {
        color: #ffffff;
        font-size: 18px;
        font-weight: 800;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      }
    }

    /* Custom Hex Input */
    .custom-color-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .hex-input-box {
      display: flex;
      align-items: center;
      flex-grow: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.25);
      border-radius: 12px;
      padding: 0 12px;
      height: 44px;

      .hex-prefix {
        color: #d8b87e;
        font-weight: 700;
        font-size: 15px;
        margin-right: 4px;
      }

      .hex-input-field {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        font-family: var(--font-primary, inherit);
        font-size: 14px;
        font-weight: 700;
        color: #fbf5eb;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }

    .native-color-swatch {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.3);
      background: transparent;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
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
export class ColorPickerComponent implements ControlValueAccessor, OnDestroy {
  private readonly haptics = inject(HapticsService);
  private readonly vcr = inject(ViewContainerRef);

  @ViewChild('colorPortalTemplate', { static: false }) colorPortalTemplate!: TemplateRef<any>;
  private portalViewRef: EmbeddedViewRef<any> | null = null;

  @Input() id = `color-picker-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() cardName?: string;

  value = signal<string>('#820ad1');
  isOpen = signal<boolean>(false);
  disabled = false;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  readonly presets: ColorPreset[] = [
    { hex: '#820ad1', name: 'Roxo Nubank / Inter' },
    { hex: '#1c1c1e', name: 'Black Infinite XP / C6' },
    { hex: '#ff5500', name: 'Laranja Itaú / Inter' },
    { hex: '#ec0000', name: 'Vermelho Santander' },
    { hex: '#00529c', name: 'Azul Itaú / Bradesco' },
    { hex: '#a13d63', name: 'Bordô Alicerce' },
    { hex: '#c9a74e', name: 'Dourado Champagne' },
    { hex: '#00a86b', name: 'Verde Emerald' },
    { hex: '#00c4cc', name: 'Azul Tiffany' },
    { hex: '#8e8e93', name: 'Prata Platinum' },
    { hex: '#e91e63', name: 'Rosa Magenta' },
    { hex: '#b76e79', name: 'Bronze Rose' },
  ];

  readonly effectiveColor = computed(() => {
    const val = this.value();
    if (val && val.startsWith('#')) return val;
    return val ? `#${val}` : '#820ad1';
  });

  readonly cleanHexInput = computed(() => {
    return this.effectiveColor().replace('#', '').toUpperCase();
  });

  readonly cardGradient = computed(() => {
    const color = this.effectiveColor();
    return `linear-gradient(135deg, ${color} 0%, rgba(10, 3, 5, 0.85) 100%)`;
  });

  writeValue(val: any): void {
    if (val) {
      const hex = val.startsWith('#') ? val : `#${val}`;
      this.value.set(hex);
    } else {
      this.value.set('#820ad1');
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
    this.onTouched();
  }

  selectColor(hex: string): void {
    this.haptics.impactMedium();
    this.value.set(hex);
    this.onChange(hex);
  }

  onHexInputChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9a-fA-F]/g, '');
    if (raw.length === 6) {
      const hex = `#${raw}`;
      this.value.set(hex);
      this.onChange(hex);
    }
  }

  onNativeColorInput(event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    this.value.set(hex);
    this.onChange(hex);
  }

  confirmSelection(): void {
    this.haptics.impactMedium();
    this.closePicker();
  }

  private attachToBody(): void {
    if (this.portalViewRef || !this.colorPortalTemplate) return;
    this.portalViewRef = this.vcr.createEmbeddedView(this.colorPortalTemplate);
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
