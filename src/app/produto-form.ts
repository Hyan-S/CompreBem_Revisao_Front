import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemDeErro, Produto, ProdutoService } from './produto.service';

@Component({
  selector: 'app-produto-form',
  imports: [FormsModule, RouterLink],
  template: `
    <h1>{{ id() ? 'Editar produto' : 'Novo produto' }}</h1>

    @if (erro()) {
      <p class="erro">{{ erro() }}</p>
    }

    @if (carregando()) {
      <p class="info">Carregando...</p>
    } @else if (!naoEncontrado()) {
      <form (ngSubmit)="salvar()" class="form">
        <label>Nome
          <input name="nome" [(ngModel)]="produto.nome">
        </label>
        <label>Descrição
          <input name="descricao" [(ngModel)]="produto.descricao">
        </label>
        <label>Preço (R$)
          <input name="preco" type="number" step="0.01" [(ngModel)]="produto.preco">
        </label>
        <label>Quantidade
          <input name="quantidade" type="number" [(ngModel)]="produto.quantidade">
        </label>
        <div class="acoes">
          <button type="submit" class="botao" [disabled]="salvando()">
            {{ salvando() ? 'Salvando...' : 'Salvar' }}
          </button>
          <a routerLink="/produtos">Cancelar</a>
        </div>
      </form>
    }

    @if (naoEncontrado()) {
      <a routerLink="/produtos">Voltar para a lista</a>
    }
  `,
})
export class ProdutoForm implements OnInit {
  private service = inject(ProdutoService);
  private router = inject(Router);

  id = input<string>();

  produto: Produto = { nome: '', descricao: '', preco: null, quantidade: null };
  carregando = signal(false);
  salvando = signal(false);
  naoEncontrado = signal(false);
  erro = signal('');

  ngOnInit() {
    const id = this.id();
    if (!id) {
      return;
    }
    this.carregando.set(true);
    this.service.buscar(id).subscribe({
      next: p => {
        this.produto = p;
        this.carregando.set(false);
      },
      error: e => {
        this.erro.set(mensagemDeErro(e));
        this.naoEncontrado.set(e.status === 404);
        this.carregando.set(false);
      },
    });
  }

  salvar() {
    const erroLocal = this.validar();
    if (erroLocal) {
      this.erro.set(erroLocal);
      return;
    }
    this.erro.set('');
    this.salvando.set(true);
    const id = this.id();
    const requisicao = id ? this.service.editar(id, this.produto) : this.service.cadastrar(this.produto);
    requisicao.subscribe({
      next: () => this.router.navigate(['/produtos']),
      error: e => {
        this.erro.set(mensagemDeErro(e));
        this.salvando.set(false);
      },
    });
  }

  private validar(): string {
    if (!this.produto.nome?.trim()) {
      return 'O nome do produto é obrigatório.';
    }
    if (this.produto.preco == null || this.produto.preco <= 0) {
      return 'O preço deve ser maior que zero.';
    }
    if (this.produto.quantidade == null || this.produto.quantidade < 0) {
      return 'A quantidade é obrigatória e não pode ser negativa.';
    }
    return '';
  }
}
