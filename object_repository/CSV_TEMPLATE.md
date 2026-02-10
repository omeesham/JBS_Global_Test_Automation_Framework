# CSV Element Repository Template

## Purpose
This template provides a standardized structure for creating CSV locator files in the `object_repository/` directory. Following this template ensures consistency, prevents duplicate locators, and makes elements easy to find for both humans and AI agents.

---

## File Naming Convention

**Format**: `{PageName}_Elements.csv`

**Examples**:
- `Login_Elements.csv` - Login page locators
- `Home_Elements.csv` - Home/Dashboard page locators
- `Contacts_Elements.csv` - Contacts management page locators
- `UserProfile_Elements.csv` - User profile page locators
- `Notifications_Popup_Elements.csv` - Notifications dropdown popup locators

**Rules**:
- Use PascalCase for page names (capitalize each word)
- No spaces in filename (use underscores)
- Always end with `_Elements.csv`
- For popups/modals: Include `_Popup` or `_Modal` in name to distinguish from main pages

---

## CSV File Structure Template

```csv
# {PageName}_Elements.csv - {Brief description} ({URL path})
# Last Updated: {YYYY-MM-DD}

Element Name,Locator

# === {Section Name} ===
# {element} - {page/popup location}, {what it does/type if not obvious}
{elementName},{locator}
```

**Example**:
```csv
# Login_Elements.csv - Login page and authentication flow locators (/login)
# Last Updated: 2026-02-07

Element Name,Locator

# === Main Login Page (/login) ===
# Username input - main login page, required email/username field
txtUsername,input[formcontrolname='userName']
# Password input - main login page, masked text field
txtPassword,//input[@name='password']
# Login button - main login page, submits credentials, redirects to /home or shows MFA popup if enabled
btnLogin,//input[@class='loginFormBtn']

# === Error Messages (shown after failed login) ===
# Error title - main login page, appears in .loginErrorData after invalid credentials
lblLoginUnsuccessful,//div[@class='loginErrorData']//p[1]
```

---

## Comment Structure for Elements

### **Rule: 1 Comment Per Element**

**Format**: `# {element description} - {location}, {what it does/key behavior}`

**Include**:
- Page or popup where element appears
- Element type (if not obvious from name prefix)
- Key action or purpose
- Related behavior (redirects, triggers popups, conditional visibility)

**Keep Concise**:
- ✅ 1 line per element (max 120 characters)
- ✅ Focus on location + purpose
- ❌ Don't repeat obvious information
- ❌ Don't add multi-line descriptions

---

## Section Headers

**Format**: `# === {Section Name} ===`

**Keep Simple**:
- ✅ Brief section name (e.g., "Main Login Page", "Error Messages", "MFA Popup")
- ✅ Include page/popup context in section name if helpful
- ❌ Don't add multi-line section descriptions
- ❌ Don't use separator lines (===...===)

**Examples**:
```csv
# === Main Form (/contacts page) ===
# === Top Navigation (all pages) ===
# === Error Messages (shown after validation failure) ===
# === MFA Popup (appears if user has 2FA enabled) ===
```

---

## Preventing Duplicate Locators

### Strategy 1: Include Page/Popup in Comment

**Bad** (ambiguous):
```csv
# Submit button
btnSubmit,button[type='submit']
```

**Good** (clear location):
```csv
# Submit button - contact form (/contacts page), creates new contact
btnContactFormSubmit,button[type='submit']
# Submit button - profile form (/profile page), saves profile changes
btnProfileFormSubmit,button[type='submit']
```

### Strategy 2: Descriptive Element Names

**Naming Convention**: `{type}{Component}{Purpose}`

**Examples**:
- `btnLoginSubmit` - Submit button on login form
- `btnContactCreate` - Create button on contacts page
- `txtProfileEmail` - Email field on profile page
- `lnkNavDashboard` - Dashboard link in main nav
- `lnkSidebarReports` - Reports link in sidebar

---

## Example: Complete Contacts Page CSV

```csv
# Contacts_Elements.csv - Contact management page locators (/contacts)
# Last Updated: 2026-02-07

Element Name,Locator

# === Contacts List View (/contacts page) ===
# Search input - contacts page, filters table by name/email as you type
txtContactsSearch,input[placeholder*='Search contacts']
# Create button - contacts page (top-right), opens create contact modal
btnCreateContact,button:has-text("Create Contact")
# Contacts table - contacts page, main data grid with Name/Email/Phone columns
tblContacts,table.contacts-table
# Contact row - contacts page, repeating table row (use with :has-text() to find specific contact)
rowContact,tr.contact-row
# Edit button - inside contact row, opens edit modal for this contact
btnEditContact,button.edit-contact
# Delete button - inside contact row, opens delete confirmation popup
btnDeleteContact,button.delete-contact

# === Pagination (bottom of table) ===
# Previous button - disabled when on page 1
btnPaginationPrev,button.pagination-prev
# Next button - disabled when on last page
btnPaginationNext,button.pagination-next
```

