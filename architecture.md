# System Architecture - Fórmula do Boi

The system consists of a Next.js full-stack application connecting directly to Supabase for authentication and database management. The application caters to both public customers browsing cattle catalogs and internal administrators managing inventory and leads.

```mermaid
graph TD
    %% Core Entities
    User[End User / Customer]
    Admin[Administrator]

    %% Main Application Layer (Next.js)
    subgraph "Next.js Application (App Router)"
        direction TB

        subgraph "Public Website (/src/app/web-site)"
            Home[Home & Landing]
            Catalog[Cattle Catalog]
            ProductDetails[Lot / Product Details]
        end

        subgraph "Admin Dashboard (/src/app/web-admin)"
            Auth[Authentication & Login]
            Dashboard[Analytics Dashboard]
            ProductsAdmin[Manage Matrices & Bulls]
            CRM[Sales CRM - Kanban]
            Settings[System Settings]
        end
    end

    %% Database & Backend Services
    subgraph "Backend Services (Supabase)"
        SupabaseAuth[Supabase Auth (SSR)]
        
        subgraph "PostgreSQL Database"
            DB_Leads[(crm_leads)]
            DB_Products[(products)]
            DB_Users[(users)]
        end
        
        Storage[Supabase Storage - Assets]
    end

    %% Interactions - Public
    User -->|Views Catalog| Catalog
    User -->|Views Details| ProductDetails
    Catalog -->|Reads| DB_Products
    ProductDetails -->|Reads| DB_Products

    %% Interactions - Admin
    Admin -->|Logs in| Auth
    Auth <-->|Verifies Credentials| SupabaseAuth
    SupabaseAuth -->|Issues Session Token| Admin

    Admin -->|Manages Inventory| ProductsAdmin
    ProductsAdmin <-->|CRUD Operations| DB_Products
    
    Admin -->|Tracks Sales| CRM
    CRM <-->|CRUD Operations| DB_Leads
    
    Admin -->|Views Metrics| Dashboard
    Dashboard -->|Reads Analytics| DB_Leads
    Dashboard -->|Reads Analytics| DB_Products

    %% Assets
    ProductDetails -->|Loads Images/Videos| Storage
    ProductsAdmin -->|Uploads Media| Storage

    classDef publicLayer fill:#eef2ff,stroke:#6366f1,stroke-width:2px;
    classDef adminLayer fill:#f0fdf4,stroke:#22c55e,stroke-width:2px;
    classDef dbLayer fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;

    class Home,Catalog,ProductDetails publicLayer;
    class Auth,Dashboard,ProductsAdmin,CRM,Settings adminLayer;
    class DB_Leads,DB_Products,DB_Users,SupabaseAuth,Storage dbLayer;
```

## Key Components

1. **Public Website**: Built focusing on SEO and performance to showcase the 'Nelore Padrão' and 'Nelore Pintado' cattle catalog. Users can filter and view details, including prices and videos.
2. **Admin Dashboard**: A secure area requiring Supabase authentication. Allows administrators to:
   - Manage the cattle inventory (products).
   - Track leads through a customized Sales CRM (Kanban board) that saves states directly to the database.
   - View high-level analytics on leads and overall performance.
3. **Database (Supabase PostgreSQL)**: Stores structural data. It employs SSR (Server-Side Rendering) authentication strategies to protect routes natively in Next.js middleware and server actions.
4. **Storage**: Utilizes Supabase Storage (and local `public` caching) for heavy media assets like bull highlight videos and matrix photos.
