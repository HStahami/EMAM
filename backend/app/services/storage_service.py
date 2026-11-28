import os
import re
import uuid
import base64
import anyio
from typing import Optional
from fastapi import UploadFile
from app.config import settings

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
}
EXT_TO_MIME = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_EXTENSIONS = {ext for exts in ALLOWED_MIME_TYPES.values() for ext in exts}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_DATA_URI_SIZE = 5 * 1024 * 1024  # 5 MB safe limit for MongoDB data URI fallback

# Track if Cloudinary is enabled
_cloudinary_configured = False
if (
    settings.CLOUDINARY_CLOUD_NAME
    and settings.CLOUDINARY_API_KEY
    and settings.CLOUDINARY_API_SECRET
):
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        _cloudinary_configured = True
        print("[STORAGE] Cloudinary configured successfully.")
    except Exception as e:
        print(f"[STORAGE WARNING] Cloudinary setup failed: {e}")
        _cloudinary_configured = False


async def upload_media_file(
    file: UploadFile,
    folder: str = "alarabia_media",
    prefix: str = "media"
) -> str:
    """
    Securely uploads a file after validating MIME type, extension, and file size.
    Uses Cloudinary in production, or safe local fallback in development.
    """
    if not file or not file.filename:
        raise ValueError("No file provided for upload.")

    # 1. Extension validation & sanitization
    raw_ext = os.path.splitext(file.filename)[1].lower()
    if not raw_ext or raw_ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"File extension '{raw_ext}' is not permitted. Allowed: {sorted(ALLOWED_EXTENSIONS)}"
        )

    # 2. MIME type validation
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    if content_type not in ALLOWED_MIME_TYPES:
        if content_type not in ["application/octet-stream", "binary/octet-stream", ""]:
            raise ValueError(
                f"Content type '{content_type}' is not permitted. Allowed: {list(ALLOWED_MIME_TYPES.keys())}"
            )
    else:
        if raw_ext not in ALLOWED_MIME_TYPES[content_type]:
            raise ValueError(
                f"MIME type '{content_type}' does not match extension '{raw_ext}'."
            )

    # 3. Bounded chunked read to prevent memory exhaustion (DoS)
    content = bytearray()
    chunk_size = 1024 * 1024  # 1 MB chunk
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        content.extend(chunk)
        if len(content) > MAX_FILE_SIZE:
            raise ValueError(
                f"File size exceeds maximum permitted limit of {MAX_FILE_SIZE // (1024 * 1024)} MB."
            )

    if len(content) == 0:
        raise ValueError("Uploaded file is empty (0 bytes).")

    # 4. Safe server-side object naming (prevents directory traversal & null-bytes)
    clean_prefix = re.sub(r"[^a-zA-Z0-9_-]", "", prefix) or "media"
    safe_filename = f"{clean_prefix}_{uuid.uuid4().hex}{raw_ext}"

    # 5. Production Cloudinary Storage
    if _cloudinary_configured:
        try:
            import cloudinary.uploader
            res = cloudinary.uploader.upload(
                bytes(content),
                folder=folder,
                public_id=f"{clean_prefix}_{uuid.uuid4().hex}",
                resource_type="auto"
            )
            secure_url = res.get("secure_url")
            if secure_url:
                return secure_url
        except Exception as e:
            print(f"[STORAGE ERROR] Cloudinary upload failed: {e}")

    # 6. Serverless / Read-only / No-Cloudinary Safe Fallback (Data URI)
    is_prod = settings.ENVIRONMENT.lower() in ["production", "prod"]
    is_serverless = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

    if not is_prod and not is_serverless:
        try:
            uploads_dir = anyio.Path("uploads")
            await uploads_dir.mkdir(parents=True, exist_ok=True)
            filepath = uploads_dir / safe_filename
            await filepath.write_bytes(content)
            return f"/uploads/{safe_filename}"
        except OSError as fs_err:
            print(f"[STORAGE WARNING] Local disk write failed, falling back to data URI: {fs_err}")

    if len(content) > MAX_DATA_URI_SIZE:
        raise ValueError(
            "File size exceeds 5 MB limit when cloud storage is not configured. Please upload a smaller file."
        )
    resolved_mime = EXT_TO_MIME.get(raw_ext, "application/octet-stream")
    encoded = base64.b64encode(bytes(content)).decode("ascii")
    return f"data:{resolved_mime};base64,{encoded}"


def is_cloud_storage_enabled() -> bool:
    """Return whether Cloudinary is active."""
    return _cloudinary_configured

