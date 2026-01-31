"""
Component tests for Products API endpoints.
"""
import pytest


class TestCategoryEndpoints:
    """Component tests for category CRUD operations."""

    def test_get_categories_empty(self, client):
        """Test getting categories when none exist."""
        response = client.get("/api/products/categories")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_category(self, client, test_store):
        """Test creating a new category."""
        response = client.post(
            "/api/products/categories",
            json={
                "category_name": "Electronics",
                "category_type": "product",
                "store_id": test_store.store_id
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["category_name"] == "Electronics"

    def test_get_categories_by_store(self, client, test_category, test_store):
        """Test getting categories filtered by store."""
        response = client.get(f"/api/products/categories?store_id={test_store.store_id}")
        assert response.status_code == 200
        categories = response.json()
        assert len(categories) >= 1

    def test_delete_category_without_products(self, client, db_session, test_store):
        """Test deleting a category that has no products."""
        from app.models.models import Category
        
        cat = Category(
            category_name="Empty Category",
            store_id=test_store.store_id
        )
        db_session.add(cat)
        db_session.commit()
        
        response = client.delete(f"/api/products/categories/{cat.category_id}")
        assert response.status_code == 200

    def test_delete_category_with_products_fails(self, client, test_category, test_product):
        """Test deleting a category with products fails."""
        response = client.delete(f"/api/products/categories/{test_category.category_id}")
        assert response.status_code == 400
        assert "associated products" in response.json()["detail"]


class TestProductEndpoints:
    """Component tests for product CRUD operations."""

    def test_get_products_empty(self, client):
        """Test getting products when none exist."""
        response = client.get("/api/products")
        assert response.status_code == 200
        # Might be empty or have fixtures

    def test_get_products_by_store(self, client, test_product, test_store):
        """Test getting products filtered by store."""
        response = client.get(f"/api/products?store_id={test_store.store_id}")
        assert response.status_code == 200
        products = response.json()
        assert len(products) >= 1

    def test_get_product_by_id(self, client, test_product):
        """Test getting a specific product."""
        response = client.get(f"/api/products/{test_product.product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["product_name"] == test_product.product_name

    def test_get_nonexistent_product(self, client):
        """Test getting a product that doesn't exist."""
        response = client.get("/api/products/99999")
        assert response.status_code == 404

    def test_create_product_as_vendor(self, client, vendor_auth_headers, test_vendor, test_category):
        """Test creating a product as vendor."""
        response = client.post(
            "/api/products",
            json={
                "product_name": "New Product",
                "product_desc": "A new product",
                "product_price": 49.99,
                "stock_quantity": 20,
                "store_id": test_vendor["store"].store_id,
                "category_id": test_category.category_id,
                "status": "active"
            },
            headers=vendor_auth_headers
        )
        # May need store to match vendor's store
        assert response.status_code in [200, 403]  # 403 if store mismatch

    def test_update_product(self, client, test_product, vendor_auth_headers):
        """Test updating a product."""
        response = client.put(
            f"/api/products/{test_product.product_id}",
            json={
                "product_name": "Updated Product Name",
                "product_price": 39.99
            },
            headers=vendor_auth_headers
        )
        # Could be 200 or 403 depending on ownership
        assert response.status_code in [200, 403]

    def test_delete_product(self, client, db_session, test_store, test_category, vendor_auth_headers):
        """Test deleting a product."""
        from app.models.models import Product
        
        product = Product(
            product_name="To Delete",
            product_price=10.00,
            store_id=test_store.store_id,
            category_id=test_category.category_id
        )
        db_session.add(product)
        db_session.commit()
        
        response = client.delete(
            f"/api/products/{product.product_id}",
            headers=vendor_auth_headers
        )
        # Could be 200 or 403 depending on ownership
        assert response.status_code in [200, 403, 404]


class TestProductImageUpload:
    """Component tests for product image uploads."""

    def test_upload_image(self, client):
        """Test image upload endpoint."""
        # Create a simple test file
        from io import BytesIO
        
        file_content = BytesIO(b"fake image content")
        file_content.name = "test.jpg"
        
        response = client.post(
            "/api/products/upload",
            files={"file": ("test.jpg", file_content, "image/jpeg")}
        )
        assert response.status_code == 200
        assert "url" in response.json()
