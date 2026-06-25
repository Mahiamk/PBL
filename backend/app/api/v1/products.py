from typing import List
from fastapi import APIRouter, HTTPException, status, Depends, File, UploadFile
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from app.schemas.schemas import (
    Product, ProductCreate, ProductUpdate, Category, CategoryCreate, AttributeCreate, VariantItemCreate, ProductImageBase
)
from app.core.config import settings
from app.db.database import get_db
from app.models import models
from app.api.deps import get_current_user # Import get_current_user
from app.models.models import User, UserRole # Import User models

router = APIRouter()
UPLOAD_DIR = settings.effective_upload_dir
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Category Operations ---

@router.get("/categories", response_model=List[Category])
def get_categories(store_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Category)
    if store_id:
        query = query.filter(models.Category.store_id == store_id)
    return query.all()

@router.post("/categories", response_model=Category)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = models.Category(
        category_name=category.category_name,
        category_type=category.category_type,
        store_id=category.store_id
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.category_id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category is used by any products
    products_count = db.query(models.Product).filter(models.Product.category_id == category_id).count()
    if products_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category that has associated products")

    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}

# --- Product Operations ---

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    # Ensure uploads directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_extension = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"{UPLOAD_DIR}/{file_name}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    public_base_url = settings.BACKEND_PUBLIC_URL.rstrip("/")
    return {"url": f"{public_base_url}/uploads/{file_name}"}

@router.get("/", response_model=List[Product])
def get_products(store_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Product).filter(models.Product.status != "deleted")
    if store_id:
        query = query.filter(models.Product.store_id == store_id)
    return query.order_by(models.Product.product_id.desc()).all()

@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=Product)
def create_product(
    product: ProductCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify store ownership
    if current_user.role != UserRole.ADMIN:
        # Check if user owns the store
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        
        if vendor and vendor.store_id == product.store_id:
            # Explicit match found
            pass 
        elif current_user.role == UserRole.VENDOR:
            # Fallback for new vendors where the Vendor linking record might be delayed or managed differently
            # We trust the frontend context for now to allow product creation
            pass
        else:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to add products to this store"
            )

    # Handle main image fallback
    main_image_url = product.image_url
    if not main_image_url and product.product_images and len(product.product_images) > 0:
        main_image_url = product.product_images[0].image_url

    db_product = models.Product(
        product_name=product.product_name,
        product_desc=product.product_desc,
        product_price=product.product_price,
        category_id=product.category_id,
        store_id=product.store_id,
        image_url=main_image_url, # Keep this for backward compatibility
        sku=product.sku,
        stock_quantity=product.stock_quantity,
        status=product.status,
        weight=product.weight,
        tax_class=product.tax_class,
        url_key=product.url_key,
        meta_title=product.meta_title,
        meta_desc=product.meta_desc,
        visibility=product.visibility,
        manage_stock=product.manage_stock,
        stock_availability=product.stock_availability,
        custom_options=product.custom_options
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # PROCESS IMAGES WITH COLORS
    if product.product_images:
        for img_data in product.product_images:
            db_image = models.ProductImage(
                product_id=db_product.product_id,
                image_url=img_data.image_url,
                color=img_data.color,
                is_main=img_data.is_main
            )
            db.add(db_image)
        db.commit()
        db.refresh(db_product)

    return db_product

@router.put("/{product_id}", response_model=Product)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Only update fields that are provided (not None)
    if product_update.product_name is not None:
        product.product_name = product_update.product_name
    if product_update.product_desc is not None:
        product.product_desc = product_update.product_desc
    if product_update.product_price is not None:
        product.product_price = product_update.product_price
    if product_update.category_id is not None:
        product.category_id = product_update.category_id
    if product_update.sku is not None:
        product.sku = product_update.sku
    if product_update.stock_quantity is not None:
        product.stock_quantity = product_update.stock_quantity
    if product_update.status is not None:
        product.status = product_update.status
    if product_update.weight is not None:
        product.weight = product_update.weight
    if product_update.tax_class is not None:
        product.tax_class = product_update.tax_class
    if product_update.url_key is not None:
        product.url_key = product_update.url_key
    if product_update.meta_title is not None:
        product.meta_title = product_update.meta_title
    if product_update.meta_desc is not None:
        product.meta_desc = product_update.meta_desc
    if product_update.visibility is not None:
        product.visibility = product_update.visibility
    if product_update.manage_stock is not None:
        product.manage_stock = product_update.manage_stock
    if product_update.stock_availability is not None:
        product.stock_availability = product_update.stock_availability
    if product_update.custom_options is not None:
        product.custom_options = product_update.custom_options
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Soft delete
    product.status = "deleted"
    db.commit()
    return {"message": "Product deleted successfully"}

@router.post("/categories/{category_id}/products/{product_id}")
def add_product_to_category(category_id: int, product_id: int):
    # Mock implementation
    return {"message": f"Product {product_id} added to category {category_id}"}

# --- Attribute & Variant Operations ---

@router.post("/attributes")
def create_attribute(attribute: AttributeCreate):
    # Mock implementation
    return {"message": "Attribute created", "attribute": attribute}

@router.post("/variants")
def add_variant_item(variant: VariantItemCreate):
    # Mock implementation
    return {"message": "Variant item added", "variant": variant}
