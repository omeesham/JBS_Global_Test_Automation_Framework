# EspoCRM Test Automation Requirements

> **Purpose**: Static knowledge base describing the EspoCRM website features, structure, and behaviors. Agents READ this to understand the website before exploring, planning, and generating tests.
>
> **This file is NOT modified by agents.** Only the team updates this document. Agents record element discoveries in `specs_planning/test-cases/*.md` files instead.

**Target Application**: [EspoCRM Demo](https://demo.us.espocrm.com/)

---

## Login Module

The website has a standard login page at the root URL. It contains:
- A username field and a password field (both required)
- A login button that submits the form
- A "Forgot Password?" link below the form
- The login form loads via JavaScript (SPA) — the page needs the form to render before interaction

After successful login, the user is redirected to the Dashboard (URL contains `#Home`).

Invalid credentials produce an error notification. Empty fields show inline validation messages.

### Known Behaviors
- The login form container has a recognizable structure that can be waited on
- Password field masks characters
- Login is session-based — once authenticated, refreshing the page keeps the user logged in

---

## Dashboard Module

After login, the main dashboard page loads. It contains:
- A top navigation bar with tabs for different modules (Accounts, Contacts, Leads, Opportunities, etc.)
- A user menu dropdown in the top-right corner with logout and profile options
- A main content area where module views render
- A sidebar/quick-access area

### Navigation
- Module tabs in the navbar navigate to list views (e.g., clicking "Contacts" loads the contacts list)
- The URL hash changes to reflect the current module (e.g., `#Contact`, `#Account`, `#Lead`)

### User Menu
- Clicking the user menu dropdown reveals options including Logout
- Clicking Logout redirects back to the login page and destroys the session

---

## Reports / Export Module

EspoCRM supports exporting data from list views. This is the core of the POC demo requirement.

### Export Flow
- Navigate to any list view (Contacts, Accounts, Leads, etc.)
- List views have an Actions dropdown that includes an "Export" option
- Export supports CSV and XLSX formats
- After triggering export, a file downloads to the browser's download directory

### Date Filtering
- List views support filtering by date ranges and other criteria
- Filters are applied before export to narrow down the data

---

## POC Demo Requirements

### Client Requirement (Verbatim)
> "Login into a website using username and password, go to a specific page within that website, select the date range and then download the report, once the report is downloaded upload it to a SharePoint / ADLS location."

### Breakdown
1. **Login** — Authenticate with valid credentials (from `.env` config)
2. **Navigate** — Go to a specific module page (e.g., Contacts list view)
3. **Filter/Select** — Apply date range or other filters as needed
4. **Download** — Trigger export/download from the list view Actions menu
5. **Validate** — Confirm downloaded file exists and has expected structure (columns, rows)
6. **Upload** — Upload the downloaded file to SharePoint or ADLS (post-POC scope, Jenkins artifacts for now)

### Test Data
- Login credentials: From `.env.{environment}` (ADMIN_USERNAME, ADMIN_PASSWORD)
- Download directory: `downloads/` (collected as Jenkins artifacts)
- SharePoint config: Commented out in `.env.example` (post-POC)

---

## Modules Available in EspoCRM

These are the main modules visible in the navigation bar. The Planner agent can explore any of these when asked:

- **Accounts** — Company/organization records
- **Contacts** — Individual person records linked to accounts
- **Leads** — Potential customers not yet converted
- **Opportunities** — Sales deals with stages and amounts
- **Cases** — Support tickets / customer issues
- **Emails** — Integrated email functionality
- **Calendar** — Events and scheduling
- **Tasks** — To-do items and assignments
- **Meetings** — Scheduled meetings
- **Calls** — Logged phone calls
- **Documents** — File storage and management

Each module typically has: list view, detail view, create form, edit form, and related panels.

---

## Framework Requirements Location

For **framework-level requirements** (architecture, patterns, CI/CD), see:
- [.github/FRAMEWORK_HISTORY.md](.github/FRAMEWORK_HISTORY.md) — Archived requirements REQ-001 to REQ-011
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — Current patterns and architecture
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Technical documentation
