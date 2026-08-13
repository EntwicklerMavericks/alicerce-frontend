import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthStore } from '../../features/auth/store/auth.store';
import { Usuario, WorkspaceResumo } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class UserContextService {
  private readonly authStore = inject(AuthStore);

  readonly currentUser = computed<Usuario | null>(() => this.authStore.usuario());
  readonly currentWorkspace = computed<WorkspaceResumo | null>(() => this.authStore.workspaceAtivo());

  readonly userName = computed(() => this.currentUser()?.nome || 'Usuário');
  readonly userEmail = computed(() => this.currentUser()?.email || '');
  readonly workspaceName = computed(() => this.currentWorkspace()?.nome || 'Workspace Principal');
  readonly avatarInitial = computed(() => this.userName().charAt(0).toUpperCase());
}
