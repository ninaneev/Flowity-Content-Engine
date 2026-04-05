import subprocess
import json
import sys

REPO = "ninaneev/PI-Univesp"

MILESTONES = [
    {
        "title": "M1 Core Running (Infra + Auth)",
        "description": "Docker + base API + Auth JWT + /auth/me + Flowbite setup"
    },
    {
        "title": "M2 Upload & Dashboard",
        "description": "Upload to MinIO + uploads list + dashboard + details"
    },
    {
        "title": "M3 Download & Profiling",
        "description": "User/admin download + CSV/JSON profiling"
    },
    {
        "title": "M4 Admin & Audit Trail",
        "description": "RBAC + promote admin + admin pages + audit logs"
    },
    {
        "title": "M5 QA + Report + Presentation",
        "description": "Testing, diagrams, documentation and final presentation"
    },
]

LABELS = [
    ("type:task", "1D76DB", "Implementation task"),
    ("type:bug", "D73A4A", "Bug fix"),
    ("type:docs", "0E8A16", "Documentation"),
    ("area:backend", "5319E7", "Backend/API"),
    ("area:frontend", "FBCA04", "Frontend/UI"),
    ("area:infra", "006B75", "Infra/Docker/DevOps"),
    ("area:security", "B60205", "Security/Auth"),
    ("area:testing", "C5DEF5", "Testing/QA"),
    ("area:project", "7057FF", "Project management"),
    ("prio:p0", "B60205", "Must do now"),
    ("prio:p1", "D93F0B", "High priority"),
    ("prio:p2", "FBCA04", "Normal priority"),
]

