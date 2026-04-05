"""Rotas de geração de conteúdo com IA (Ollama + fallback template)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.generation import GenerationRequest, GenerationResult
from app.schemas.post import PostCreate
from app.repositories import sources as source_repo
from app.repositories import posts as post_repo
from app.services import generator
from app.core.security import get_current_admin

router = APIRouter()


@router.post("/preview", response_model=GenerationResult)
async def preview_generation(
    request: GenerationRequest,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """
    Gera conteúdo sem salvar como post.
    Use para pré-visualizar antes de criar o post definitivo.
    """
    if not request.source_ids:
        raise HTTPException(status_code=400, detail="Selecione pelo menos 1 source.")
    if len(request.source_ids) > 3:
        raise HTTPException(status_code=400, detail="Máximo de 3 sources por geração.")

    sources = source_repo.get_many_by_ids(db, request.source_ids)
    if not sources:
        raise HTTPException(status_code=404, detail="Nenhuma source encontrada com os IDs fornecidos.")

    return await generator.generate_content(db, request, sources)


@router.post("/create-post", response_model=GenerationResult)
async def generate_and_create_post(
    request: GenerationRequest,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """
    Gera conteúdo E salva como post com status 'draft'.
    O post criado aparece no Pipeline e no Calendário.
    """
    if not request.source_ids:
        raise HTTPException(status_code=400, detail="Selecione pelo menos 1 source.")
    if len(request.source_ids) > 3:
        raise HTTPException(status_code=400, detail="Máximo de 3 sources por geração.")

    sources = source_repo.get_many_by_ids(db, request.source_ids)
    if not sources:
        raise HTTPException(status_code=404, detail="Nenhuma source encontrada com os IDs fornecidos.")

    result = await generator.generate_content(db, request, sources)

    # Salva como post com status 'draft'
    post_data = PostCreate(
        hook=result.hook,
        body=result.body,
        cta=result.cta,
        short_x=result.short_x,
        alt_title=result.alt_title,
        channel=request.channel,
        tone=request.tone,
        objective=request.objective,
        format=request.format,
        status="draft",
        generation_mode=result.mode,
        source_ids=request.source_ids,
    )
    new_post = post_repo.create(db, post_data)

    # Vincula o GenerationRun ao post criado
    if result.run_id:
        from app.models.generation import GenerationRun
        run = db.query(GenerationRun).filter(GenerationRun.id == result.run_id).first()
        if run:
            run.post_id = new_post.id
            db.commit()

    result.run_id = new_post.id  # Retorna o ID do post para o frontend redirecionar
    return result
