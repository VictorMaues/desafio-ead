import json
from pathlib import Path
from typing import List, Optional

from backend.src.domain.models import (
    Assistido,
    AssistidoCreate,
    Atendimento,
    AtendimentoCreate,
)


class RepositoryError(Exception):
    """Exceção base para erros do repositório."""
    pass


class AssistidoJaExisteError(RepositoryError):
    """Lançada ao tentar cadastrar assistido com CPF duplicado."""
    pass


class AssistidoNaoEncontradoError(RepositoryError):
    """Lançada ao tentar registrar atendimento para CPF não cadastrado."""
    pass


class JSONRepository:
    """Repositório de dados persistidos em arquivo JSON local.
    
    Permite passar um caminho de arquivo customizado, facilitando
    a execução de testes automatizados com arquivos temporários isolados.
    """

    def __init__(self, file_path: Optional[Path | str] = None) -> None:
        if file_path is None:
            # Caminho padrão: backend/data/dados.json
            base_dir = Path(__file__).resolve().parent.parent.parent
            self.file_path = base_dir / "data" / "dados.json"
        else:
            self.file_path = Path(file_path)

        self._ensure_file_exists()

    def _ensure_file_exists(self) -> None:
        """Garante que a pasta e o arquivo JSON existam com a estrutura inicial."""
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.file_path.exists():
            self._save_raw({"assistidos": [], "atendimentos": []})

    def _load_raw(self) -> dict:
        """Lê os dados brutos do arquivo JSON."""
        with open(self.file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _save_raw(self, data: dict) -> None:
        """Escreve os dados brutos no arquivo JSON de forma formatada."""
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    # ==========================================
    # Assistidos
    # ==========================================
    def list_assistidos(self) -> List[Assistido]:
        """Retorna todos os assistidos cadastrados."""
        data = self._load_raw()
        return [Assistido(**item) for item in data.get("assistidos", [])]

    def get_assistido_by_cpf(self, cpf: str) -> Optional[Assistido]:
        """Busca um assistido pelo CPF."""
        cpf_clean = cpf.strip()
        data = self._load_raw()
        for item in data.get("assistidos", []):
            if item.get("cpf", "").strip() == cpf_clean:
                return Assistido(**item)
        return None

    def create_assistido(self, assistido_in: AssistidoCreate) -> Assistido:
        """Cadastra um novo assistido.
        
        Regra de negócio: impede duplicação de CPF.
        """
        cpf_clean = assistido_in.cpf.strip()
        if self.get_assistido_by_cpf(cpf_clean):
            raise AssistidoJaExisteError(f"Assistido com CPF '{cpf_clean}' já está cadastrado.")

        novo_assistido = Assistido(
            cpf=cpf_clean,
            nome=assistido_in.nome.strip(),
        )

        data = self._load_raw()
        data.setdefault("assistidos", []).append(novo_assistido.model_dump())
        self._save_raw(data)

        return novo_assistido

    # ==========================================
    # Atendimentos (EST-2)
    # ==========================================
    def create_atendimento(self, atendimento_in: AtendimentoCreate) -> Atendimento:
        """Registra um novo atendimento.
        
        Regra de negócio: o assistido DEVE existir previamente no sistema.
        """
        cpf_clean = atendimento_in.assistido_cpf.strip()
        assistido = self.get_assistido_by_cpf(cpf_clean)
        if not assistido:
            raise AssistidoNaoEncontradoError(
                f"Não é possível registrar atendimento: Assistido com CPF '{cpf_clean}' não encontrado."
            )

        novo_atendimento = Atendimento(
            assistido_cpf=cpf_clean,
            justificativa=atendimento_in.justificativa.strip(),
        )

        data = self._load_raw()
        # model_dump(mode='json') converte datetime em string ISO e UUID em string
        data.setdefault("atendimentos", []).append(novo_atendimento.model_dump(mode="json"))
        self._save_raw(data)

        return novo_atendimento

    def list_atendimentos(self, assistido_cpf: Optional[str] = None) -> List[Atendimento]:
        """Lista os atendimentos, opcionalmente filtrando por CPF do assistido."""
        data = self._load_raw()
        todos = [Atendimento(**item) for item in data.get("atendimentos", [])]

        if assistido_cpf:
            cpf_clean = assistido_cpf.strip()
            return [at for at in todos if at.assistido_cpf == cpf_clean]

        return todos
