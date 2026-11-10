import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemDeErro, Produto, ProdutoService } from './produto.service';

@Component({
  selector: 'app-produto-lista',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="topo">
      <h1>Produtos</h1>
      <a routerLink="/produtos/novo" class="botao">+ Novo produto</a>
    </div>

    @if (aviso()) {
      <p class="aviso">{{ aviso() }}</p>
    }

    @for (p of produtos(); track p.id) {
      <div class="card">
        <div>
          <strong>{{ p.nome }}</strong>
          <small>{{ p.descricao }}</small>
          <span>{{ p.preco | currency: 'BRL' }} · {{ p.quantidade }} em estoque</span>
        </div>
        <div class="acoes">
          <a [routerLink]="['/produtos', p.id]">Editar</a>
          <button (click)="excluir(p)">Excluir</button>
        </div>
      </div>
    }

    @if (erro()) {
      <div class="erro">
        {{ erro() }}
        <button (click)="carregar()">Tentar de novo</button>
      </div>
    }
    @if (carregando()) {
      <p class="info">Carregando...</p>
    }
    @if (fim() && produtos().length === 0) {
      <p class="info">Nenhum produto cadastrado.</p>
    } @else if (fim()) {
      <p class="info">Todos os {{ produtos().length }} produtos foram carregados.</p>
    }

    <div #sentinela></div>
  `,
})
export class ProdutoLista implements AfterViewInit, OnDestroy {
  private service = inject(ProdutoService);
  private sentinela = viewChild.required<ElementRef>('sentinela');
  private observer?: IntersectionObserver;
  private pagina = 0;

  produtos = signal<Produto[]>([]);
  carregando = signal(false);
  fim = signal(false);
  erro = signal('');
  aviso = signal('');

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(entradas => {
      if (entradas[0].isIntersecting) {
        this.carregar();
      }
    });
    this.observer.observe(this.sentinela().nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  carregar() {
    if (this.carregando() || this.fim()) {
      return;
    }
    this.carregando.set(true);
    this.erro.set('');
    this.service.listar(this.pagina).subscribe({
      next: resposta => {
        this.produtos.update(lista => [...lista, ...resposta.content]);
        this.pagina++;
        this.fim.set(this.pagina >= resposta.page.totalPages);
        this.carregando.set(false);
        this.verificarSentinela();
      },
      error: e => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  excluir(produto: Produto) {
    if (!confirm(`Excluir "${produto.nome}"?`)) {
      return;
    }
    this.aviso.set('');
    this.service.excluir(produto.id!).subscribe({
      next: () => {
        this.produtos.update(lista => lista.filter(p => p.id !== produto.id));
        this.aviso.set(`"${produto.nome}" foi excluído.`);
      },
      error: e => this.aviso.set(mensagemDeErro(e)),
    });
  }

  private verificarSentinela() {
    setTimeout(() => {
      const topo = this.sentinela().nativeElement.getBoundingClientRect().top;
      if (topo < window.innerHeight) {
        this.carregar();
      }
    });
  }
}
