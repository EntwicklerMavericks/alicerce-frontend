import { Component, inject, signal, computed, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HapticsService } from '../../../core/platform/haptics.service';
import { OverlayService } from '../../../core/services/overlay.service';
import { FormularioDespesaComponent } from '../../../features/lancamentos/components/formulario-despesa.component';
import { FormularioReceitaComponent } from '../../../features/lancamentos/components/formulario-receita.component';
import { FormularioCompraCartaoComponent } from '../../../features/cartoes/components/formulario-compra-cartao.component';
import { FormularioMetaComponent } from '../../../features/metas/components/formulario-meta.component';
import { FormularioProjetoComponent } from '../../../features/projetos/components/formulario-projeto.component';
import { FormularioWishlistComponent } from '../../../features/wishlist/components/formulario-wishlist.component';

export interface RadialMenuItem {
  id: string;
  label: string;
  category: string;
  icon: string;
  color: string;
  component: any;
}

@Component({
  selector: 'app-radial-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Trigger Button no Centro da Bottom Bar -->
    <div class="radial-trigger-wrapper">
      <button
        type="button"
        class="radial-trigger-btn"
        [class.active]="isOpen()"
        (click)="toggleMenu()"
        title="Ações Rápidas em Roda Rotativa"
        aria-label="Abrir Roda de Ações"
      >
        <div class="glow-effect"></div>
        <span class="material-symbols-rounded trigger-icon">
          {{ isOpen() ? 'close' : 'add' }}
        </span>
      </button>
      <span class="trigger-label">{{ isOpen() ? 'Fechar' : 'Criar' }}</span>
    </div>

    <!-- Backdrop Translúcido com Blur Suave -->
    @if (isOpen()) {
      <div
        class="radial-backdrop"
        [class.closing]="isClosing()"
        (click)="closeMenu()"
        (window:keydown.escape)="closeMenu()"
      >
        <!-- Container Flutuante da Roleta Perfeitamente Simétrica -->
        <div
          #wheelContainer
          class="wheel-modal-container"
          [class.closing]="isClosing()"
          (click)="$event.stopPropagation()"
          (touchstart)="onTouchStart($event)"
          (touchmove)="onTouchMove($event)"
          (touchend)="onTouchEnd()"
          (mousedown)="onMouseDown($event)"
        >
          <!-- Título Interativo / Botão de Ação Ativo -->
          <div class="wheel-header">
            <span class="wheel-subtitle">DESLIZE A ROLETA OU TOQUE NO ÍCONE DESTACADO PARA CRIAR</span>
            <div
              class="active-item-badge"
              [style.border-color]="activeItem().color"
              (click)="confirmSelection()"
              title="Clique para criar"
            >
              <span class="material-symbols-rounded active-icon" [style.color]="activeItem().color">
                {{ activeItem().icon }}
              </span>
              <span class="active-title">Criar {{ activeItem().label }}</span>
              <span class="material-symbols-rounded click-arrow">arrow_forward</span>
            </div>
          </div>

          <!-- Roleta Circular 100% Simétrica -->
          <div class="wheel-dial-wrapper">
            <!-- Indicador de Seta no Topo (12 horas) -->
            <div class="dial-center-pointer">
              <span class="material-symbols-rounded">arrow_drop_down</span>
            </div>

            <!-- Círculo Rotativo Perfeito -->
            <div
              class="wheel-dial"
              [style.transform]="'rotate(' + rotationAngle() + 'deg)'"
              [class.dragging]="isDragging()"
            >
              @for (item of items; track item.id; let index = $index) {
                <div
                  class="wheel-node"
                  [class.highlighted]="index === selectedIndex()"
                  [style.transform]="getNodeTransform(index)"
                  (click)="selectItem(item, index)"
                >
                  <div
                    class="node-icon-box"
                    [class.center-active]="index === selectedIndex()"
                    [style.background]="getNodeBackground(item, index === selectedIndex())"
                    [style.transform]="'rotate(' + (-rotationAngle()) + 'deg) ' + (index === selectedIndex() ? 'scale(1.35)' : 'scale(1)')"
                  >
                    <span class="material-symbols-rounded" [style.color]="index === selectedIndex() ? '#2A0B12' : item.color">
                      {{ item.icon }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1 1 0px;
      justify-content: center;
      align-items: center;
      width: 100%;
      min-width: 0;
    }

    .radial-trigger-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 105;
      margin-top: -26px;
      width: 100%;
    }

    .radial-trigger-btn {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: linear-gradient(135deg, #A13D63 0%, #3D0D15 100%);
      border: 2px solid #C9A74E;
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(161, 61, 99, 0.65), 0 0 20px rgba(201, 167, 78, 0.5);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      outline: none;

      &:active {
        transform: scale(0.92);
      }

      &.active {
        background: linear-gradient(135deg, #E8D39E 0%, #9A772B 100%);
        border-color: #FFF;
        color: #2A0B12;
        transform: rotate(180deg);
        box-shadow: 0 0 30px rgba(201, 167, 78, 0.9), 0 0 15px #FFF;
      }

      .glow-effect {
        position: absolute;
        inset: -5px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(201, 167, 78, 0.5) 0%, transparent 70%);
        opacity: 0.85;
        pointer-events: none;
        animation: pulseGlow 2.5s infinite alternate;
      }

      .trigger-icon {
        font-size: 30px;
        font-weight: 700;
        z-index: 2;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      }
    }

    @keyframes pulseGlow {
      0% { transform: scale(0.95); opacity: 0.5; }
      100% { transform: scale(1.18); opacity: 1; }
    }

    .trigger-label {
      font-size: 9px;
      font-weight: 800;
      color: #E8D39E;
      margin-top: 3px;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-shadow: 0 0 8px rgba(201, 167, 78, 0.5);
    }

    .radial-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      background: rgba(18, 5, 8, 0.45);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      animation: fadeIn 0.25s ease-out forwards;
      cursor: pointer;

      &.closing {
        animation: fadeOut 0.22s ease-in forwards;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    .wheel-modal-container {
      width: 100%;
      max-width: 480px;
      background: transparent;
      border: none;
      padding: 24px 20px calc(40px + var(--sab)) 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow: none;
      user-select: none;
      touch-action: none;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      cursor: default;

      &.closing {
        animation: slideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @keyframes slideDown {
      from { transform: translateY(0); }
      to { transform: translateY(100%); }
    }

    .wheel-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .wheel-subtitle {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #C9A74E;
      text-shadow: 0 0 10px rgba(201, 167, 78, 0.5);
    }

    .active-item-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, rgba(58, 15, 25, 0.95) 0%, rgba(20, 5, 8, 0.98) 100%);
      border: 1.5px solid #C9A74E;
      padding: 10px 22px;
      border-radius: 99px;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(201, 167, 78, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;

      &:hover, &:active {
        transform: scale(1.05);
        box-shadow: 0 8px 30px rgba(201, 167, 78, 0.5);
      }

      .active-icon {
        font-size: 26px;
        filter: drop-shadow(0 0 6px rgba(201, 167, 78, 0.6));
      }

      .active-title {
        font-size: 16px;
        font-weight: 800;
        color: #FFF;
        letter-spacing: 0.5px;
      }

      .click-arrow {
        font-size: 18px;
        color: rgba(235, 217, 182, 0.7);
        margin-left: 2px;
      }
    }

    .wheel-dial-wrapper {
      position: relative;
      width: 280px;
      height: 280px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: visible;
    }

    .dial-center-pointer {
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      color: #C9A74E;
      filter: drop-shadow(0 2px 8px rgba(201, 167, 78, 0.8));

      span {
        font-size: 26px;
      }
    }

    .wheel-dial {
      position: relative;
      width: 260px;
      height: 260px;
      border-radius: 50%;
      border: none;
      background: transparent;
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &.dragging {
        transition: none;
      }
    }

    .wheel-node {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -24px;
      margin-left: -24px;
      width: 48px;
      height: 48px;
      cursor: pointer;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

      &.highlighted {
        z-index: 12;
      }
    }

    .node-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 1.5px solid rgba(201, 167, 78, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s ease, box-shadow 0.25s ease;

      span {
        font-size: 22px;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
      }

      &.center-active {
        box-shadow: 0 0 35px rgba(201, 167, 78, 0.95), 0 6px 20px rgba(0, 0, 0, 0.7);
        border-color: #FFF;

        span {
          font-size: 26px;
        }
      }
    }
  `],
})
export class RadialMenuComponent {
  private readonly haptics = inject(HapticsService);
  private readonly overlay = inject(OverlayService);

  @ViewChild('wheelContainer') wheelContainer?: ElementRef<HTMLDivElement>;

  readonly isOpen = signal<boolean>(false);
  readonly isClosing = signal<boolean>(false);
  readonly selectedIndex = signal<number>(0);
  readonly rotationAngle = signal<number>(0);
  readonly isDragging = signal<boolean>(false);

  private startX = 0;
  private startAngle = 0;

  readonly items: RadialMenuItem[] = [
    {
      id: 'despesa',
      label: 'Despesa',
      category: 'Criação Rápida',
      icon: 'arrow_downward',
      color: '#ef4444',
      component: FormularioDespesaComponent,
    },
    {
      id: 'receita',
      label: 'Receita',
      category: 'Criação Rápida',
      icon: 'arrow_upward',
      color: '#10b981',
      component: FormularioReceitaComponent,
    },
    {
      id: 'compra-cartao',
      label: 'Compra Cartão',
      category: 'Criação Rápida',
      icon: 'credit_card',
      color: '#f59e0b',
      component: FormularioCompraCartaoComponent,
    },
    {
      id: 'meta',
      label: 'Meta / Sonho',
      category: 'Criação Rápida',
      icon: 'flag',
      color: '#d8b87e',
      component: FormularioMetaComponent,
    },
    {
      id: 'projeto',
      label: 'Novo Projeto',
      category: 'Criação Rápida',
      icon: 'account_tree',
      color: '#8b5cf6',
      component: FormularioProjetoComponent,
    },
    {
      id: 'desejo',
      label: 'Novo Desejo',
      category: 'Criação Rápida',
      icon: 'favorite',
      color: '#ec4899',
      component: FormularioWishlistComponent,
    },
  ];

  readonly activeItem = computed(() => this.items[this.selectedIndex()]);

  toggleMenu(): void {
    if (this.isClosing()) return;
    this.haptics.impactMedium();
    if (this.isOpen()) {
      this.closeMenu();
    } else {
      this.isOpen.set(true);
      this.rotationAngle.set(-this.selectedIndex() * (360 / this.items.length));
    }
  }

  closeMenu(): void {
    if (!this.isOpen() || this.isClosing()) return;
    this.isClosing.set(true);
    setTimeout(() => {
      this.isOpen.set(false);
      this.isClosing.set(false);
      this.isDragging.set(false);
    }, 200);
  }

  selectItem(item: RadialMenuItem, index: number): void {
    if (index === this.selectedIndex()) {
      this.confirmSelection();
      return;
    }
    this.haptics.impactLight();
    this.selectedIndex.set(index);
    this.rotationAngle.set(-index * (360 / this.items.length));
  }

  confirmSelection(): void {
    const target = this.activeItem();
    this.haptics.impactMedium();
    this.closeMenu();
    setTimeout(() => {
      this.overlay.openBottomSheet({ component: target.component });
    }, 150);
  }

  getNodeTransform(index: number): string {
    const angleStep = 360 / this.items.length;
    const itemAngle = index * angleStep;
    const radius = 105;
    const rad = (itemAngle - 90) * (Math.PI / 180);
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    return `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  getNodeBackground(item: RadialMenuItem, isSelected: boolean): string {
    if (isSelected) {
      return 'linear-gradient(135deg, #E8D39E 0%, #C9A74E 100%)';
    }
    return 'linear-gradient(135deg, rgba(42, 11, 18, 0.95) 0%, rgba(18, 5, 8, 0.98) 100%)';
  }

  /* Gestos de Touch / Mouse Drag */
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.isDragging.set(true);
      this.startX = event.touches[0].clientX;
      this.startAngle = this.rotationAngle();
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging() || event.touches.length === 0) return;
    const deltaX = event.touches[0].clientX - this.startX;
    const newAngle = this.startAngle + deltaX * 0.6;
    this.rotationAngle.set(newAngle);
    this.updateActiveIndexFromAngle(newAngle);
  }

  onTouchEnd(): void {
    if (this.isDragging()) {
      this.isDragging.set(false);
      this.snapToNearest();
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.isDragging.set(true);
    this.startX = event.clientX;
    this.startAngle = this.rotationAngle();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) return;
    const deltaX = event.clientX - this.startX;
    const newAngle = this.startAngle + deltaX * 0.6;
    this.rotationAngle.set(newAngle);
    this.updateActiveIndexFromAngle(newAngle);
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (this.isDragging()) {
      this.isDragging.set(false);
      this.snapToNearest();
    }
  }

  private updateActiveIndexFromAngle(angle: number): void {
    const angleStep = 360 / this.items.length;
    let normalized = (-angle % 360 + 360) % 360;
    let closestIndex = Math.round(normalized / angleStep) % this.items.length;
    if (closestIndex !== this.selectedIndex()) {
      this.selectedIndex.set(closestIndex);
      this.haptics.selectionChanged();
    }
  }

  private snapToNearest(): void {
    const angleStep = 360 / this.items.length;
    const snappedAngle = -this.selectedIndex() * angleStep;
    this.rotationAngle.set(snappedAngle);
  }
}
