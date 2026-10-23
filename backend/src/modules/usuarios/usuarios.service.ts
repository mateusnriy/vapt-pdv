import { ErroDominio } from '../../shared/erros';
import {
  CriarUsuarioDados,
  AtualizarUsuarioDados,
  FiltrosListagemUsuarios,
  GarcomValido,
  UsuarioEntidade,
} from './usuario.entity';
import { IUsuariosRepository } from './usuarios.repository';

/**
 * Interface do Serviço de Usuários (Regras de Negócio).
 */
export interface ServicoUsuarios {
  criar(dados: CriarUsuarioDados): Promise<UsuarioEntidade>;
  listar(filtros?: FiltrosListagemUsuarios): Promise<UsuarioEntidade[]>;
  buscarPorId(id: number): Promise<UsuarioEntidade>;
  atualizar(id: number, dados: AtualizarUsuarioDados): Promise<UsuarioEntidade>;
  inativar(id: number): Promise<UsuarioEntidade>;
  validarGarcom(id: number): Promise<GarcomValido>;
}

/**
 * Camada de Regras de Negócio (Service).
 * Não conhece detalhes de protocolo HTTP (Fastify) nem detalhes de banco (SQL/Prisma).
 * Recebe o repositório através de injeção de dependência.
 */
export class UsuariosService implements ServicoUsuarios {
  constructor(private readonly repo: IUsuariosRepository) {}

  async criar(dados: CriarUsuarioDados): Promise<UsuarioEntidade> {
    const nomeLimpo = dados.nome?.trim();
    if (!nomeLimpo) {
      throw ErroDominio.validacao('O nome do usuário não pode ser vazio.', {
        nome: 'O campo não pode ser vazio.',
      });
    }

    return this.repo.criar({
      nome: nomeLimpo,
      perfil: dados.perfil,
      ativo: true,
    });
  }

  async listar(filtros: FiltrosListagemUsuarios = {}): Promise<UsuarioEntidade[]> {
    return this.repo.listar(filtros);
  }

  async buscarPorId(id: number): Promise<UsuarioEntidade> {
    const usuario = await this.repo.buscarPorId(id);

    if (!usuario) {
      throw ErroDominio.naoEncontrado(`Usuário com ID ${id} não encontrado.`, {
        id: 'Usuário não encontrado.',
      });
    }

    return usuario;
  }

  async atualizar(id: number, dados: AtualizarUsuarioDados): Promise<UsuarioEntidade> {
    // Garante que o usuário existe antes de tentar atualizar
    await this.buscarPorId(id);

    const dadosAtualizacao: AtualizarUsuarioDados = {};

    if (dados.nome !== undefined) {
      const nomeLimpo = dados.nome.trim();
      if (!nomeLimpo) {
        throw ErroDominio.validacao('O nome do usuário não pode ser vazio.', {
          nome: 'O campo não pode ser vazio.',
        });
      }
      dadosAtualizacao.nome = nomeLimpo;
    }

    if (dados.perfil !== undefined) {
      dadosAtualizacao.perfil = dados.perfil;
    }

    return this.repo.atualizar(id, dadosAtualizacao);
  }

  async inativar(id: number): Promise<UsuarioEntidade> {
    const usuario = await this.buscarPorId(id);

    // Inativação lógica idempotente: se já estiver inativo, não refaz query de update
    if (!usuario.ativo) {
      return usuario;
    }

    return this.repo.atualizar(id, { ativo: false });
  }

  async validarGarcom(id: number): Promise<GarcomValido> {
    const usuario = await this.repo.buscarPorId(id);

    if (!usuario) {
      throw ErroDominio.regraNegocio('GARCOM_INVALIDO', 'Garçom informado não existe no sistema.', {
        motivo: 'USUARIO_NAO_ENCONTRADO',
      });
    }

    if (!usuario.ativo) {
      throw ErroDominio.regraNegocio('GARCOM_INVALIDO', 'O garçom informado está inativo.', {
        motivo: 'USUARIO_INATIVO',
      });
    }

    if (usuario.perfil !== 'garcom') {
      throw ErroDominio.regraNegocio(
        'GARCOM_INVALIDO',
        `O usuário informado possui perfil "${usuario.perfil}", mas a operação exige "garcom".`,
        { motivo: 'PERFIL_INVALIDO' },
      );
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      valido: true,
    };
  }
}
