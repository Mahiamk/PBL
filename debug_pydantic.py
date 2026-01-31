from pydantic import BaseModel, ConfigDict
from typing import Optional

class ServiceCreate(BaseModel):
    service_name: str
    service_desc: Optional[str] = None
    service_price: float
    image_url: Optional[str] = None
    store_id: int
    category_id: Optional[int] = None
    status: str = "active"

try:
    # Test case 1: Mimic the frontend payload
    payload = {
        "service_name": "Test Cut",
        "service_desc": "Description",
        "service_price": 15.0,
        "store_id": 2,
        "image_url": "http://example.com/image.jpg",
        "status": "active"
    }
    
    # Missing category_id should be fine
    s = ServiceCreate(**payload)
    print("Optimization 1: Success")
    print(s)

    # Test case 2: String price
    payload2 = payload.copy()
    payload2["service_price"] = "15.50"
    s2 = ServiceCreate(**payload2)
    print("Optimization 2: Success (String Price)")

    # Test case 3: String INT store_id
    payload3 = payload.copy()
    payload3["store_id"] = "2" # JS parseInt returns number but JSON over wire might be string if not careful? No axios sends numbers as numbers.
    # But let's check validation
    s3 = ServiceCreate(**payload3)
    print("Optimization 3: Success (String StoreID)")
    
    # Test case 4: NaN price (JS sends null if JSON.stringify(NaN))
    payload4 = payload.copy()
    payload4["service_price"] = None # None is not float
    try:
        s4 = ServiceCreate(**payload4)
    except Exception as e:
        print(f"Optimization 4: Expected Failure: {e}")

except Exception as e:
    print(f"UNEXPECTED FAILURE: {e}")