ISSUES = [
    # PROJECT / SETUP
    {
        "title": "[P0][Project] Setup repository structure and contribution rules",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:project", "prio:p0"],
        "body": """## Objective
Define the initial repository structure and collaboration rules.

## Files to change
- README.md
- CONTRIBUTING.md
- .gitignore

## Step-by-step
1. Add README with project overview
2. Add CONTRIBUTING with branch/PR conventions
3. Add .gitignore for Python/Node

## Definition of Done
- [ ] README exists
- [ ] CONTRIBUTING exists
- [ ] .gitignore exists
- [ ] Team can follow a shared workflow
"""
    },
    {
        "title": "[P0][Infra] Create docker-compose with db, minio, backend and frontend",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:infra", "prio:p0"],
        "body": """## Objective
Run the entire project locally with one command.

## Files to change
- docker-compose.yml
- backend/Dockerfile
- frontend/Dockerfile

## Step-by-step
1. Add PostgreSQL service
2. Add MinIO service
3. Add backend service
4. Add frontend service
5. Configure ports and environment variables

## Definition of Done
- [ ] docker compose up --build starts all services
- [ ] Frontend opens on localhost:5173
- [ ] Backend docs open on localhost:8000/docs
"""
    },
    {
        "title": "[P1][Infra] Add README run instructions and local URLs",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:docs", "area:infra", "prio:p1"],
        "body": """## Objective
Document how to run the project locally.

## Files to change
- README.md

## Step-by-step
1. Add docker compose instructions
2. Add frontend/backend/minio URLs
3. Add MinIO credentials
4. Add first test flow

## Definition of Done
- [ ] A teammate can run the project following README only
"""
    },
    {
        "title": "[P1][Backend] Add /health endpoint",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:backend", "prio:p1"],
        "body": """## Objective
Provide a simple health check endpoint.

## Files to change
- backend/app/main.py

## Step-by-step
1. Add GET /health returning {'status': 'ok'}

## Definition of Done
- [ ] /health returns status ok
"""
    },

    # AUTH
    {
        "title": "[P0][Backend] Create user model with role and plan fields",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Create the users table model.

## Files to change
- backend/app/models/user.py

## Step-by-step
1. Add fields: id, name, email, password_hash, role, plan, created_at
2. Make email unique
3. Set default role=user and plan=SIA

## Definition of Done
- [ ] User model exists
- [ ] Table is created successfully
"""
    },
    {
        "title": "[P0][Backend] Implement password hashing utilities",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Store passwords securely.

## Files to change
- backend/app/core/security.py

## Step-by-step
1. Add hash_password()
2. Add verify_password()
3. Use bcrypt via passlib

## Definition of Done
- [ ] Passwords are hashed before storage
- [ ] Password verification works
"""
    },
    {
        "title": "[P0][Backend] Implement POST /auth/signup",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Allow a new user to create an account.

## Files to change
- backend/app/routes/auth.py
- backend/app/schemas/auth.py

## Step-by-step
1. Validate input
2. Check if email already exists
3. Hash password
4. Create user row
5. Return JWT token

## Definition of Done
- [ ] New user can sign up
- [ ] Duplicate emails are rejected
- [ ] Access token is returned
"""
    },
    {
        "title": "[P0][Backend] Implement POST /auth/login",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Allow an existing user to login.

## Files to change
- backend/app/routes/auth.py

## Step-by-step
1. Receive email and password
2. Load user by email
3. Verify password hash
4. Return JWT token

## Definition of Done
- [ ] Valid credentials return token
- [ ] Invalid credentials return 401
"""
    },
    {
        "title": "[P0][Backend] Implement JWT token creation helper",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Generate signed JWT tokens.

## Files to change
- backend/app/core/security.py

## Step-by-step
1. Add create_access_token()
2. Include user id in sub field
3. Add expiration

## Definition of Done
- [ ] Token can be decoded later
- [ ] Token includes sub and exp
"""
    },
    {
        "title": "[P0][Backend] Implement get_current_user JWT guard",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Protect authenticated endpoints.

## Files to change
- backend/app/core/auth.py

## Step-by-step
1. Read Authorization Bearer token
2. Decode JWT
3. Load user from DB
4. Return 401 when invalid

## Definition of Done
- [ ] Protected routes fail without token
- [ ] Protected routes work with valid token
"""
    },
    {
        "title": "[P1][Backend] Implement require_admin guard",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "area:security", "prio:p1"],
        "body": """## Objective
Protect admin-only routes.

## Files to change
- backend/app/core/auth.py

## Step-by-step
1. Reuse get_current_user
2. Check current_user.role == admin
3. Return 403 otherwise

## Definition of Done
- [ ] Admin endpoints reject regular users
"""
    },
    {
        "title": "[P1][Backend] Implement GET /auth/me",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:backend", "prio:p1"],
        "body": """## Objective
Let frontend know who is logged in.

## Files to change
- backend/app/routes/auth.py

## Step-by-step
1. Protect route with JWT
2. Return id, name, email, role, plan

## Definition of Done
- [ ] Frontend can fetch current user profile
"""
    },
    {
        "title": "[P1][Backend] Add CORS middleware for frontend origin",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:backend", "prio:p1"],
        "body": """## Objective
Allow frontend to call backend in development.

## Files to change
- backend/app/main.py

## Step-by-step
1. Add CORSMiddleware
2. Allow origin http://localhost:5173

## Definition of Done
- [ ] Browser no longer shows CORS errors
"""
    },

    # STORAGE / UPLOAD
    {
        "title": "[P0][Backend] Implement MinIO S3 client and bucket creation",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:backend", "area:infra", "prio:p0"],
        "body": """## Objective
Connect the backend to local object storage.

## Files to change
- backend/app/services/s3.py

## Step-by-step
1. Create boto3 client
2. Add ensure_bucket()
3. Add upload_bytes()
4. Add download_bytes()

## Definition of Done
- [ ] Backend can create bucket and store objects
"""
    },
    {
        "title": "[P0][Backend] Create Upload model",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:backend", "prio:p0"],
        "body": """## Objective
Store upload metadata.

## Files to change
- backend/app/models/upload.py

## Step-by-step
1. Add user_id, filename, mime_type, size_bytes
2. Add storage_bucket, storage_key
3. Add sha256, status, created_at

## Definition of Done
- [ ] Upload table exists
"""
    },
    {
        "title": "[P0][Backend] Add SHA-256 hashing service",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:backend", "prio:p0"],
        "body": """## Objective
Generate file integrity hash.

## Files to change
- backend/app/services/hashing.py

## Step-by-step
1. Implement sha256_bytes(data)

## Definition of Done
- [ ] Upload endpoint can generate SHA-256
"""
    },
    {
        "title": "[P0][Backend] Implement POST /uploads with validation and storage",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Allow authenticated users to upload a file.

## Files to change
- backend/app/routes/uploads.py
- backend/app/models/upload.py
- backend/app/services/s3.py
- backend/app/services/hashing.py

## Step-by-step
1. Protect with JWT
2. Validate file type
3. Validate size
4. Read bytes
5. Generate SHA-256
6. Upload to MinIO
7. Save metadata in DB

## Definition of Done
- [ ] Upload succeeds for valid files
- [ ] Invalid files are rejected
- [ ] Response includes id, sha256 and status
"""
    },
    {
        "title": "[P1][Backend] Implement GET /uploads for current user",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:backend", "prio:p1"],
        "body": """## Objective
List uploads for dashboard.

## Files to change
- backend/app/routes/uploads.py

## Step-by-step
1. Protect with JWT
2. Filter by current user
3. Order by created_at desc

## Definition of Done
- [ ] Endpoint returns current user's uploads only
"""
    },
    {
        "title": "[P1][Backend] Implement GET /uploads/{id} details",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:backend", "area:security", "prio:p1"],
        "body": """## Objective
Return details of one upload.

## Files to change
- backend/app/routes/uploads.py

## Step-by-step
1. Protect with JWT
2. Check ownership
3. Return metadata and profile if present

## Definition of Done
- [ ] Owner can view details
- [ ] Other users cannot
"""
    },

    # FRONTEND BASE
    {
        "title": "[P0][Frontend] Configure Tailwind, Flowbite and flowbite-react",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:frontend", "prio:p0"],
        "body": """## Objective
Prepare UI stack for the project.

## Files to change
- frontend/package.json
- frontend/tailwind.config.js or .cjs
- frontend/src/index.css

## Step-by-step
1. Install Tailwind
2. Install Flowbite and flowbite-react
3. Configure plugin and content paths
4. Add Tailwind directives in index.css

## Definition of Done
- [ ] Frontend builds correctly with Flowbite
"""
    },
    {
        "title": "[P1][Frontend] Add Flowity AI colors to Tailwind theme",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:frontend", "prio:p1"],
        "body": """## Objective
Use official Flowity colors in UI.

## Files to change
- frontend/tailwind.config.js or .cjs

## Step-by-step
1. Add flowityPurple = #9C83F7
2. Add flowityAqua = #1CD8DE

## Definition of Done
- [ ] Tailwind classes can use both Flowity colors
"""
    },
    {
        "title": "[P0][Frontend] Create AppShell layout with navbar",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:frontend", "prio:p0"],
        "body": """## Objective
Create shared application layout.

## Files to change
- frontend/src/components/AppShell.jsx

## Step-by-step
1. Add navbar
2. Add login/signup/dashboard/upload links
3. Use Flowity colors

## Definition of Done
- [ ] Shared layout works across pages
"""
    },
    {
        "title": "[P0][Frontend] Create Login page",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:frontend", "prio:p0"],
        "body": """## Objective
Allow login from UI.

## Files to change
- frontend/src/pages/Login.jsx
- frontend/src/lib/api.js

## Step-by-step
1. Build form with Flowbite
2. Call POST /auth/login
3. Save token to localStorage
4. Redirect to dashboard

## Definition of Done
- [ ] User can login from browser
"""
    },
    {
        "title": "[P0][Frontend] Create Signup page",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:frontend", "prio:p0"],
        "body": """## Objective
Allow signup from UI.

## Files to change
- frontend/src/pages/Signup.jsx
- frontend/src/lib/api.js

## Step-by-step
1. Build form with Flowbite
2. Call POST /auth/signup
3. Save token to localStorage
4. Redirect to dashboard

## Definition of Done
- [ ] User can create account from browser
"""
    },
    {
        "title": "[P1][Frontend] Implement route protection in main.jsx",
        "milestone": "M1 Core Running (Infra + Auth)",
        "labels": ["type:task", "area:frontend", "prio:p1"],
        "body": """## Objective
Prevent access to private pages when not authenticated.

## Files to change
- frontend/src/main.jsx

## Step-by-step
1. Add RequireAuth wrapper
2. Protect dashboard/upload/details/admin pages

## Definition of Done
- [ ] Logged out users are redirected to login
"""
    },

    # DASHBOARD / UI
    {
        "title": "[P0][Frontend] Create Upload page and connect to POST /uploads",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:frontend", "prio:p0"],
        "body": """## Objective
Allow file submission from UI.

## Files to change
- frontend/src/pages/Upload.jsx
- frontend/src/lib/api.js

## Step-by-step
1. Add file input
2. Send multipart/form-data
3. Show success or error state

## Definition of Done
- [ ] File upload works from frontend
"""
    },
    {
        "title": "[P0][Frontend] Create Dashboard page and list uploads",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:frontend", "prio:p0"],
        "body": """## Objective
Display user uploads on dashboard.

## Files to change
- frontend/src/pages/Dashboard.jsx
- frontend/src/lib/api.js

## Step-by-step
1. Fetch GET /uploads
2. Render Flowbite table
3. Show status badges
4. Link each row to details page

## Definition of Done
- [ ] Dashboard lists uploads correctly
"""
    },
    {
        "title": "[P1][Frontend] Create Upload Details page",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:frontend", "prio:p1"],
        "body": """## Objective
Show one upload in detail.

## Files to change
- frontend/src/pages/UploadDetails.jsx

## Step-by-step
1. Read route param id
2. Call GET /uploads/{id}
3. Show metadata

## Definition of Done
- [ ] Upload details page loads correctly
"""
    },
    {
        "title": "[P2][Frontend] Create reusable ErrorAlert component",
        "milestone": "M2 Upload & Dashboard",
        "labels": ["type:task", "area:frontend", "prio:p2"],
        "body": """## Objective
Standardize error display across pages.

## Files to change
- frontend/src/components/ErrorAlert.jsx

## Step-by-step
1. Wrap Flowbite Alert
2. Reuse in Login/Signup/Upload/Dashboard

## Definition of Done
- [ ] Error component is reused in at least 3 pages
"""
    },

    # DOWNLOAD
    {
        "title": "[P0][Backend] Implement GET /uploads/{id}/download for owner",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Allow the owner to download their uploaded file.

## Files to change
- backend/app/routes/uploads.py

## Step-by-step
1. Protect with JWT
2. Check ownership
3. Read bytes from MinIO
4. Return attachment response

## Definition of Done
- [ ] Owner can download file
- [ ] Non-owner cannot
"""
    },
    {
        "title": "[P1][Frontend] Add apiDownload helper for browser downloads",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:frontend", "prio:p1"],
        "body": """## Objective
Download files from the browser with correct filename.

## Files to change
- frontend/src/lib/api.js

## Step-by-step
1. Fetch endpoint as blob
2. Read filename from content-disposition
3. Trigger browser download

## Definition of Done
- [ ] Download starts in browser and file name is preserved
"""
    },
    {
        "title": "[P1][Frontend] Add user Download button to Upload Details page",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:frontend", "prio:p1"],
        "body": """## Objective
Expose download action in the UI.

## Files to change
- frontend/src/pages/UploadDetails.jsx

## Step-by-step
1. Add Download button
2. Call apiDownload('/uploads/{id}/download')

## Definition of Done
- [ ] User can download own file from details page
"""
    },

    # PROFILING
    {
        "title": "[P0][Backend] Create UploadProfile model",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:backend", "prio:p0"],
        "body": """## Objective
Persist profiling results.

## Files to change
- backend/app/models/upload_profile.py
- backend/app/models/__init__.py

## Step-by-step
1. Create upload_profiles table
2. Link to uploads by upload_id

## Definition of Done
- [ ] UploadProfile table exists
"""
    },
    {
        "title": "[P0][Backend] Implement CSV profiling service",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:backend", "prio:p0"],
        "body": """## Objective
Generate structural information for CSV files.

## Files to change
- backend/app/services/profiling.py

## Step-by-step
1. Count rows
2. Count columns
3. Calculate null ratio by field
4. Return sample preview

## Definition of Done
- [ ] CSV profile returns stable structure
"""
    },
    {
        "title": "[P0][Backend] Implement JSON profiling service",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:backend", "prio:p0"],
        "body": """## Objective
Generate structural information for JSON files.

## Files to change
- backend/app/services/profiling.py

## Step-by-step
1. Handle list and dict JSON
2. Count rows
3. Count columns/keys
4. Return sample preview

## Definition of Done
- [ ] JSON profile returns stable structure
"""
    },
    {
        "title": "[P0][Backend] Implement POST /uploads/{id}/profile",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:backend", "prio:p0"],
        "body": """## Objective
Generate and save profiling data for an upload.

## Files to change
- backend/app/routes/uploads.py

## Step-by-step
1. Protect with JWT
2. Check ownership
3. Download bytes from MinIO
4. Run profile service based on mime type
5. Save in upload_profiles

## Definition of Done
- [ ] Profile can be generated for CSV and JSON uploads
"""
    },
    {
        "title": "[P1][Frontend] Add Generate Profile button to Upload Details",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:frontend", "prio:p1"],
        "body": """## Objective
Let user request profiling from UI.

## Files to change
- frontend/src/pages/UploadDetails.jsx

## Step-by-step
1. Add button
2. Call POST /uploads/{id}/profile
3. Refresh details

## Definition of Done
- [ ] Clicking button generates profile and updates page
"""
    },
    {
        "title": "[P1][Frontend] Render profiling results in Upload Details",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:frontend", "prio:p1"],
        "body": """## Objective
Show rows, columns and sample preview in UI.

## Files to change
- frontend/src/pages/UploadDetails.jsx

## Step-by-step
1. Render profile block if available
2. Show rows_count, columns_count and sample_preview

## Definition of Done
- [ ] Generated profile is visible on screen
"""
    },

    # AUDIT
    {
        "title": "[P0][Backend] Create AuditEvent model",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "prio:p0"],
        "body": """## Objective
Persist audit trail events.

## Files to change
- backend/app/models/audit.py

## Step-by-step
1. Create audit_events table
2. Include action, entity_type, entity_id, actor_user_id, ip, metadata_json

## Definition of Done
- [ ] AuditEvent table exists
"""
    },
    {
        "title": "[P0][Backend] Implement log_event audit helper",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "prio:p0"],
        "body": """## Objective
Centralize event logging.

## Files to change
- backend/app/services/audit.py

## Step-by-step
1. Create log_event(db, action, entity_type, entity_id, actor_user_id, ip, metadata)

## Definition of Done
- [ ] Helper can be reused in auth/upload/admin routes
"""
    },
    {
        "title": "[P0][Backend] Audit signup, login success and login failed",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "prio:p0"],
        "body": """## Objective
Track authentication events.

## Files to change
- backend/app/routes/auth.py

## Step-by-step
1. Log user_signup
2. Log login_success
3. Log login_failed

## Definition of Done
- [ ] All auth events create audit rows
"""
    },
    {
        "title": "[P1][Backend] Audit upload_created, profile_generated and downloads",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "prio:p1"],
        "body": """## Objective
Track important upload lifecycle events.

## Files to change
- backend/app/routes/uploads.py
- backend/app/routes/admin.py

## Step-by-step
1. Log upload_created
2. Log upload_profile_generated
3. Log user and admin downloads

## Definition of Done
- [ ] Upload lifecycle creates audit rows
"""
    },

    # ADMIN
    {
        "title": "[P0][Backend] Add ADMIN_MASTER_KEY config support",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Support secure creation of the first admin.

## Files to change
- backend/app/core/config.py
- docker-compose.yml

## Step-by-step
1. Add ADMIN_MASTER_KEY to settings
2. Add env var in docker-compose

## Definition of Done
- [ ] Backend reads ADMIN_MASTER_KEY successfully
"""
    },
    {
        "title": "[P0][Backend] Implement POST /admin/promote",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "area:security", "prio:p0"],
        "body": """## Objective
Promote a user to admin.

## Files to change
- backend/app/routes/admin.py

## Step-by-step
1. If no admin exists, allow using master_key
2. If admin already exists, require current admin
3. Promote target user by email

## Definition of Done
- [ ] First admin can be created with master key
- [ ] Later promotions require admin
"""
    },
    {
        "title": "[P1][Backend] Implement GET /admin/uploads",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "prio:p1"],
        "body": """## Objective
Allow admins to list all uploads.

## Files to change
- backend/app/routes/admin.py

## Definition of Done
- [ ] Endpoint returns all uploads for admins only
"""
    },
    {
        "title": "[P1][Backend] Implement GET /admin/audit",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "prio:p1"],
        "body": """## Objective
Allow admins to inspect audit trail.

## Files to change
- backend/app/routes/admin.py

## Step-by-step
1. Query latest 200 audit events
2. Protect route with require_admin

## Definition of Done
- [ ] Admin can fetch audit logs
"""
    },
    {
        "title": "[P1][Backend] Implement PATCH /admin/uploads/{id}/status",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:backend", "prio:p1"],
        "body": """## Objective
Allow admins to update upload status.

## Files to change
- backend/app/routes/admin.py

## Step-by-step
1. Accept status enum
2. Update DB record
3. Log audit from->to

## Definition of Done
- [ ] Admin can change upload status
"""
    },
    {
        "title": "[P1][Backend] Implement GET /admin/uploads/{id}/download",
        "milestone": "M3 Download & Profiling",
        "labels": ["type:task", "area:backend", "prio:p1"],
        "body": """## Objective
Allow admin to download any upload.

## Files to change
- backend/app/routes/admin.py

## Definition of Done
- [ ] Admin can download any upload
"""
    },
    {
        "title": "[P1][Frontend] Create AdminUploads page",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:frontend", "prio:p1"],
        "body": """## Objective
Give admin a UI for uploads overview.

## Files to change
- frontend/src/pages/AdminUploads.jsx

## Step-by-step
1. Fetch GET /admin/uploads
2. Show table
3. Add admin download button

## Definition of Done
- [ ] Admin uploads page works
"""
    },
    {
        "title": "[P1][Frontend] Create AdminAudit page",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:frontend", "prio:p1"],
        "body": """## Objective
Give admin a UI for audit trail.

## Files to change
- frontend/src/pages/AdminAudit.jsx

## Step-by-step
1. Fetch GET /admin/audit
2. Show event table

## Definition of Done
- [ ] Admin audit page works
"""
    },
    {
        "title": "[P2][Frontend] Add status update control to AdminUploads page",
        "milestone": "M4 Admin & Audit Trail",
        "labels": ["type:task", "area:frontend", "prio:p2"],
        "body": """## Objective
Allow admin to change upload status from UI.

## Files to change
- frontend/src/pages/AdminUploads.jsx

## Definition of Done
- [ ] Admin can change status from frontend
"""
    },

    # QA / DOCS
    {
        "title": "[P1][Testing] Add backend tests for auth flow",
        "milestone": "M5 QA + Report + Presentation",
        "labels": ["type:task", "area:testing", "area:backend", "prio:p1"],
        "body": """## Objective
Test signup/login behavior.

## Files to change
- backend/tests/test_auth.py

## Definition of Done
- [ ] Tests validate signup and login responses
"""
    },
    {
        "title": "[P1][Testing] Add backend tests for upload validation",
        "milestone": "M5 QA + Report + Presentation",
        "labels": ["type:task", "area:testing", "area:backend", "prio:p1"],
        "body": """## Objective
Test upload type/size validation.

## Files to change
- backend/tests/test_uploads.py

## Definition of Done
- [ ] Tests cover invalid type and size cases
"""
    },
    {
        "title": "[P2][Testing] Create manual QA checklist",
        "milestone": "M5 QA + Report + Presentation",
        "labels": ["type:docs", "area:testing", "prio:p2"],
        "body": """## Objective
Document manual test flow for the team.

## Files to change
- docs/QA_CHECKLIST.md

## Definition of Done
- [ ] Checklist covers signup, login, upload, profile, download, admin
"""
    },
    {
        "title": "[P0][Docs] Create report outline and section skeletons",
        "milestone": "M5 QA + Report + Presentation",
        "labels": ["type:docs", "area:project", "prio:p0"],
        "body": """## Objective
Prepare report structure for final delivery.

## Files to change
- docs/report/00_outline.md
- docs/report/01_introduction.md
- docs/report/02_objectives.md
- docs/report/03_requirements.md
- docs/report/04_architecture.md

## Definition of Done
- [ ] Report skeleton exists with correct sections
"""
    },
    {
        "title": "[P1][Docs] Create ER diagram and data model description",
        "milestone": "M5 QA + Report + Presentation",
        "labels": ["type:docs", "area:project", "prio:p1"],
        "body": """## Objective
Explain database design.

## Files to change
- docs/report/05_data_model.md

## Definition of Done
- [ ] Users, uploads, upload_profiles and audit_events are documented
"""
    },
    {
        "title": "[P1][Docs] Document implementation: endpoints, pages and flow",
        "milestone": "M5 QA + Report + Presentation",
        "labels": ["type:docs", "area:project", "prio:p1"],
        "body": """## Objective
Describe what was built and how it works.

## Files to change
- docs/report/06_implementation.md

## Definition of Done
- [ ] Main endpoints and pages are documented
"""
    },
    {
        "title": "[P1][Docs] Document future work: SIP + Stripe + plan gating",
        "milestone": "M5 QA + Report + Presentation",
        "labels": ["type:docs", "area:project", "prio:p1"],
        "body": """## Objective
Explain the future premium extension without implementing it now.

## Files to change
- docs/report/07_future_work.md

## Definition of Done
- [ ] SIP/Stripe expansion is documented clearly
"""
    },
    {
        "title": "[P2][Docs] Create presentation script for final demo",
        "milestone": "M5 QA + Report + Presentation",
        "labels": ["type:docs", "area:project", "prio:p2"],
        "body": """## Objective
Prepare the team for presentation day.

## Files to change
- docs/PRESENTATION_SCRIPT.md

## Definition of Done
- [ ] Script exists with speaking order and demo sequence
"""
    },
]

def run(cmd):
    print(">>", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr)
    return result

def create_labels():
    for name, color, description in LABELS:
        run([
            "gh", "label", "create", name,
            "--repo", REPO,
            "--color", color,
            "--description", description,
            "--force"
        ])

def create_milestones():
    existing = run(["gh", "api", f"repos/{REPO}/milestones"]).stdout
    existing_titles = set()
    if existing.strip():
        try:
            for m in json.loads(existing):
                existing_titles.add(m["title"])
        except Exception:
            pass

    for m in MILESTONES:
        if m["title"] in existing_titles:
            print(f"Milestone already exists: {m['title']}")
            continue
        run([
            "gh", "api", "-X", "POST",
            f"repos/{REPO}/milestones",
            "-f", f"title={m['title']}",
            "-f", f"description={m['description']}"
        ])

def get_milestone_number(title):
    result = run(["gh", "api", f"repos/{REPO}/milestones?state=all"])
    milestones = json.loads(result.stdout)
    for m in milestones:
        if m["title"] == title:
            return m["number"]
    return None

def issue_exists(title):
    result = run([
        "gh", "issue", "list",
        "--repo", REPO,
        "--state", "all",
        "--search", f'"{title}" in:title',
        "--json", "title"
    ])
    try:
        items = json.loads(result.stdout)
        return any(i["title"] == title for i in items)
    except Exception:
        return False

def create_issues():
    for issue in ISSUES:
        title = issue["title"]
        if issue_exists(title):
            print(f"Issue already exists: {title}")
            continue

        ms_num = get_milestone_number(issue["milestone"])
        cmd = [
            "gh", "issue", "create",
            "--repo", REPO,
            "--title", title,
            "--body", issue["body"],
        ]

        for label in issue["labels"]:
            cmd.extend(["--label", label])

        if ms_num:
            cmd.extend(["--milestone", issue["milestone"]])

        run(cmd)

def main():
    print(f"Bootstrapping GitHub repo: {REPO}")
    create_labels()
    create_milestones()
    create_issues()
    print("Done.")

if __name__ == "__main__":
    main()