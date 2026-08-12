import { Component, inject, signal, computed, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HapticsService } from '../../../core/platform/haptics.service';
import { FabActionRegistryService } from '../../../core/services/fab-action-registry.service';
import { ToastService } from '../../../core/services/toast.service';

export interface RadialMenuItem {
  id: string;
  label: string;
  category: string;
  icon: string;
  route?: string;
  color: string;
  isAction?: boolean;
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
        title="Navegação Geral em Roda Semicircular"
        aria-label="Abrir Menu Semicircular"
      >
        <div class="glow-effect"></div>
        <span class="material-symbols-rounded trigger-icon">
          {{ isOpen() ? 'close' : 'apps' }}
        </span>
      </button>
      <span class="trigger-label">{{ isOpen() ? 'Fechar' : 'Explorar' }}</span>
    </div>

    <!-- Backdrop Translúcido com Blur Suave -->
    @if (isOpen()) {
      <div
        class="radial-backdrop"
        [class.closing]="isClosing()"
        (click)="closeMenu()"
        (window:keydown.escape)="closeMenu()"
      >
        <!-- Container Semicircular -->
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
          <!-- Título da Categoria / Item Ativo -->
          <div class="wheel-header">
            <span class="wheel-subtitle">DESLIZE O DEDO PARA GIRAR A RODA DE OPÇÕES</span>
            <div class="active-item-badge" [style.border-color]="activeItem().color">
              <span class="material-symbols-rounded active-icon" [style.color]="activeItem().color">
                {{ activeItem().icon }}
              </span>
              <span class="active-title">{{ activeItem().label }}</span>
            </div>
            <span class="category-tag">{{ activeItem().category }}</span>
          </div>

          <!-- Arco Semicircular do Dial Rotativo -->
          <div class="wheel-dial-wrapper">
            <!-- Marcador/Indicador Central Superior -->
            <div class="dial-center-pointer">
              <span class="material-symbols-rounded">arrow_drop_down</span>
            </div>

            <!-- Roda Rotativa -->
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
                    [style.background]="getNodeBackground(item, index === selectedIndex())"
                    [style.transform]="'rotate(' + (-rotationAngle()) + 'deg)'"
                  >
                    <span class="material-symbols-rounded" [style.color]="index === selectedIndex() ? '#2A0B12' : item.color">
                      {{ item.icon }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Ação Rápida / Confirmação de Acesso -->
          <button type="button" class="action-confirm-btn" (click)="confirmSelection()">
            <span class="material-symbols-rounded">{{ activeItem().isAction ? 'add_circle' : 'arrow_forward' }}</span>
            <span class="btn-text">{{ activeItem().isAction ? 'Criar ' + activeItem().label.replace('+ ', '') : 'Acessar ' + activeItem().label }}</span>
          </button>
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
        font-size: 28px;
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

    /* Backdrop Translúcido com Blur Suave */
    .radial-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      background: rgba(24, 7, 10, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
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
      background: linear-gradient(180deg, rgba(42, 11, 18, 0.98) 0%, rgba(13, 4, 6, 0.99) 100%);
      border-top-left-radius: 36px;
      border-top-right-radius: 36px;
      border-top: 1.5px solid rgba(201, 167, 78, 0.6);
      padding: 24px 20px calc(24px + var(--sab)) 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow: 0 -15px 50px rgba(161, 61, 99, 0.4), 0 -2px 20px rgba(201, 167, 78, 0.3);
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
      gap: 6px;
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
      background: linear-gradient(135deg, rgba(58, 15, 25, 0.9) 0%, rgba(20, 5, 8, 0.95) 100%);
      border: 1.5px solid #C9A74E;
      padding: 8px 20px;
      border-radius: 99px;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(201, 167, 78, 0.3);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .active-icon {
      font-size: 26px;
      filter: drop-shadow(0 0 6px rgba(201, 167, 78, 0.6));
    }

    .active-title {
      font-size: 18px;
      font-weight: 800;
      color: #FFF;
      letter-spacing: 0.8px;
      font-family: var(--alic-font-family-primary);
    }

    .category-tag {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: rgba(232, 211, 158, 0.7);
      text-transform: uppercase;
    }

    /* Dial Rotativo sem Pontilhado */
    .wheel-dial-wrapper {
      position: relative;
      width: 340px;
      height: 210px;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      overflow: hidden;
      margin-top: 6px;
    }

    .dial-center-pointer {
      position: absolute;
      top: -2px;
      left: 50%;
      transform: translateX(-50%);
      color: #E8D39E;
      z-index: 10;
      span {
        font-size: 34px;
        filter: drop-shadow(0 2px 10px #C9A74E) drop-shadow(0 0 15px rgba(201, 167, 78, 0.8));
      }
    }

    .wheel-dial {
      position: absolute;
      bottom: -175px;
      width: 350px;
      height: 350px;
      border-radius: 50%;
      border: none;
      box-shadow: none;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &.dragging {
        transition: none;
      }
    }

    .wheel-node {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -21px;
      margin-left: -21px;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &.highlighted {
        transform: scale(1.35) !important;
        z-index: 10;
      }
    }

    .node-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(201, 167, 78, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.15);
      transition: transform 0.1s linear, background 0.2s ease, box-shadow 0.2s ease;

      span {
        font-size: 20px;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
      }
    }

    .action-confirm-btn {
      width: 100%;
      height: 48px;
      min-height: 48px;
      padding: 0 18px;
      border-radius: 16px;
      background: linear-gradient(135deg, #A13D63 0%, #68203B 100%);
      border: 1.5px solid rgba(201, 167, 78, 0.5);
      color: #FFF;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(161, 61, 99, 0.45), 0 2px 10px rgba(201, 167, 78, 0.2);
      transition: all 0.2s ease;
      box-sizing: border-box;

      &:active {
        transform: scale(0.98);
        box-shadow: 0 4px 15px rgba(161, 61, 99, 0.6);
      }

      span { font-size: 18px; flex-shrink: 0; }

      .btn-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
      }
    }
  `],
})
export class RadialMenuComponent {
  private readonly router = inject(Router);
  private readonly haptics = inject(HapticsService);
  private readonly fabRegistry = inject(FabActionRegistryService);
  private readonly toastService = inject(ToastService);

  @ViewChild('wheelContainer') wheelContainer?: ElementRef<HTMLDivElement>;

  readonly isOpen = signal<boolean>(false);
  readonly isClosing = signal<boolean>(false);
  readonly selectedIndex = signal<number>(0);
  readonly rotationAngle = signal<number>(0);
  readonly isDragging = signal<boolean>(false);

  private startX = 0;
  private startAngle = 0;

  readonly items: RadialMenuItem[] = [
    // --- Ações Rápidas de Criação ---
    { id: 'nova-despesa', label: '+ Nova Despesa', category: 'Criação Rápida', icon: 'arrow_downward', route: '/transactions', color: '#F87171', isAction: true },
    { id: 'nova-receita', label: '+ Nova Receita', category: 'Criação Rápida', icon: 'arrow_upward', route: '/transactions', color: '#34D399', isAction: true },
    { id: 'nova-meta', label: '+ Nova Meta', category: 'Criação Rápida', icon: 'flag', route: '/goals', color: '#C9A74E', isAction: true },
    { id: 'novo-projeto', label: '+ Novo Projeto', category: 'Criação Rápida', icon: 'account_tree', route: '/projects', color: '#F59E0B', isAction: true },
    { id: 'novo-desejo', label: '+ Novo Desejo', category: 'Criação Rápida', icon: 'favorite', route: '/wishlist', color: '#EC4899', isAction: true },

    // --- Módulos Principais ---
    { id: 'dashboard', label: 'Dashboard', category: 'Visão Geral', icon: 'grid_view', route: '/dashboard', color: '#C9A74E' },
    { id: 'transactions', label: 'Lançamentos', category: 'Gestão Financeira', icon: 'receipt_long', route: '/transactions', color: '#34D399' },
    { id: 'cards', label: 'Cartões & Faturas', category: 'Crédito', icon: 'credit_card', route: '/cards', color: '#E8D39E' },
    { id: 'calendar', label: 'Calendário', category: 'Agenda', icon: 'calendar_month', route: '/calendar', color: '#F472B6' },
    { id: 'orcamentos', label: 'Orçamentos', category: 'Planejamento', icon: 'pie_chart', route: '/orcamentos', color: '#A13D63' },
    { id: 'goals', label: 'Metas & Sonhos', category: 'Objetivos', icon: 'flag', route: '/goals', color: '#C9A74E' },
    { id: 'wishlist', label: 'Wishlist & Desejos', category: 'Consumo Consciente', icon: 'favorite', route: '/wishlist', color: '#EC4899' },
    { id: 'projects', label: 'Projetos', category: 'Longo Prazo', icon: 'account_tree', route: '/projects', color: '#F59E0B' },
    { id: 'planning', label: 'Forecast 12M', category: 'Projeção', icon: 'timeline', route: '/planning', color: '#A855F7' },
    { id: 'overview', label: 'Planning Overview', category: 'Executivo', icon: 'insights', route: '/planning/overview', color: '#C9A74E' },
    { id: 'relatorios', label: 'Relatórios Executivos', category: 'Auditoria', icon: 'bar_chart', route: '/relatorios', color: '#10B981' },
    { id: 'alertas', label: 'Central Alertas', category: 'Notificações', icon: 'notifications', route: '/alertas', color: '#EF4444' },
    { id: 'carteiras', label: 'Carteiras & Contas', category: 'Patrimônio', icon: 'account_balance_wallet', route: '/carteiras', color: '#C9A74E' },
    { id: 'pessoas', label: 'Membros & Salários', category: 'Família', icon: 'group', route: '/pessoas', color: '#60A5FA' },
    { id: 'categorias', label: 'Categorias', category: 'Classificação', icon: 'category', route: '/categorias', color: '#D8B87E' },
    { id: 'produtos', label: 'Catálogo & Lojas', category: 'Pesquisa', icon: 'shopping_bag', route: '/produtos', color: '#FBBF24' },
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
    this.haptics.impactLight();
    this.selectedIndex.set(index);
    this.rotationAngle.set(-index * (360 / this.items.length));
  }

  confirmSelection(): void {
    const target = this.activeItem();
    this.haptics.impactMedium();
    this.closeMenu();

    if (target.isAction) {
      // Se for ação rápida de criação
      const registeredActions = this.fabRegistry.registeredActions();
      const matched = registeredActions.find((a) => a.id === target.id);
      if (matched && matched.execute) {
        matched.execute();
      } else if (target.route) {
        this.router.navigate([target.route]);
      }
    } else if (target.route) {
      this.router.navigate([target.route]);
    }
  }

  getNodeTransform(index: number): string {
    const angleStep = 360 / this.items.length;
    const itemAngle = index * angleStep;
    const radius = 150; // Raio em pixels
    const rad = (itemAngle - 90) * (Math.PI / 180);
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    return `translate(${x}px, ${y}px)`;
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
