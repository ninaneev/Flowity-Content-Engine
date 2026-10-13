"""Geração de carrosséis editáveis em PNG e PDF."""
from pathlib import Path
from textwrap import wrap
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_admin
from app.db.database import get_db
from app.repositories import posts as post_repo

router = APIRouter()
WIDTH, HEIGHT = 1080, 1350
MIN_SLIDES, MAX_SLIDES, MAX_CHARS = 3, 10, 220


class CarouselRenderRequest(BaseModel):
    slides: list[str] = Field(min_length=MIN_SLIDES, max_length=MAX_SLIDES)


def _font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).is_file():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def _render_slide(text: str, index: int, total: int, destination: Path) -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), "#07080F")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, WIDTH, 14), fill="#9C83F7")
    draw.rectangle((WIDTH // 2, 0, WIDTH, 14), fill="#1CD8DE")
    font = _font(66 if index == 0 else 54, bold=index == 0)
    max_width = WIDTH - 180
    words = text.split()
    lines, current = [], ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    # Avoid rendering outside the canvas for long text.
    line_height = 86 if index == 0 else 74
    max_lines = 10
    lines = lines[:max_lines]
    y = max(120, (HEIGHT - len(lines) * line_height) // 2)
    for line in lines:
        draw.text((90, y), line, font=font, fill="#F7F7FB")
        y += line_height
    draw.text((90, HEIGHT - 100), "Flowity", font=_font(28, bold=True), fill="#1CD8DE")
    draw.text((WIDTH - 180, HEIGHT - 100), f"{index + 1}/{total}", font=_font(26), fill="#B7B8C7")
    image.save(destination, format="PNG", optimize=True)


@router.post("/posts/{post_id}/render/carousel", summary="Gera slides PNG e PDF para um post")
def render_carousel(
    post_id: int,
    payload: CarouselRenderRequest,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    post = post_repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail={"code": "POST_NOT_FOUND", "message": "Post não encontrado."})
    slides = [str(value).strip() for value in payload.slides]
    if any(not value for value in slides):
        raise HTTPException(status_code=422, detail={"code": "EMPTY_SLIDE", "message": "Preencha o texto de todos os slides."})
    if any(len(value) > MAX_CHARS for value in slides):
        raise HTTPException(status_code=422, detail={"code": "SLIDE_TOO_LONG", "message": f"Cada slide pode ter até {MAX_CHARS} caracteres."})

    media_root = Path(settings.MEDIA_DIR).expanduser().resolve()
    output_dir = media_root / "posts" / str(post_id) / "carousel"
    output_dir.mkdir(parents=True, exist_ok=True)
    # Use a unique directory so concurrent generations never overwrite each other.
    generation_id = uuid4().hex[:12]
    generated_dir = output_dir / generation_id
    generated_dir.mkdir(parents=True, exist_ok=True)
    rendered = []
    for index, text in enumerate(slides):
        filename = f"slide-{index + 1}.png"
        destination = generated_dir / filename
        _render_slide(text, index, len(slides), destination)
        rendered.append({
            "id": index + 1,
            "position": index + 1,
            "alt_text": text,
            "url": f"{settings.MEDIA_URL_PREFIX.rstrip('/')}/posts/{post_id}/carousel/{generation_id}/{filename}",
        })

    pdf_path = generated_dir / "carrossel.pdf"
    pdf = canvas.Canvas(str(pdf_path), pagesize=(WIDTH, HEIGHT), pageCompression=1)
    for item in rendered:
        image_path = generated_dir / f"slide-{item['position']}.png"
        pdf.drawImage(ImageReader(str(image_path)), 0, 0, width=WIDTH, height=HEIGHT)
        pdf.showPage()
    pdf.save()

    return {
        "post_id": post_id,
        "total_slides": len(rendered),
        "slides": rendered,
        "pdf_url": f"{settings.MEDIA_URL_PREFIX.rstrip('/')}/posts/{post_id}/carousel/{generation_id}/carrossel.pdf",
        "pdf_size_bytes": pdf_path.stat().st_size,
    }
