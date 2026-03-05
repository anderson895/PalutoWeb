<template>
  <div class="admin-products">
    <div class="page-header">
      <h1>Products</h1>
      <button class="btn btn-primary" @click="showForm = true">+ Add Product</button>
    </div>

    <!-- Product Form Modal -->
    <teleport to="body">
      <div class="modal-overlay" v-if="showForm" @click.self="closeForm">
        <div class="modal card">
          <div class="modal-header">
            <h3>{{ editId ? 'Edit Product' : 'Add New Product' }}</h3>
            <button class="drawer-close" @click="closeForm">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Product Name *</label>
              <input v-model="form.name" placeholder="e.g. Adobo sa Gata" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Price (₱) *</label>
                <input v-model.number="form.price" type="number" placeholder="0.00" min="0" required />
              </div>
              <div class="form-group">
                <label>Category *</label>
                <select v-model="form.category">
                  <option value="">Select category</option>
                  <option v-for="c in productStore.categories" :key="c.name" :value="c.name">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="form.description" placeholder="Describe the dish..." rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Prep Time (min)</label>
                <input v-model.number="form.prepTime" type="number" placeholder="15" />
              </div>
              <div class="form-group">
                <label>Calories</label>
                <input v-model.number="form.calories" type="number" placeholder="350" />
              </div>
            </div>
            <!-- Image upload -->
            <div class="form-group">
              <label>Product Image</label>
              <div class="image-upload-zone" :class="{ uploading: uploading }" @click="$refs.imageInput.click()">
                <img v-if="form.image" :src="form.image" class="preview-img" />
                <div v-else class="upload-placeholder">
                  <span>{{ uploading ? '⏳ Uploading...' : '📷 Click to upload image' }}</span>
                  <span style="font-size:12px;color:var(--text2)">Supports JPG, PNG, WebP</span>
                </div>
              </div>
              <input ref="imageInput" type="file" accept="image/*" hidden @change="handleImageUpload" />
            </div>
            <div class="form-row">
              <label class="toggle-label">
                <input type="checkbox" v-model="form.available" />
                <span>Available</span>
              </label>
              <label class="toggle-label">
                <input type="checkbox" v-model="form.isBestseller" />
                <span>⭐ Bestseller</span>
              </label>
              <label class="toggle-label">
                <input type="checkbox" v-model="form.isNew" />
                <span>🆕 New</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="closeForm">Cancel</button>
            <button class="btn btn-primary" @click="handleSave" :disabled="saving || uploading">
              {{ saving ? 'Saving...' : (editId ? 'Update Product' : 'Add Product') }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Products Table -->
    <div v-if="productStore.loading" class="loading-overlay"><div class="spinner"></div></div>
    <div v-else-if="productStore.products.length" class="products-table card">
      <div class="table-header">
        <span>Product</span><span>Category</span><span>Price</span><span>Status</span><span>Actions</span>
      </div>
      <div v-for="p in productStore.products" :key="p.id" class="table-row">
        <div class="product-cell">
          <img :src="p.image || 'https://via.placeholder.com/48?text=F'" :alt="p.name" />
          <div>
            <div class="product-cell-name">{{ p.name }}</div>
            <div class="product-cell-desc">{{ p.description?.slice(0,50) }}...</div>
          </div>
        </div>
        <span class="category-pill">{{ p.category }}</span>
        <span class="price-cell">₱{{ p.price?.toFixed(2) }}</span>
        <span class="tag" :class="p.available ? 'tag-green' : 'tag-gray'">{{ p.available ? 'Available' : 'Hidden' }}</span>
        <div class="action-btns">
          <button class="btn btn-ghost action-btn" @click="editProduct(p)" title="Edit">✏️</button>
          <button class="btn btn-ghost action-btn" @click="deleteProduct(p.id)" title="Delete">🗑️</button>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>No products yet. Add your first dish!</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import { useToastStore } from '@/stores/toast'
import { uploadToCloudinary } from '@/cloudinary'

const productStore = useProductStore()
const toast = useToastStore()

const showForm = ref(false)
const editId = ref(null)
const saving = ref(false)
const uploading = ref(false)

const defaultForm = () => ({ name: '', price: 0, category: '', description: '', image: '', prepTime: 15, calories: null, available: true, isBestseller: false, isNew: false })
const form = ref(defaultForm())

const closeForm = () => { showForm.value = false; editId.value = null; form.value = defaultForm() }

const editProduct = (p) => {
  editId.value = p.id
  form.value = { ...defaultForm(), ...p }
  showForm.value = true
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  try {
    form.value.image = await uploadToCloudinary(file)
    toast.success('Image uploaded!')
  } catch { toast.error('Image upload failed. Check Cloudinary upload preset.') }
  finally { uploading.value = false }
}

const handleSave = async () => {
  if (!form.value.name || !form.value.price) { toast.error('Name and price are required'); return }
  saving.value = true
  try {
    if (editId.value) {
      await productStore.updateProduct(editId.value, form.value)
      toast.success('Product updated!')
    } else {
      await productStore.addProduct(form.value)
      toast.success('Product added!')
    }
    closeForm()
  } catch { toast.error('Failed to save product') }
  finally { saving.value = false }
}

const deleteProduct = async (id) => {
  if (!confirm('Delete this product?')) return
  try {
    await productStore.deleteProduct(id)
    toast.success('Product deleted')
  } catch { toast.error('Failed to delete') }
}

onMounted(() => { productStore.fetchProducts(); productStore.fetchCategories() })
</script>
<style scoped>
.admin-products { max-width: 1200px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
h1 { font-family: 'Playfair Display', serif; font-size: 32px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(6px); }
.modal { width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-header h3 { font-size: 18px; font-weight: 700; }
.drawer-close { background: var(--bg3); border: 1px solid var(--border); color: var(--text2); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 12px; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: end; }
.image-upload-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; min-height: 120px; display: flex; align-items: center; justify-content: center; }
.image-upload-zone:hover, .image-upload-zone.uploading { border-color: var(--accent); background: rgba(232,70,42,0.04); }
.preview-img { max-height: 160px; border-radius: 8px; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; gap: 6px; align-items: center; color: var(--text2); }
.toggle-label { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px 12px; background: var(--bg3); border-radius: 8px; border: 1px solid var(--border); }
.toggle-label input { accent-color: var(--accent); width: 16px; height: 16px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid var(--border); }
.products-table { overflow: hidden; }
.table-header { display: grid; grid-template-columns: 2.5fr 1fr 0.8fr 1fr 0.8fr; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text2); }
.table-row { display: grid; grid-template-columns: 2.5fr 1fr 0.8fr 1fr 0.8fr; gap: 12px; align-items: center; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s; }
.table-row:hover { background: var(--bg3); }
.product-cell { display: flex; align-items: center; gap: 12px; }
.product-cell img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.product-cell-name { font-size: 14px; font-weight: 600; }
.product-cell-desc { font-size: 12px; color: var(--text2); margin-top: 2px; }
.category-pill { font-size: 12px; color: var(--text2); }
.price-cell { font-size: 15px; font-weight: 700; }
.action-btns { display: flex; gap: 4px; }
.action-btn { width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 15px; }
.empty-state { text-align: center; padding: 60px; color: var(--text2); }
@media (max-width: 900px) { .table-header, .table-row { grid-template-columns: 1.5fr 0.8fr 0.8fr auto; } .table-header > :nth-child(4), .table-row > :nth-child(4) { display: none; } }
</style>
