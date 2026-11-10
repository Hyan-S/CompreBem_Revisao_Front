import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Produto {
  id?: string;
  nome: string;
  descricao: string;
  quantidade: number | null;
  preco: number | null;
}

export interface Pagina {
  content: Produto[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}

const API = 'http://localhost:8081/produtos';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private http = inject(HttpClient);

  listar(pagina: number, tamanho = 10) {
    return this.http.get<Pagina>(`${API}?page=${pagina}&size=${tamanho}`);
  }

  buscar(id: string) {
    return this.http.get<Produto>(`${API}/${id}`);
  }

  cadastrar(produto: Produto) {
    return this.http.post<Produto>(API, produto);
  }

  editar(id: string, produto: Produto) {
    return this.http.put<Produto>(`${API}/${id}`, produto);
  }

  excluir(id: string) {
    return this.http.delete<void>(`${API}/${id}`);
  }
}

export function mensagemDeErro(erro: HttpErrorResponse): string {
  if (erro.status === 0) {
    return 'Não foi possível conectar à API. Verifique se ela está ligada e tente de novo.';
  }
  if (erro.error?.mensagem) {
    return erro.error.mensagem;
  }
  if (erro.status === 404) {
    return 'Produto não encontrado.';
  }
  if (erro.status === 400) {
    return 'Dados inválidos. Confira os campos e tente de novo.';
  }
  return 'Algo deu errado no servidor. Tente de novo em instantes.';
}
