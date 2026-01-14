# PBL

#OUR ARCHITECTURE
.
├── backend
│   ├── app
│   │   ├── __init__.py
│   │   ├── __pycache__
│   │   │   ├── __init__.cpython-313.pyc
│   │   │   └── main.cpython-313.pyc
│   │   ├── api
│   │   │   ├── __pycache__
│   │   │   │   └── deps.cpython-313.pyc
│   │   │   ├── deps.py
│   │   │   └── v1
│   │   │       ├── __pycache__
│   │   │       │   ├── admin.cpython-313.pyc
│   │   │       │   ├── appointments.cpython-313.pyc
│   │   │       │   ├── auth.cpython-313.pyc
│   │   │       │   ├── messages.cpython-313.pyc
│   │   │       │   ├── orders.cpython-313.pyc
│   │   │       │   ├── products.cpython-313.pyc
│   │   │       │   ├── reviews.cpython-313.pyc
│   │   │       │   ├── services.cpython-313.pyc
│   │   │       │   ├── stores.cpython-313.pyc
│   │   │       │   └── users.cpython-313.pyc
│   │   │       ├── admin.py
│   │   │       ├── appointments.py
│   │   │       ├── auth.py
│   │   │       ├── messages.py
│   │   │       ├── orders.py
│   │   │       ├── products.py
│   │   │       ├── reviews.py
│   │   │       ├── services.py
│   │   │       ├── stores.py
│   │   │       └── users.py
│   │   ├── core
│   │   │   ├── __pycache__
│   │   │   │   ├── config.cpython-313.pyc
│   │   │   │   └── security.cpython-313.pyc
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── database.py
│   │   ├── db
│   │   │   ├── __pycache__
│   │   │   │   ├── base_class.cpython-313.pyc
│   │   │   │   ├── database.cpython-313.pyc
│   │   │   │   └── mock_db.cpython-313.pyc
│   │   │   ├── database.py
│   │   │   ├── mock_db.py
│   │   │   └── session.py
│   │   ├── main.py
│   │   ├── models
│   │   │   ├── __pycache__
│   │   │   │   ├── models.cpython-313.pyc
│   │   │   │   └── user.cpython-313.pyc
│   │   │   └── models.py
│   │   └── schemas
│   │       ├── __pycache__
│   │       │   ├── auth.cpython-313.pyc
│   │       │   └── schemas.cpython-313.pyc
│   │       ├── auth.py
│   │       └── schemas.py
│   ├── create_admin.py
│   ├── debug_categories.py
│   ├── pbl.db
│   ├── requirements.txt
│   ├── seed_db.py
│   ├── seed_stores.py
│   ├── test_api.py
│   ├── tests
│   ├── update_schema_orders.py
│   ├── update_schema_v3.py
│   ├── update_schema_v4.py
│   ├── update_schema_v5.py
│   ├── update_schema_v7.py
│   └── update_schema_v8.py
├── credentials.sh
├── database
│   ├── schema.sql
│   └── seeds.sql
├── Difficulties_we_face_during_development_and_how_we_solved.md
├── docker-compose.yml
├── docs
│   ├── diagrams
│   ├── SRS.pdf
│   └── TODO.md
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public
│   │   └── vite.svg
│   ├── README.md
│   ├── src
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   ├── banner-one.jpg
│   │   │   ├── banner-two.jpg
│   │   │   ├── barber-shop
│   │   │   │   ├── barber-styles
│   │   │   │   │   ├── WhatsApp Image 2025-12-29 at 16.25.39.jpeg
│   │   │   │   │   ├── WhatsApp Image 2025-12-29 at 16.25.40 (2).jpeg
│   │   │   │   │   ├── WhatsApp Image 2025-12-29 at 16.25.40 (3).jpeg
│   │   │   │   │   ├── WhatsApp Image 2025-12-29 at 16.25.40.jpeg
│   │   │   │   │   ├── WhatsApp Image 2025-12-29 at 16.25.41 (1).jpeg
│   │   │   │   │   ├── WhatsApp Image 2025-12-29 at 16.25.41 (2).jpeg
│   │   │   │   │   └── WhatsApp Image 2025-12-29 at 16.25.41.jpeg
│   │   │   │   ├── barbers
│   │   │   │   │   ├── Alaa.webp
│   │   │   │   │   └── Anas.webp
│   │   │   │   ├── coolcut.jpg
│   │   │   │   └── fade.webp
│   │   │   ├── bowl-black.jpg
│   │   │   ├── bowl-white.jpg
│   │   │   ├── bowl-yellow.jpg
│   │   │   ├── computershop
│   │   │   │   └── computer-shop.jpg
│   │   │   ├── cup-black.jpg
│   │   │   ├── cup-white.jpg
│   │   │   ├── cup-yellow.jpg
│   │   │   ├── drinkshop
│   │   │   │   └── drink.webp
│   │   │   ├── massage
│   │   │   │   └── cupping.jpg
│   │   │   ├── pen-holder-black.jpg
│   │   │   ├── pen-holder-white.jpg
│   │   │   ├── pen-holder-yellow.jpg
│   │   │   ├── tailor
│   │   │   │   ├── tailor-info
│   │   │   │   │   ├── tailor-team.png
│   │   │   │   │   └── tailor-team0.png
│   │   │   │   ├── tailor-tre
│   │   │   │   │   ├── Measuring the fit of a suit along the wearers back.jpg.webp
│   │   │   │   │   ├── service-img-1758629921.jpg.png
│   │   │   │   │   └── tailoring.jpg
│   │   │   │   └── tailor.webp
│   │   │   ├── thermos-black.jpg
│   │   │   ├── thermos-white.jpg
│   │   │   ├── thermos-yellow.jpg
│   │   │   ├── vase-black.jpg
│   │   │   ├── vase-green.jpg
│   │   │   └── vase-white.jpg
│   │   ├── components
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ShopTemplate.jsx
│   │   │   ├── ui
│   │   │   │   ├── button.jsx
│   │   │   │   └── calendar.jsx
│   │   │   └── vendor
│   │   │       └── management
│   │   │           ├── AttributeManager.jsx
│   │   │           ├── CategoryManager.jsx
│   │   │           ├── CollectionManager.jsx
│   │   │           ├── CustomerManager.jsx
│   │   │           ├── FeaturedProductManager.jsx
│   │   │           ├── MessageManager.jsx
│   │   │           ├── OrderManager.jsx
│   │   │           ├── ProductManager.jsx
│   │   │           ├── ProductNewForm.jsx
│   │   │           └── SettingsManager.jsx
│   │   ├── context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── OrderContext.jsx
│   │   ├── features
│   │   ├── index.css
│   │   ├── layouts
│   │   ├── lib
│   │   │   ├── api.js
│   │   │   └── utils.js
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── admin
│   │   │   │   └── AdminDashboard.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── customer
│   │   │   │   └── CustomerDashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SelectUserType.jsx
│   │   │   ├── services
│   │   │   ├── Shop.jsx
│   │   │   ├── ShopsHub.jsx
│   │   │   ├── vendor
│   │   │   │   ├── barber
│   │   │   │   │   ├── Attribute
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Category
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   ├── Product
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   └── Sidebar.jsx
│   │   │   │   ├── bottleshop
│   │   │   │   │   ├── Attribute
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── BottleShopDashboard.jsx
│   │   │   │   │   ├── Category
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   ├── Product
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── ProductNewForm.jsx
│   │   │   │   │   └── Sidebar.jsx
│   │   │   │   ├── clothesshop
│   │   │   │   │   ├── Attribute
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Category
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   └── Product
│   │   │   │   │       └── index.jsx
│   │   │   │   ├── dashboard
│   │   │   │   │   ├── Sidebar.jsx
│   │   │   │   │   ├── TopBar.jsx
│   │   │   │   │   └── VendorDashboard.jsx
│   │   │   │   ├── drinkshop
│   │   │   │   │   ├── Attribute
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Category
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   └── Product
│   │   │   │   │       └── index.jsx
│   │   │   │   ├── massage
│   │   │   │   │   ├── Attribute
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Category
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   └── Product
│   │   │   │   │       └── index.jsx
│   │   │   │   ├── tailor
│   │   │   │   │   ├── AppointmentManager.jsx
│   │   │   │   │   ├── Attribute
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Category
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   ├── Product
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── service-tailor
│   │   │   │   │   │   ├── Service.jsx
│   │   │   │   │   │   └── ServiceManager.jsx
│   │   │   │   │   └── Sidebar.jsx
│   │   │   │   └── tech
│   │   │   │       ├── Attribute
│   │   │   │       │   └── index.jsx
│   │   │   │       ├── Category
│   │   │   │       │   └── index.jsx
│   │   │   │       ├── Collection
│   │   │   │       │   └── index.jsx
│   │   │   │       ├── Dashboard.jsx
│   │   │   │       ├── FeaturedProduct
│   │   │   │       │   └── index.jsx
│   │   │   │       └── Product
│   │   │   │           └── index.jsx
│   │   │   └── VendorRegister.jsx
│   │   └── shops
│   │       ├── BarberShop
│   │       │   ├── AppointmentConfirmation.jsx
│   │       │   └── BarberShop.jsx
│   │       ├── BottleShop
│   │       │   └── BottleShop.jsx
│   │       ├── ClothingShop
│   │       │   └── ClothingShop.jsx
│   │       ├── ComputerShop
│   │       │   └── ComputerShop.jsx
│   │       ├── DrinkShop
│   │       │   └── DrinkShop.jsx
│   │       ├── index.js
│   │       ├── Massage
│   │       │   └── Massage.jsx
│   │       └── Tailor
│   │           ├── AppointmentConfirmation.jsx
│   │           └── Tailor.jsx
│   ├── TODO
│   └── vite.config.js
├── package-lock.json
├── package.json
├── README.md
└── Reminder.txt
