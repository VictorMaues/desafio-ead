from typing import List, Optional
from fastapi import FastAPI, HTTPException, status, Depends, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.src.domain.models import (
    Assistido,
    AssistidoCreate,
    Atendimento,
    AtendimentoCreate,
)
from backend.src.repositories.json_repository import (
    JSONRepository,
    AssistidoJaExisteError,
    AssistidoNaoEncontradoError,
)

app = FastAPI(
    title="Defensoria Pública - Atendimentos (EST-2)",
    description="API para gestão de Assistidos e Histórico de Atendimentos",
    version="1.0.0",
)

# Configuração de CORS para permitir requisições do frontend Next.js
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_repository() -> JSONRepository:
    """Injeção de dependência do repositório JSON.
    
    Permite sobrescrever (override) facilmente em testes automatizados.
    """
    return JSONRepository()


@app.get("/", tags=["Health"])
def health_check():
    """Endpoint de status da API."""
    return {"status": "ok", "service": "EST-2 Atendimentos Defensoria"}


# ==========================================
# Endpoints de Assistidos
# ==========================================
@app.get("/assistidos", response_model=List[Assistido], tags=["Assistidos"])
def listar_assistidos(repo: JSONRepository = Depends(get_repository)):
    """Lista todos os assistidos cadastrados."""
    return repo.list_assistidos()


@app.post(
    "/assistidos",
    response_model=Assistido,
    status_code=status.HTTP_201_CREATED,
    tags=["Assistidos"],
)
def cadastrar_assistido(
    assistido_in: AssistidoCreate,
    repo: JSONRepository = Depends(get_repository),
):
    """Cadastra um novo assistido. Retorna 409 se o CPF já existir."""
    try:
        return repo.create_assistido(assistido_in)
    except AssistidoJaExisteError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@app.get("/assistidos/{cpf}", response_model=Assistido, tags=["Assistidos"])
def buscar_assistido(
    cpf: str,
    repo: JSONRepository = Depends(get_repository),
):
    """Busca um assistido pelo CPF. Retorna 404 se não for encontrado."""
    assistido = repo.get_assistido_by_cpf(cpf)
    if not assistido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assistido com CPF '{cpf}' não encontrado.",
        )
    return assistido


# ==========================================
# Endpoints de Atendimentos (EST-2)
# ==========================================
@app.get("/atendimentos", response_model=List[Atendimento], tags=["Atendimentos"])
def listar_atendimentos(
    cpf: Optional[str] = Query(None, description="Filtrar por CPF do assistido"),
    repo: JSONRepository = Depends(get_repository),
):
    """Lista atendimentos, permitindo filtrar por CPF do assistido."""
    return repo.list_atendimentos(assistido_cpf=cpf)


@app.post(
    "/atendimentos",
    response_model=Atendimento,
    status_code=status.HTTP_201_CREATED,
    tags=["Atendimentos"],
)
def registrar_atendimento(
    atendimento_in: AtendimentoCreate,
    repo: JSONRepository = Depends(get_repository),
):
    """Registra um novo atendimento.
    
    Retorna 404 se o CPF do assistido informado não estiver cadastrado.
    """
    try:
        return repo.create_atendimento(atendimento_in)
    except AssistidoNaoEncontradoError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@app.get("/atendimentos/assistido/{cpf}", response_model=List[Atendimento], tags=["Atendimentos"])
def listar_historico_assistido(
    cpf: str,
    repo: JSONRepository = Depends(get_repository),
):
    """Consulta o histórico completo de atendimentos de um assistido específico."""
    return repo.list_atendimentos(assistido_cpf=cpf)
