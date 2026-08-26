import os
import sys
from pathlib import Path
from sqlalchemy import text

BACKEND_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.db.database import engine, Base, SessionLocal
from app.models import models
from app.core.security import get_password_hash

DEFAULT_PASSWORD = "Password@123"

def reset_and_seed():
    print("==================================================")
    print("      RESETTING & RE-SEEDING DATABASE...         ")
    print("==================================================")

    # 1. Drop and recreate all tables
    print("\n1. Dropping all existing tables...")
    try:
        with engine.connect() as conn:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            conn.commit()
    except Exception:
        pass

    Base.metadata.drop_all(bind=engine)
    print("2. Creating all database tables afresh...")
    Base.metadata.create_all(bind=engine)

    try:
        with engine.connect() as conn:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            conn.commit()
    except Exception:
        pass

    db = SessionLocal()
    hashed_pwd = get_password_hash(DEFAULT_PASSWORD)

    try:
        # 2. Seed Payment Methods
        print("\n3. Seeding Payment Methods...")
        pm_online = models.PaymentMethod(method_name="Online Banking", description="Direct online campus portal payment")
        pm_cod = models.PaymentMethod(method_name="Cash on Delivery / Pickup", description="Pay upon order pickup or store service")
        db.add_all([pm_online, pm_cod])
        db.commit()

        # 3. Seed Admin User
        print("4. Seeding Admin & Student Accounts...")
        admin_user = models.User(
            first_name="System",
            last_name="Administrator",
            initial="A.",
            email="admin@aiu.edu",
            hashed_password=hashed_pwd,
            role=models.UserRole.ADMIN,
            status="active",
            phone_number="+60 12-000 0001"
        )
        db.add(admin_user)

        # 4. Seed Student User
        student_user = models.User(
            first_name="Ali",
            last_name="Mohammed",
            initial="M.",
            email="student@aiu.edu",
            hashed_password=hashed_pwd,
            role=models.UserRole.CUSTOMER,
            status="active",
            phone_number="+60 12-000 0002"
        )
        db.add(student_user)
        db.commit()

        # 5. Define All 7 Campus Stores
        shops_data = [
            {
                "store_id": 1,
                "store_name": "AIU Tech & Repair Hub",
                "store_type": "ComputerShop",
                "image_url": "/assets/computershop/computer-shop.jpg",
                "working_hours": "09:30 AM - 08:00 PM",
                "location": "Student Center, Level 2",
                "phone": "+60 11-2345 6701",
                "description": "Authorized on-campus computer diagnostics, laptop repair, OS formatting, SSD/RAM upgrades, and essential tech accessories.",
                "vendor_email": "tech@aiu.edu",
                "vendor_first_name": "Tariq",
                "vendor_last_name": "Al-Muhandis",
                "providers": ["Tariq Al-Muhandis", "Faris Tech"],
                "services": [
                    {"name": "Laptop Diagnostics & Health Check", "desc": "Full hardware, thermal, and software malware inspection with report", "price": 25.00},
                    {"name": "OS Reinstallation & Formatting", "desc": "Clean Windows/macOS/Linux install with essential campus study utilities", "price": 45.00},
                    {"name": "SSD & RAM Hardware Upgrade", "desc": "High-speed storage or memory upgrade installation and data migration", "price": 35.00},
                    {"name": "Thermal Paste & Deep Fan Cleaning", "desc": "Premium thermal paste application to eliminate thermal throttling and noise", "price": 30.00},
                    {"name": "Screen & Keyboard Replacement", "desc": "Component repair and precision replacement for damaged hardware", "price": 75.00},
                ],
                "categories": ["Laptops & PC", "Accessories", "Peripherals"],
                "products": [
                    {"name": "Wireless Ergonomic Mouse", "desc": "Silent-click Bluetooth mouse ideal for library study sessions", "price": 39.00, "stock": 25, "image": "/assets/computershop/computer-shop.jpg"},
                    {"name": "65W GaN Fast Charger USB-C", "desc": "Compact laptop and phone fast charger with multi-port power delivery", "price": 69.00, "stock": 30, "image": "/assets/computershop/computer-shop.jpg"},
                    {"name": "Mechanical Keyboard (Tenkeyless)", "desc": "Custom mechanical keyboard with soft tactile switches", "price": 129.00, "stock": 15, "image": "/assets/computershop/computer-shop.jpg"},
                    {"name": "High-Speed 1TB External SSD", "desc": "Pocket-sized fast NVMe external storage for coursework and projects", "price": 199.00, "stock": 12, "image": "/assets/computershop/computer-shop.jpg"},
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
                "description": "Professional student grooming studio offering signature fades, classic scissor cuts, beard sculpting, and hot towel shaves.",
                "vendor_email": "barber@aiu.edu",
                "vendor_first_name": "Anas",
                "vendor_last_name": "Barber",
                "providers": ["Anas Master Barber", "Alaa Stylist", "Zayd Barber"],
                "services": [
                    {"name": "Modern Low/Mid Fade", "desc": "Clean skin fade with clipper precision and textured top styling", "price": 15.00},
                    {"name": "Classic Gentleman Scissor Cut", "desc": "All-scissor trim, clean side parting, and natural finish", "price": 16.00},
                    {"name": "Textured French Crop", "desc": "Modern streetwear fringe crop with textured layers", "price": 17.00},
                    {"name": "Pompadour / Executive Cut", "desc": "High-volume slick style with natural taper", "price": 15.00},
                    {"name": "Buzz Cut & Sharp Edge-Up", "desc": "Crisp military buzz cut with razor edge lineup", "price": 12.00},
                    {"name": "Beard Trim & Hot Towel Sculpting", "desc": "Beard contouring with soothing eucalyptus hot towel treatment", "price": 10.00},
                    {"name": "Full VIP Package (Haircut + Beard + Wash)", "desc": "Complete makeover with scalp massage, cut, wash, and beard care", "price": 28.00},
                ],
                "categories": ["Hair Care Products", "Grooming Accessories"],
                "products": [
                    {"name": "Matte Clay Styling Pomade", "desc": "Strong hold matte finish water-based styling wax", "price": 24.00, "stock": 40, "image": "/assets/barber-shop/coolcut.jpg"},
                    {"name": "Organic Argan Beard Oil", "desc": "Nourishing beard oil for softening and healthy beard growth", "price": 18.00, "stock": 35, "image": "/assets/barber-shop/coolcut.jpg"},
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
                "description": "Custom tailoring, traditional attire, graduation robe adjustments, formal suit alterations, and emergency garment repairs.",
                "vendor_email": "tailor@aiu.edu",
                "vendor_first_name": "Ibrahim",
                "vendor_last_name": "Al-Khayyat",
                "providers": ["Master Ibrahim", "Fatima Tailor"],
                "services": [
                    {"name": "Trouser / Jeans Hemming", "desc": "Quick length adjustment with original hem matching", "price": 10.00},
                    {"name": "Shirt & Blouse Slimming / Tapering", "desc": "Body contour adjustment for sharp, fitted formal wear", "price": 18.00},
                    {"name": "Suit Jacket & Blazer Alterations", "desc": "Sleeve shortening, shoulder adjustment, and waist suppression", "price": 45.00},
                    {"name": "Traditional Baju Melayu Tailoring", "desc": "Bespoke custom tailoring for traditional attire", "price": 75.00},
                    {"name": "Zipper, Button & Seam Repair", "desc": "Fast replacement for broken zippers and torn seams", "price": 8.00},
                    {"name": "Graduation Robe Fitting & Ironing", "desc": "Complete press and custom size adjustments for convocation", "price": 20.00},
                ],
                "categories": ["Tailoring Materials", "Accessories"],
                "products": [
                    {"name": "Formal Cufflinks & Tie Clip Set", "desc": "Classic silver alloy accessory set for presentations and interviews", "price": 28.00, "stock": 20, "image": "/assets/tailor/tailor.webp"},
                    {"name": "Compact Travel Sewing Kit", "desc": "Essential needle, thread, and button emergency repair pack", "price": 12.00, "stock": 50, "image": "/assets/tailor/tailor.webp"},
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
                "description": "Insulated vacuum thermal flasks, stainless steel sports bottles, and custom campus drinkware keeping drinks cold 24h and hot 12h.",
                "vendor_email": "bottles@aiu.edu",
                "vendor_first_name": "Ahmad",
                "vendor_last_name": "FlaskMaster",
                "providers": ["Ahmad Bottle Specialist"],
                "services": [
                    {"name": "Custom Laser Name Engraving", "desc": "Personalize your tumbler or flask with laser-etched student name or matric number", "price": 8.00},
                    {"name": "Lid & Straw Replacement Service", "desc": "Genuine replacement seals, leak-proof lids, and stainless straws", "price": 5.00},
                ],
                "categories": ["Thermal Flasks", "Tumblers", "Accessories"],
                "products": [
                    {"name": "AIU Heritage Stainless Flask (750ml)", "desc": "Double-wall vacuum insulated flask in mustard yellow with matte finish", "price": 45.00, "stock": 60, "image": "/assets/thermos-yellow.jpg"},
                    {"name": "Midnight Black Matte Tumbler (500ml)", "desc": "Leak-proof travel coffee tumbler with silicone grip", "price": 38.00, "stock": 45, "image": "/assets/thermos-black.jpg"},
                    {"name": "Emerald Gradient Sport Bottle (1000ml)", "desc": "Large capacity BPA-free sport bottle with hydration time markers", "price": 32.00, "stock": 50, "image": "/assets/vase-green.jpg"},
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
                "description": "Freshly roasted specialty coffees, iced matcha lattes, boba teas, and oven-fresh bakery pastries.",
                "vendor_email": "drinks@aiu.edu",
                "vendor_first_name": "Samir",
                "vendor_last_name": "Barista",
                "providers": ["Samir Head Barista", "Nour Barista"],
                "services": [
                    {"name": "Event Beverage Catering / Pre-Order", "desc": "Group order package for student club events and study groups", "price": 50.00},
                ],
                "categories": ["Specialty Coffee", "Tea & Boba", "Pastries"],
                "products": [
                    {"name": "Signature Iced Spanish Latte", "desc": "Rich espresso layered with sweetened condensed milk and velvety foam", "price": 9.50, "stock": 100, "image": "/assets/drinkshop/drink.webp"},
                    {"name": "Japanese Uji Matcha Latte", "desc": "Ceremonial grade green tea latte with oat milk option", "price": 11.00, "stock": 80, "image": "/assets/drinkshop/drink.webp"},
                    {"name": "Brown Sugar Boba Fresh Milk", "desc": "Warm brown sugar tapioca pearls with chilled whole milk", "price": 8.50, "stock": 90, "image": "/assets/drinkshop/drink.webp"},
                    {"name": "Butter Croissant (Baked Fresh Daily)", "desc": "Flaky French butter pastry warm from the morning oven", "price": 5.00, "stock": 40, "image": "/assets/bowl-white.jpg"},
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
                "description": "Certified athletic therapy, traditional wet/dry cupping (Hijama), exam stress tension relief, and sports recovery massage.",
                "vendor_email": "massage@aiu.edu",
                "vendor_first_name": "Luqman",
                "vendor_last_name": "Hakim",
                "providers": ["Dr. Luqman Therapist", "Ustaz Khalid Cupping"],
                "services": [
                    {"name": "Traditional Cupping Therapy (Hijama)", "desc": "Full back 10-point cupping session for detoxification and muscle circulation", "price": 45.00},
                    {"name": "Upper Body Stress & Neck Relief", "desc": "30-minute targeted pressure therapy for exam neck and shoulder stiffness", "price": 30.00},
                    {"name": "Full Body Sports Recovery Massage", "desc": "60-minute deep tissue therapy for athletes and active students", "price": 65.00},
                    {"name": "Foot Reflexology & Herbal Soak", "desc": "45-minute revitalizing foot acupressure with warm aromatic herbs", "price": 35.00},
                ],
                "categories": ["Therapy Oils", "Health Essentials"],
                "products": [
                    {"name": "Pure Eucalyptus Massage Oil (100ml)", "desc": "Natural essential oil blend for sore joint and muscle recovery", "price": 22.00, "stock": 30, "image": "/assets/massage/cupping.jpg"},
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
                "description": "Official Albukhary International University collegiate merchandise, varsity jackets, fleece hoodies, and campus lifestyle apparel.",
                "vendor_email": "clothing@aiu.edu",
                "vendor_first_name": "Zara",
                "vendor_last_name": "Merch",
                "providers": ["Zara Merch Specialist"],
                "services": [
                    {"name": "Custom Batch Club Shirt Printing", "desc": "Silk-screen and DTF printing for university clubs and society events", "price": 18.00},
                ],
                "categories": ["Hoodies & Jackets", "T-Shirts & Polos", "Bags & Gear"],
                "products": [
                    {"name": "AIU University Classic Heavyweight Hoodie", "desc": "100% brushed cotton fleece hoodie with premium stitched university crest", "price": 79.00, "stock": 50, "image": "/assets/banner-one.png"},
                    {"name": "Collegiate Varsity Bomber Jacket", "desc": "Wool-blend varsity jacket with faux leather sleeves and snap buttons", "price": 139.00, "stock": 35, "image": "/assets/banner-one.png"},
                    {"name": "Embroidered Pique Cotton Polo", "desc": "Breathable formal polo shirt in navy blue with AIU gold embroidery", "price": 49.00, "stock": 60, "image": "/assets/banner-one.png"},
                    {"name": "Canvas University Tote Bag", "desc": "Durable heavy canvas tote bag with zippered laptop compartment", "price": 29.00, "stock": 80, "image": "/assets/banner-one.png"},
                ]
            }
        ]

        print("\n5. Seeding Stores, Vendors, Categories, Products, and Services...")
        for shop in shops_data:
            # Create Store
            store = models.Store(
                store_id=shop["store_id"],
                store_name=shop["store_name"],
                store_type=shop["store_type"],
                image_url=shop["image_url"],
                working_hours=shop["working_hours"],
                location=shop["location"],
                phone=shop["phone"],
                description=shop["description"],
                status="active"
            )
            db.add(store)
            db.flush()

            # Create Vendor User
            vendor_user = models.User(
                first_name=shop["vendor_first_name"],
                last_name=shop["vendor_last_name"],
                initial="V.",
                email=shop["vendor_email"],
                hashed_password=hashed_pwd,
                role=models.UserRole.VENDOR,
                status="active",
                phone_number=shop["phone"]
            )
            db.add(vendor_user)
            db.flush()

            # Create Vendor Profile linking User & Store
            vendor_profile = models.Vendor(
                vendor_name=f"{shop['vendor_first_name']} {shop['vendor_last_name']}",
                store_id=store.store_id,
                user_id=vendor_user.id
            )
            db.add(vendor_profile)
            db.flush()

            # Create Categories
            cat_map = {}
            for cat_name in shop["categories"]:
                cat = models.Category(
                    category_name=cat_name,
                    category_type=shop["store_type"],
                    store_id=store.store_id
                )
                db.add(cat)
                db.flush()
                cat_map[cat_name] = cat.category_id

            # Create Products
            for p in shop["products"]:
                first_cat_id = list(cat_map.values())[0] if cat_map else None
                prod = models.Product(
                    product_name=p["name"],
                    product_desc=p["desc"],
                    product_price=p["price"],
                    image_url=p["image"],
                    stock_quantity=p["stock"],
                    status="active",
                    store_id=store.store_id,
                    category_id=first_cat_id
                )
                db.add(prod)

            # Create Service Providers
            for prov_name in shop["providers"]:
                prov = models.ServiceProvider(
                    name=prov_name,
                    contact=shop["phone"],
                    store_id=store.store_id
                )
                db.add(prov)

            # Create Services
            for s in shop["services"]:
                serv = models.Service(
                    store_id=store.store_id,
                    service_name=s["name"],
                    service_desc=s["desc"],
                    service_price=s["price"],
                    status="active"
                )
                db.add(serv)

            print(f" -> Successfully seeded '{shop['store_name']}' (Vendor: {shop['vendor_email']})")

        db.commit()
        print("\n==================================================")
        print("          DATABASE RE-SEED SUCCESSFUL!           ")
        print("==================================================")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Database reset failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_seed()
