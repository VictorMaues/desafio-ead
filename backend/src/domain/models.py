from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4
from pydantic import BaseModel, Field


# ==============================
# Assistido
# ==============================
class AssistidoBase(BaseModel):
    cpf: str = Field(..., min_length=11, max_length=14, description="CPF do assistido")
    nome: str = Field(..., min_length=2, max_length=120, description="Nome completo")


class AssistidoCreate(AssistidoBase):
    pass


class Assistido(AssistidoBase):
    pass


# ==============================
# Atendimento (EST-2)
# ==============================
class AtendimentoCreate(BaseModel):
    assistido_cpf: str = Field(..., description="CPF do assistido vinculado")
    justificativa: str = Field(..., min_length=5, description="Motivo ou descrição do atendimento")


class Atendimento(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    assistido_cpf: str
    justificativa: str
    data_hora: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
