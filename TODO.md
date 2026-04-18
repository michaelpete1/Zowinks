# Product Image Upload Fix - Approved Plan
Status: ✅ Approved by user

## Steps to Complete:

### 1. [TODO] Edit lib/zowkins-api.ts
- ✅ Analyzed files (zowkins-api.ts, admin/products/page.tsx)
- Change `formData.set("image", file)` → `formData.set("file", file)` in:
  * createAdminProduct
  * updateAdminProduct

### 2. [TODO] Test fix
- `npm run dev`
- Admin → Products → Create product with image
- Verify Network: payload has `data` + `file` fields
- Confirm response: `image: {url, key}` populated (not null)

### 3. [DONE] Complete
- Remove this file or mark completed