---

## Special Cases

### Dynamic/Repeating Elements
```csv
# User list item - users page, repeating element (use with :has-text() or nth-of-type())
lstUserItem,.user-list-item
```

### Global Components (appear on multiple pages)
```csv
# Breadcrumb nav - all authenticated pages (top of content), shows page hierarchy
navBreadcrumb,.breadcrumb-navigation
```

### Conditional Elements (state-dependent)
```csv
# Premium badge - user profile page, only shows for premium accounts
badgePremium,.premium-user-badge
```

### Elements with Multiple States
```csv
# Notification bell - all authenticated pages (top nav), red when notifications exist, gray when none
btnNotifications,button.notifications-bell
```

---

## Popup/Modal Elements

### Option 1: Separate CSV File (10+ elements)
Create `{PopupName}_Popup_Elements.csv`:

```csv
# ConfirmDelete_Popup_Elements.csv - Delete confirmation dialog
# Last Updated: 2026-02-07

Element Name,Locator

# === Delete Confirmation Popup (triggered from various pages) ===
# Message text - confirmation popup, warns "Are you sure you want to delete..."
lblConfirmDeleteMessage,.confirm-delete-message
# Confirm button - confirmation popup, executes deletion and closes popup
btnConfirmDelete,button.confirm-delete
# Cancel button - confirmation popup, closes popup without deleting
btnConfirmCancel,button.cancel-delete
```

### Option 2: Include in Page CSV (1-5 elements)
```csv
# === Delete Confirmation Popup (triggered by btnDeleteContact) ===
# Message - delete popup, confirmation text
lblDeleteContactMessage,.delete-contact-confirm-message
# Confirm button - delete popup, deletes contact
btnConfirmDeleteContact,button.confirm-delete-contact
```
```

---

## Checklist for Creating New CSV Files

**Before Creating**:
- Check if similar CSV exists
- Identify all page sections
- Note triggered popups/modals

**During Creation**:
- Use format: `{PageName}_Elements.csv`
- Add 2-line header (description + last updated)
- Use simple section headers: `# === Name ===`
- 1 comment per element: `# {element} - {location}, {purpose}`
- Descriptive element names: `btnLoginSubmit` not `btn1`

**After Creation**:
- Verify no duplicate locators
- Test 3+ locators in actual page
- Update page object to use CSV

---

## Quick Reference: Element Name Prefixes

| Prefix | Element Type | Example |
|--------|--------------|---------|
| `txt` | Text input field | `txtUsername`, `txtEmail` |
| `btn` | Button | `btnSubmit`, `btnCancel` |
| `lnk` | Link/Anchor | `lnkForgotPassword`, `lnkProfile` |
| `chk` | Checkbox | `chkRememberMe`, `chkAgreeToTerms` |
| `rdo` | Radio button | `rdoGenderMale`, `rdoPaymentCard` |
| `ddl` | Dropdown/Select | `ddlCountry`, `ddlCategory` |
| `lbl` | Label/Text display | `lblErrorMessage`, `lblWelcome` |
| `div` | Div container | `divMainContent`, `divSidebar` |
| `nav` | Navigation element | `navMainMenu`, `navBreadcrumb` |
| `tbl` | Table | `tblUsers`, `tblOrders` |
| `row` | Table row | `rowUser`, `rowProduct` |
| `col` | Table column | `colEmail`, `colActions` |
| `img` | Image | `imgLogo`, `imgUserAvatar` |
| `icon` | Icon element | `iconSearch`, `iconNotification` |
| `popup` | Popup/Modal | `popupConfirm`, `popupSettings` |
| `modal` | Modal dialog | `modalCreateUser`, `modalEditProfile` |
| `lst` | List | `lstNotifications`, `lstResults` |
| `msg` | Message/Alert | `msgSuccess`, `msgError` |
| `badge` | Badge/Tag | `badgePremium`, `badgeNew` |
| `card` | Card component | `cardUserInfo`, `cardStats` |
| `widget` | Widget/Component | `widgetWeather`, `widgetCalendar` |
| `span` | Span element | `spanCount`, `spanStatus` |

---

## Version History

- **2026-02-07**: Template created with optimized 1-comment-per-element format

---

## Need Help?

- Check existing CSVs: Login_Elements.csv, Home_Elements.csv
- See copilot-instructions.md for framework patterns
- **Principle**: If you can't find an element in 10 seconds, add more context to the comment
