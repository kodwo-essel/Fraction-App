## 🚀 Prompt for Antigravity

Build a production-ready **Expo (React Native) app** using **`expo-sqlite`** for local data storage only (no backend, no login, no cloud sync).

---

# 🧠 App Concept

A **Minimalist Black & White Financial Allocation App** that automatically splits income into user-defined percentage categories that must always sum to **100%**.

The system supports:

* Custom main categories (user-created)
* Custom subcategories
* Protected categories
* Dynamic rule versioning (changes affect future entries only)

---

# 🎨 Design Requirements

### Theme

* Strict **Black & White minimalist design**
* No colors except grayscale
* No gradients
* No shadows (or extremely subtle)
* Clean spacing
* Large readable typography
* Thin separators
* Simple icons (monochrome)

### UI Interaction

* Use `Pressable` ONLY (do NOT use `TouchableOpacity`)
* Subtle pressed feedback:

  * Slight scale down (0.97)
  * Background light gray flash
* Smooth micro-animations (Reanimated optional)

---

# 🗂 Architecture Overview

## Storage

Use `expo-sqlite`.

Design normalized tables.

---

# 🗃 Database Schema

### 1. categories

```
id (string UUID)
name (string)
percentage (real)
type (enum: main | sub)
parent_id (nullable string)
is_protected (boolean)  // true = cannot log expenses
created_at
updated_at
```

### 2. transactions

```
id (string UUID)
type (enum: income | expense)
amount (real)
category_id (string)
created_at
rule_snapshot (JSON string)
```

### 3. rule_versions

```
id (string UUID)
created_at
config_snapshot (JSON)
```

---

# ⚙️ Core Business Logic

## 1️⃣ Settings Screen (Dynamic Category Builder)

Users can:

* Create main categories
* Assign percentage to each
* Must total exactly **100%**
* Live validation
* Show:

  * Remaining percentage
  * Error if >100%
  * Disabled Save button if != 100%

### Default Template (example only — user can edit/delete)

Main Categories:

* Tithes (10%) → protected
* Wealth (30%) → protected
* Core (25%)
* Lifestyle (20%)
* Personal (15%)

Wealth Subcategories:

* Emergency (50%)
* Savings (33.33%)
* Investment (16.67%)

But these are NOT fixed. Users can:

* Rename
* Delete
* Add new ones
* Change percentages

---

## 🔒 Protected Categories

* Protected categories cannot log expenses.
* They can receive income allocation only.
* Toggle protection in settings.

---

## 2️⃣ Income Disburser Screen

Flow:

1. User inputs income amount
2. App calculates allocation using current rule version
3. Preview breakdown
4. User confirms → save

Important:

* When saving income, store a snapshot of percentages in `rule_snapshot`
* Future rule changes do NOT modify past records

Allocation Logic:

* Income splits into main categories based on percentage
* If category has subcategories:

  * Split that portion again using sub-percentages

Example:
Income: $1000
Wealth = 30% → $300
Emergency = 50% of 300 → $150

---

## 3️⃣ Expense Tracker

Users can log expenses:

* Only to NON-protected categories
* If category has subcategories, must choose subcategory
* Deduct from that category’s balance

No overdraft restriction unless optionally enabled.

---

## 4️⃣ Dashboard Screen

Display:

### Summary Cards

* Total Balance
* Gross Income
* Total Expenses
* Wealth Total
* Category breakdown

### Charts (Black & White only)

* Pie chart for allocation
* Bar chart for expenses per category

Use minimal chart styling:

* Grayscale shades only
* No legends with colors — use labels

---

## 5️⃣ History Screen

List of transactions:

* Income (with breakdown)
* Expenses
* Tap to expand details
* Show rule snapshot breakdown

Grouped by date.

---

# 🔄 Dynamic Rules System

When user edits category percentages:

* Validate total = 100%
* Save new rule version
* Future income uses new rule
* Past entries remain unchanged

Do NOT retroactively recalculate.

---

# 🧮 Validation Rules

* Main categories must sum to 100%
* Subcategories must sum to 100% of parent
* Cannot delete category with existing transactions (unless archived)
* Cannot log expense to protected category
* Prevent duplicate names under same parent

---

# 🧩 Flexibility Requirement

This is IMPORTANT:

The system must NOT hardcode:

* Core
* Lifestyle
* Personal
* Wealth
* Tithes

Those were example user categories.

Instead:

* All categories are user-generated.
* Percentages must sum to 100%.
* Any category can have nested subcategories.
* Any category can be marked protected.

---

# 🧱 Technical Requirements

* Expo Router
* Functional components
* Hooks only
* Context API for global state
* SQLite abstraction layer
* Separate:

  * DB layer
  * Business logic layer
  * UI layer

---

# 📱 Screens Required

1. Dashboard
2. Disburser
3. Add Expense
4. Settings
5. History

Bottom tab navigation.

---

# 🧼 UI Components

Reusable:

* PercentageInput
* CategoryRow
* BalanceCard
* TransactionItem
* AllocationPreviewCard
* B&WChartWrapper

All using Pressable.

---

# 🚫 Do NOT Include

* Authentication
* Cloud sync
* External APIs
* Firebase
* Styled-components
* TouchableOpacity

---

# 🏁 Performance

* Use memoization where appropriate
* Batch SQLite writes
* Avoid unnecessary re-renders
* Use FlatList for large lists

---

# 📦 Deliverables

Generate:

1. Folder structure
2. SQLite setup
3. DB initialization logic
4. Context provider
5. All screens
6. Core allocation algorithm
7. Validation helpers
8. Example seed template
9. Clean minimal styles

---

# 🧠 Bonus (Optional Enhancements)

* Archive category instead of delete
* Monthly summary view
* Rule version history viewer
* Export to CSV

---

The result should feel like:

> A calm, intelligent, minimalist financial control system
> Built for clarity and discipline
> Fully customizable
> Logic-driven
> Black & white only

---

