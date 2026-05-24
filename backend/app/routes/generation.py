"""Content generation routes with Ollama and template fallback."""
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
    Generate content without saving a post.
    Use this to preview content before creating the final post.
    """
    if not request.source_ids:
        raise HTTPException(status_code=400, detail="Select at least 1 source.")
    if len(request.source_ids) > 3:
        raise HTTPException(status_code=400, detail="Select at most 3 sources per generation.")

    sources = source_repo.get_many_by_ids(db, request.source_ids)
    if not sources:
        raise HTTPException(status_code=404, detail="No sources found for the provided IDs.")

    return await generator.generate_content(db, request, sources)


@router.post("/create-post", response_model=GenerationResult)
async def generate_and_create_post(
    request: GenerationRequest,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """
    Generate content and save it as a draft post.
    The created post appears in the Pipeline and Calendar.
    """
    if not request.source_ids:
        raise HTTPException(status_code=400, detail="Select at least 1 source.")
    if len(request.source_ids) > 3:
        raise HTTPException(status_code=400, detail="Select at most 3 sources per generation.")

    sources = source_repo.get_many_by_ids(db, request.source_ids)
    if not sources:
        raise HTTPException(status_code=404, detail="No sources found for the provided IDs.")

    result = await generator.generate_content(db, request, sources)

    # Save as a draft post.
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

    # Link the GenerationRun to the created post.
    if result.run_id:
        from app.models.generation import GenerationRun
        run = db.query(GenerationRun).filter(GenerationRun.id == result.run_id).first()
        if run:
            run.post_id = new_post.id
            db.commit()

    result.run_id = new_post.id  # Retorna o ID do post para o frontend redirecionar
    return result
