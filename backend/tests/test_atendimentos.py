import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.src.api.main import app, get_repository
from backend.src.repositories.json_repository import JSONRepository


@pytest.fixture
def client_com_repo_isolado():
    """Fixture que cria um arquivo JSON temporário para isolar os testes da base real."""
    with tempfile.TemporaryDirectory() as tmpdir:
        fake_db = Path(tmpdir) / "test_dados.json"
        test_repo = JSONRepository(file_path=fake_db)

        # Sobrescreve a dependência do FastAPI para usar o repositório de teste
        app.dependency_overrides[get_repository] = lambda: test_repo

        client = TestClient(app)
        yield client

        # Limpa o override após os testes
        app.dependency_overrides.clear()


def test_health_check(client_com_repo_isolado):
    response = client_com_repo_isolado.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_cadastrar_assistido_sucesso(client_com_repo_isolado):
    payload = {"cpf": "12345678901", "nome": "Carlos Silva"}
    response = client_com_repo_isolado.post("/assistidos", json=payload)
    
    assert response.status_code == 201
    dados = response.json()
    assert dados["cpf"] == "12345678901"
    assert dados["nome"] == "Carlos Silva"


def test_cadastrar_assistido_duplicado_retorna_409(client_com_repo_isolado):
    payload = {"cpf": "12345678901", "nome": "Carlos Silva"}
    client_com_repo_isolado.post("/assistidos", json=payload)

    # Tentativa de recadastrar o mesmo CPF
    response = client_com_repo_isolado.post("/assistidos", json=payload)
    assert response.status_code == 409
    assert "já está cadastrado" in response.json()["detail"]


def test_buscar_assistido_por_cpf(client_com_repo_isolado):
    payload = {"cpf": "98765432100", "nome": "Ana Souza"}
    client_com_repo_isolado.post("/assistidos", json=payload)

    # Busca existente
    response = client_com_repo_isolado.get("/assistidos/98765432100")
    assert response.status_code == 200
    assert response.json()["nome"] == "Ana Souza"

    # Busca inexistente
    response_404 = client_com_repo_isolado.get("/assistidos/00000000000")
    assert response_404.status_code == 404


def test_atendimento_para_cpf_inexistente_retorna_404(client_com_repo_isolado):
    """Regra de negócio: impede registrar atendimento se o assistido não existe."""
    payload = {
        "assistido_cpf": "11122233344",
        "justificativa": "Primeira consulta jurídica",
    }
    response = client_com_repo_isolado.post("/atendimentos", json=payload)
    assert response.status_code == 404
    assert "não encontrado" in response.json()["detail"]


def test_registrar_atendimento_e_consultar_historico(client_com_repo_isolado):
    """Regra de negócio: registra atendimento e permite consulta do histórico."""
    cpf = "12345678901"
    
    # 1. Cadastra o assistido
    client_com_repo_isolado.post("/assistidos", json={"cpf": cpf, "nome": "Maria Pereira"})

    # 2. Registra o primeiro atendimento
    at1_payload = {
        "assistido_cpf": cpf,
        "justificativa": "Ação de alimentos - Pensão alimentícia",
    }
    res_at1 = client_com_repo_isolado.post("/atendimentos", json=at1_payload)
    assert res_at1.status_code == 201
    at1_data = res_at1.json()
    assert "id" in at1_data
    assert "data_hora" in at1_data

    # 3. Registra um segundo atendimento para o mesmo assistido
    at2_payload = {
        "assistido_cpf": cpf,
        "justificativa": "Juntada de documentos de comprovação de renda",
    }
    res_at2 = client_com_repo_isolado.post("/atendimentos", json=at2_payload)
    assert res_at2.status_code == 201

    # 4. Consulta histórico por rota específica
    res_hist = client_com_repo_isolado.get(f"/atendimentos/assistido/{cpf}")
    assert res_hist.status_code == 200
    historico = res_hist.json()
    assert len(historico) == 2
    assert historico[0]["justificativa"] == "Ação de alimentos - Pensão alimentícia"
    assert historico[1]["justificativa"] == "Juntada de documentos de comprovação de renda"

    # 5. Consulta via query parameter
    res_query = client_com_repo_isolado.get(f"/atendimentos?cpf={cpf}")
    assert res_query.status_code == 200
    assert len(res_query.json()) == 2
