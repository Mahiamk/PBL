import sys
from app.db.database import SessionLocal
from app.models import models
from app.core.security import get_password_hash

def seed_all_campus_shops():
    db = SessionLocal()
    try:
        print("--- Starting Campus Shops Seeding ---")

        # 1. Stores Data
        stores_data = [
            {
                "store_id": 1,
                "store_name": "AIU Tech & Repair Hub",
                "store_type": "ComputerShop",
                "image_url": "/assets/computershop/computer-shop.jpg",
                "working_hours": "09:30 AM - 08:00 PM",
                "location": "Student Center, Level 2",
                "phone": "+60 11-2345 6701",
                "description": "Authorized on-campus computer diagnostics, laptop repair, OS installation, SSD/RAM upgrades, and tech accessories for students & faculty.",
                "vendor_email": "tech@aiu.edu",
                "vendor_name": "Tariq Tech Master",
                "services": [
                    {"name": "Laptop Diagnostics & Health Check", "desc": "Full hardware and thermal inspection with diagnostic report", "price": 25.00},
                    {"name": "OS Reinstallation & Formatting", "desc": "Clean Windows/macOS/Linux setup with essential campus software", "price": 45.00},
                    {"name": "SSD & RAM Hardware Upgrade", "desc": "Speed up your study laptop with new high-speed storage or RAM (installation fee)", "price": 35.00},
                    {"name": "Thermal Paste & Deep Fan Cleaning", "desc": "Prevent overheating and fan noise with premium thermal paste application", "price": 30.00},
                    {"name": "Screen & Keyboard Replacement", "desc": "Precision repair service for damaged laptop screens and keyboards", "price": 75.00},
                ],
                "providers": ["Tariq Al-Muhandis", "Faris IT"],
                "categories": ["Laptops & PC", "Accessories", "Peripherals"],
                "products": [
                    {"name": "Wireless Ergonomic Mouse", "desc": "Silent-click Bluetooth mouse ideal for library study sessions", "price": 39.00, "stock": 25},
                    {"name": "65W GaN Fast Charger USB-C", "desc": "Compact laptop and phone fast charger with multi-port power delivery", "price": 69.00, "stock": 30},
                    {"name": "Mechanical Keyboard (Tenkeyless)", "desc": "Custom mechanical keyboard with soft tactile switches", "price": 129.00, "stock": 15},
                    {"name": "High-Speed 1TB External SSD", "desc": "Pocket-sized fast NVMe external storage for coursework and projects", "price": 199.00, "stock": 12},
                ]
            },
            {
                "store_id": 2,
                "store_name": "AIU Campus Barber Shop",
                "store_type": "BarberShop",
                "image_url": "/assets/barber-shop/coolcut.jpg",
                "working_hours": "09:00 AM - 09:00 PM",
                "location": "Student Center, Level 2",
                "phone": "+60 11-2345 6702",
                "description": "Professional student grooming studio offering signature fades, classic scissor cuts, beard sculpting, and relaxing hot towel shaves.",
                "vendor_email": "barber@aiu.edu",
                "vendor_name": "Anas Master Barber",
                "services": [
                    {"name": "Modern Low/Mid Fade", "desc": "Clean skin fade with clipper precision and textured top styling", "price": 15.00},
                    {"name": "Classic Gentleman Scissor Cut", "desc": "All-scissor trim, side parting, and professional finish", "price": 16.00},
                    {"name": "Textured French Crop", "desc": "Modern streetwear fringe crop with textured layers", "price": 17.00},
                    {"name": "Pompadour / Executive Cut", "desc": "High-volume slick style with natural taper", "price": 15.00},
                    {"name": "Buzz Cut & Sharp Edge-Up", "desc": "Crisp military buzz cut with razor edge lineup", "price": 12.00},
                    {"name": "Beard Trim & Hot Towel Sculpting", "desc": "Beard contouring with soothing eucalyptus hot towel treatment", "price": 10.00},
                    {"name": "Full VIP Package (Haircut + Beard + Wash)", "desc": "Complete makeover with scalp massage, cut, wash, and beard care", "price": 28.00},
                ],
                "providers": ["Anas", "Alaa", "Zayd"],
                "categories": ["Hair Care Products", "Grooming Accessories"],
                "products": [
                    {"name": "Matte Clay Styling Pomade", "desc": "Strong hold matte finish water-based styling wax", "price": 24.00, "stock": 40},
                    {"name": "Organic Argan Beard Oil", "desc": "Nourishing beard oil for softening and healthy beard growth", "price": 18.00, "stock": 35},
                ]
            },
            {
                "store_id": 3,
                "store_name": "AIU Tailor & Alterations",
                "store_type": "Tailor",
                "image_url": "/assets/tailor/tailor.webp",
                "working_hours": "10:00 AM - 07:00 PM",
                "location": "Student Center, Level 1",
                "phone": "+60 11-2345 6703",
                "description": "Custom tailoring, traditional attire, graduation robe adjustments, formal suit alterations, and garment repairs for AIU students.",
                "vendor_email": "tailor@aiu.edu",
                "vendor_name": "Master Tailor Ibrahim",
                "services": [
                    {"name": "Trouser / Jeans Hemming", "desc": "Quick length adjustment with original hem matching", "price": 10.00},
                    {"name": "Shirt & Blouse Slimming / Tapering", "desc": "Body contour adjustment for sharp, fitted formal wear", "price": 18.00},
                    {"name": "Suit Jacket & Blazer Alterations", "desc": "Sleeve shortening, shoulder adjustment, and waist suppression", "price": 45.00},
                    {"name": "Traditional Baju Melayu Tailoring", "desc": "Bespoke custom tailoring for traditional attire", "price": 75.00},
                    {"name": "Zipper, Button & Seam Repair", "desc": "Fast replacement for broken zippers and torn seams", "price": 8.00},
                    {"name": "Graduation Robe Fitting & Ironing", "desc": "Complete press and custom size adjustments for convocation", "price": 20.00},
                ],
                "providers": ["Master Ibrahim", "Fatima Tailor"],
                "categories": ["Tailoring Materials", "Accessories"],
                "products": [
                    {"name": "Formal Cufflinks & Tie Clip Set", "desc": "Classic silver alloy accessory set for presentations and interviews", "price": 28.00, "stock": 20},
                    {"name": "Compact Travel Sewing Kit", "desc": "Essential needle, thread, and button emergency repair pack", "price": 12.00, "stock": 50},
                ]
            },
            {
                "store_id": 4,
                "store_name": "AIU Flask & Bottle Shop",
                "store_type": "BottleShop",
                "image_url": "/assets/thermos-yellow.jpg",
                "working_hours": "09:00 AM - 06:00 PM",
                "location": "Student Union Building, Kiosk 3",
                "phone": "+60 11-2345 6704",
                "description": "Eco-friendly insulated thermal flasks, stainless steel water bottles, and custom campus drinkware keeping drinks cold for 24h and hot for 12h.",
                "vendor_email": "bottles@aiu.edu",
                "vendor_name": "Ahmad Bottle Studio",
                "services": [
                    {"name": "Custom Laser Name Engraving", "desc": "Personalize your tumbler or flask with laser-etched student name / matric number", "price": 8.00},
                    {"name": "Lid & Straw Replacement Service", "desc": "Genuine replacement seals, leak-proof lids, and stainless straws", "price": 5.00},
                ],
                "providers": ["Ahmad"],
                "categories": ["Thermal Flasks", "Tumblers", "Accessories"],
                "products": [
                    {"name": "AIU Heritage Stainless Flask (750ml)", "desc": "Double-wall vacuum insulated flask in mustard yellow with matte finish", "price": 45.00, "stock": 60},
                    {"name": "Midnight Black Matte Tumbler (500ml)", "desc": "Leak-proof travel coffee tumbler with silicone grip", "price": 38.00, "stock": 45},
                    {"name": "Emerald Gradient Sport Bottle (1000ml)", "desc": "Large capacity BPA-free sport bottle with hydration time markers", "price": 32.00, "stock": 50},
                ]
            },
            {
                "store_id": 5,
                "store_name": "AIU Campus Cafe & Brews",
                "store_type": "DrinkShop",
                "image_url": "/assets/drinkshop/drink.webp",
                "working_hours": "08:00 AM - 10:00 PM",
                "location": "Student Center, Level 2",
                "phone": "+60 11-2345 6705",
                "description": "Freshly roasted specialty coffees, iced matcha lattes, boba teas, fruit smoothies, and pastry snacks to power your campus study days.",
                "vendor_email": "drinks@aiu.edu",
                "vendor_name": "Samir Barista",
                "services": [
                    {"name": "Event Beverage Catering / Pre-Order", "desc": "Group order package for student club events and study groups", "price": 50.00},
                ],
                "providers": ["Samir", "Nour Barista"],
                "categories": ["Specialty Coffee", "Tea & Boba", "Pastries"],
                "products": [
                    {"name": "Signature Iced Spanish Latte", "desc": "Rich espresso layered with sweetened milk and creamy foam", "price": 9.50, "stock": 100},
                    {"name": "Japanese Uji Matcha Latte", "desc": "Ceremonial grade green tea latte with oat milk option", "price": 11.00, "stock": 80},
                    {"name": "Brown Sugar Boba Fresh Milk", "desc": "Warm brown sugar tapioca pearls with chilled whole milk", "price": 8.50, "stock": 90},
                    {"name": "Butter Croissant (Baked Fresh Daily)", "desc": "Flaky French butter pastry warm from the oven", "price": 5.00, "stock": 40},
                ]
            },
            {
                "store_id": 6,
                "store_name": "AIU Wellness & Cupping Therapy",
                "store_type": "Massage",
                "image_url": "/assets/massage/cupping.jpg",
                "working_hours": "11:00 AM - 09:00 PM",
                "location": "Sports Complex Building, Room 203",
                "phone": "+60 11-2345 6706",
                "description": "Certified sports therapy, traditional dry/wet cupping (Hijama), shoulder tension relief, and stress relaxation for students and staff.",
                "vendor_email": "massage@aiu.edu",
                "vendor_name": "Dr. Luqman Wellness",
                "services": [
                    {"name": "Traditional Cupping Therapy (Hijama)", "desc": "Full back 10-point cupping session for detoxification and muscle circulation", "price": 45.00},
                    {"name": "Upper Body Stress & Neck Relief", "desc": "30-minute targeted pressure therapy for exam neck and shoulder stiffness", "price": 30.00},
                    {"name": "Full Body Sports Recovery Massage", "desc": "60-minute deep tissue therapy for athletes and active students", "price": 65.00},
                    {"name": "Foot Reflexology & Herbal Soak", "desc": "45-minute revitalizing foot acupressure with warm aromatic herbs", "price": 35.00},
                ],
                "providers": ["Dr. Luqman", "Ustaz Khalid"],
                "categories": ["Therapy Oils", "Health Essentials"],
                "products": [
                    {"name": "Pure Eucalyptus Massage Oil (100ml)", "desc": "Natural essential oil blend for sore joint and muscle recovery", "price": 22.00, "stock": 30},
                ]
            },
            {
                "store_id": 7,
                "store_name": "AIU Official Apparel & Store",
                "store_type": "ClothingShop",
                "image_url": "/assets/banner-one.png",
                "working_hours": "09:00 AM - 07:00 PM",
                "location": "Student Center, Level 2",
                "phone": "+60 11-2345 6707",
                "description": "Official Albukhary International University collegiate merchandise, varsity jackets, comfortable hoodies, formal polos, and campus bags.",
                "vendor_email": "clothing@aiu.edu",
                "vendor_name": "Campus Merch Team",
                "services": [
                    {"name": "Custom Batch Club Shirt Printing", "desc": "Silk-screen and DTF printing for university clubs and society events", "price": 18.00},
                ],
                "providers": ["Campus Merch Manager"],
                "categories": ["Hoodies & Jackets", "T-Shirts & Polos", "Bags & Gear"],
                "products": [
                    {"name": "AIU University Classic Heavyweight Hoodie", "desc": "100% brushed cotton fleece hoodie with premium stitched university crest", "price": 79.00, "stock": 50},
                    {"name": "Collegiate Varsity Bomber Jacket", "desc": "Wool-blend varsity jacket with faux leather sleeves and snap buttons", "price": 139.00, "stock": 35},
                    {"name": "Embroidered Pique Cotton Polo", "desc": "Breathable formal polo shirt in navy blue with AIU gold embroidery", "price": 49.00, "stock": 60},
                    {"name": "Canvas University Tote Bag", "desc": "Durable heavy canvas tote bag with zippered laptop compartment", "price": 29.00, "stock": 80},
                ]
            }
        ]

        # Seed each store
        for data in stores_data:
            store_id = data["store_id"]
            
            # Check or create Store
            store = db.query(models.Store).filter(models.Store.store_id == store_id).first()
            if not store:
                store = models.Store(
                    store_id=store_id,
                    store_name=data["store_name"],
                    store_type=data["store_type"],
                    image_url=data["image_url"],
                    working_hours=data["working_hours"],
                    location=data["location"],
                    phone=data["phone"],
                    description=data["description"],
                    status="active"
                )
                db.add(store)
                db.flush()
                print(f"Created Store: {store.store_name}")
            else:
                store.store_name = data["store_name"]
                store.store_type = data["store_type"]
                store.image_url = data["image_url"]
                store.working_hours = data["working_hours"]
                store.location = data["location"]
                store.phone = data["phone"]
                store.description = data["description"]
                store.status = "active"
                db.flush()
                print(f"Updated Store: {store.store_name}")

            # Check or create Vendor User
            user = db.query(models.User).filter(models.User.email == data["vendor_email"]).first()
            if not user:
                name_parts = data["vendor_name"].split(" ")
                first_name = name_parts[0]
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else "Vendor"
                user = models.User(
                    email=data["vendor_email"],
                    hashed_password=get_password_hash("password123"),
                    first_name=first_name,
                    last_name=last_name,
                    phone_number=data["phone"],
                    role=models.UserRole.VENDOR,
                    status="active"
                )
                db.add(user)
                db.flush()
                print(f"Created Vendor User: {user.email}")

            # Check or create Vendor Profile
            vendor_profile = db.query(models.Vendor).filter(models.Vendor.store_id == store_id).first()
            if not vendor_profile:
                vendor_profile = models.Vendor(
                    vendor_name=data["vendor_name"],
                    user_id=user.id,
                    store_id=store_id
                )
                db.add(vendor_profile)
                db.flush()

            # Seed Providers
            for prov_name in data.get("providers", []):
                prov = db.query(models.ServiceProvider).filter(
                    models.ServiceProvider.name == prov_name,
                    models.ServiceProvider.store_id == store_id
                ).first()
                if not prov:
                    prov = models.ServiceProvider(
                        name=prov_name,
                        store_id=store_id,
                        contact=data["phone"]
                    )
                    db.add(prov)
                    db.flush()

            # Seed Services
            for s in data.get("services", []):
                service = db.query(models.Service).filter(
                    models.Service.service_name == s["name"],
                    models.Service.store_id == store_id
                ).first()
                if not service:
                    service = models.Service(
                        service_name=s["name"],
                        service_desc=s["desc"],
                        service_price=s["price"],
                        store_id=store_id,
                        status="active"
                    )
                    db.add(service)
                    db.flush()

            # Seed Categories and Products
            cat_map = {}
            for cat_name in data.get("categories", ["General"]):
                cat = db.query(models.Category).filter(
                    models.Category.category_name == cat_name,
                    models.Category.store_id == store_id
                ).first()
                if not cat:
                    cat = models.Category(
                        category_name=cat_name,
                        category_type=data["store_type"],
                        store_id=store_id
                    )
                    db.add(cat)
                    db.flush()
                cat_map[cat_name] = cat.category_id

            first_cat_id = list(cat_map.values())[0] if cat_map else None

            for p in data.get("products", []):
                prod = db.query(models.Product).filter(
                    models.Product.product_name == p["name"],
                    models.Product.store_id == store_id
                ).first()
                if not prod:
                    prod = models.Product(
                        product_name=p["name"],
                        product_desc=p["desc"],
                        product_price=p["price"],
                        stock_quantity=p.get("stock", 50),
                        store_id=store_id,
                        category_id=first_cat_id,
                        status="active"
                    )
                    db.add(prod)
                    db.flush()

        db.commit()
        print("--- All 7 Campus Stores, Vendors, Services & Products Successfully Seeded! ---")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_all_campus_shops()
