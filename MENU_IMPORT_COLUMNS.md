# Menu Import - Required Excel/CSV Columns

## 📋 Required Columns (Case-Sensitive)

Your Excel or CSV file **MUST** contain these exact column names (case-sensitive):

### 1. `category_name` (Required)
- **Type**: Text
- **Description**: The category name for the menu item
- **Example**: "Beverages", "Food", "Desserts"
- **Behavior**: 
  - If category doesn't exist, it will be automatically created
  - Categories are created with `is_active = true` and `display_order = 0`

### 2. `item_name` (Required)
- **Type**: Text
- **Description**: The name of the menu item/product
- **Example**: "Coffee", "Pizza", "Ice Cream"
- **Validation**: Cannot be empty or whitespace

### 3. `price` (Required)
- **Type**: Number (Decimal)
- **Description**: The selling price of the menu item
- **Example**: `50.00`, `200.50`, `150`
- **Validation**: 
  - Must be numeric
  - Must be greater than 0
  - Decimal values are supported

### 4. `tax_group_code` (Required)
- **Type**: Text
- **Description**: The code of the tax group (must exist and be active)
- **Example**: "GST_5", "GST_12", "GST_18", "GST_28"
- **Validation**: 
  - Must match an existing tax group code in the system
  - Tax group must be active
  - Case-sensitive match

### 5. `is_active` (Optional)
- **Type**: Boolean/Text
- **Description**: Whether the menu item is active (visible on menu)
- **Example**: `true`, `false`, `1`, `0`, `yes`, `no`
- **Default**: `true` (if not provided)
- **Accepted values**: 
  - `true`, `1`, `yes`, `y` → Active
  - `false`, `0`, `no`, `n` → Inactive

---

## 📝 Example CSV Format

```csv
category_name,item_name,price,tax_group_code,is_active
Beverages,Coffee,50.00,GST_5,true
Beverages,Tea,30.00,GST_5,true
Beverages,Cold Coffee,80.00,GST_12,true
Food,Pizza,200.00,GST_12,true
Food,Burger,150.00,GST_12,true
Food,Pasta,180.00,GST_12,true
Desserts,Ice Cream,60.00,GST_5,true
Desserts,Cake,120.00,GST_12,true
```

## 📝 Example Excel Format

| category_name | item_name | price | tax_group_code | is_active |
|--------------|-----------|-------|---------------|-----------|
| Beverages    | Coffee    | 50.00 | GST_5         | true      |
| Beverages    | Tea       | 30.00 | GST_5         | true      |
| Food         | Pizza     | 200.00| GST_12        | true      |
| Food         | Burger    | 150.00| GST_12        | true      |

---

## ⚠️ Important Notes

1. **Column Names Must Match Exactly**: The column names are case-sensitive. Use exactly:
   - `category_name` (not `Category Name` or `categoryName`)
   - `item_name` (not `Item Name` or `itemName`)
   - `price` (not `Price` or `PRICE`)
   - `tax_group_code` (not `Tax Group Code` or `taxGroupCode`)
   - `is_active` (not `Is Active` or `isActive`)

2. **Tax Group Codes**: 
   - Must exist in your system
   - Must be active
   - Common codes: `GST_5`, `GST_12`, `GST_18`, `GST_28`
   - Check your tax groups in the system to see available codes

3. **Validation Rules**:
   - **All rows are validated before any inserts**
   - If ANY row has an error, the entire import is aborted
   - No partial imports - it's all or nothing

4. **Error Messages**: 
   - Row numbers in error messages refer to Excel row numbers (starting from row 2, since row 1 is headers)
   - Example: "Row 4: invalid tax_group_code GST_12" means the 4th data row (excluding header)

5. **Category Auto-Creation**:
   - Categories are created automatically if they don't exist
   - All new categories are created as active
   - If a category already exists, it's reused

---

## ✅ Validation Checklist

Before uploading, ensure:
- [ ] File is CSV (.csv) or Excel (.xlsx) format
- [ ] All required columns are present with exact names
- [ ] All `item_name` values are non-empty
- [ ] All `price` values are numeric and > 0
- [ ] All `category_name` values are non-empty
- [ ] All `tax_group_code` values exist in your system and are active
- [ ] No empty rows (they will be skipped)

---

## 🚫 Common Errors

1. **"Missing required column: category_name"**
   - Fix: Add the column with exact name `category_name`

2. **"Row X: invalid tax_group_code 'GST_12'"**
   - Fix: Check that the tax group code exists and is active in your system

3. **"Row X: price must be > 0"**
   - Fix: Ensure price is a positive number

4. **"Row X: missing item_name"**
   - Fix: Ensure item_name column has a value for that row

---

## 📥 Download Template

A sample template file is available at: `/menu-import-template.csv`

You can download it from the Import Menu modal in the application.

