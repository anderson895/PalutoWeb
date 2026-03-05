<template>
  <div class="admin-products">

    <!-- Page header -->
    <div class="page-header">
      <div class="page-title">
        <ShoppingBagIcon class="page-title-icon" />
        <h1>Products</h1>
      </div>
      <button class="btn btn-primary add-product-btn" @click="showForm = true">
        <PlusIcon class="btn-icon" />
        Add Product
      </button>
    </div>

    <!-- Modal -->
    <teleport to="body">
      <div class="modal-overlay" v-if="showForm" @click.self="closeForm">
        <div class="modal card">

          <div class="modal-header">
            <div class="modal-title">
              <component :is="editId ? PencilSquareIcon : PlusCircleIcon" class="modal-title-icon" />
              <h3>{{ editId ? 'Edit Product' : 'Add New Product' }}</h3>
            </div>
            <button class="close-btn" @click="closeForm">
              <XMarkIcon class="close-icon" />
            </button>
          </div>

          <div class="modal-body">

            <div class="form-group">
              <label><TagIcon class="label-icon" /> Product Name *</label>
              <input v-model="form.name" placeholder="e.g. Adobo sa Gata" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label><CurrencyDollarIcon class="label-icon" /> Price (₱) *</label>
                <input v-model.number="form.price" type="number" placeholder="0.00" min="0" required />
              </div>
              <div class="form-group">
                <label><FolderIcon class="label-icon" /> Category *</label>
                <select v-model="form.category">
                  <option value="">Select category</option>
                  <option v-for="c in productStore.categories" :key="c.name" :value="c.name">{{ c.name }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label><DocumentTextIcon class="label-icon" /> Description</label>
              <textarea v-model="form.description" placeholder="Describe the dish..." rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label><ClockIcon class="label-icon" /> Prep Time (min)</label>
                <input v-model.number="form.prepTime" type="number" placeholder="15" />
              </div>
              <div class="form-group">
                <label><FireIcon class="label-icon" /> Calories</label>
                <input v-model.number="form.calories" type="number" placeholder="350" />
              </div>
            </div>

            <!-- Image upload -->
            <div class="form-group">
              <label><PhotoIcon class="label-icon" /> Product Image</label>
              <div
                class="image-upload-zone"
                :class="{ uploading }"
                @click="$refs.imageInput.click()"
              >
                <img v-if="form.image" :src="form.image" class="preview-img" />
                <div v-else class="upload-placeholder">
                  <div class="upload-icon-wrap">
                    <ArrowUpTrayIcon v-if="!uploading" class="upload-icon" />
                    <div v-else class="spinner" style="width:24px;height:24px;border-width:2px" />
                  </div>
                  <span>{{ uploading ? 'Uploading...' : 'Click to upload image' }}</span>
                  <span class="upload-hint">Supports JPG, PNG, WebP</span>
                </div>
              </div>
              <input ref="imageInput" type="file" accept="image/*" hidden @change="handleImageUpload" />
            </div>

            <!-- Toggles -->
            <div class="form-row toggles-row">
              <label class="toggle-label">
                <input type="checkbox" v-model="form.available" />
                <CheckCircleIcon class="toggle-icon" />
                <span>Available</span>
              </label>
              <label class="toggle-label">
                <input type="checkbox" v-model="form.isBestseller" />
                <StarIcon class="toggle-icon" />
                <span>Bestseller</span>
              </label>
              <label class="toggle-label">
                <input type="checkbox" v-model="form.isNew" />
                <SparklesIcon class="toggle-icon" />
                <span>New Item</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" @click="closeForm">
              <XMarkIcon class="btn-icon" /> Cancel
            </button>
            <button class="btn btn-primary" @click="handleSave" :disabled="saving || uploading">
              <div class="spinner" v-if="saving" style="width:15px;height:15px;border-width:2px" />
              <CheckIcon v-else class="btn-icon" />
              {{ saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Table -->
    <div v-if="productStore.loading" class="loading-overlay"><div class="spinner"></div></div>

    <div v-else-if="productStore.products.length" class="products-table card">
      <div class="table-header">
        <span>Product</span>
        <span>Category</span>
        <span>Price</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      <div v-for="p in productStore.products" :key="p.id" class="table-row">

        <!-- Product cell -->
        <div class="product-cell">
          <img :src="p.image || 'https://placehold.co/48x48?text=F'" :alt="p.name" />
          <div>
            <div class="product-cell-name">{{ p.name }}</div>
            <div class="product-cell-desc">{{ p.description?.slice(0, 50) }}...</div>
          </div>
        </div>

        <!-- Category -->
        <div class="category-cell">
          <FolderIcon class="category-cell-icon" />
          <span>{{ p.category }}</span>
        </div>

        <!-- Price -->
        <span class="price-cell">₱{{ p.price?.toFixed(2) }}</span>

        <!-- Status -->
        <div class="status-cell" :class="p.available ? 'status-live' : 'status-off'">
          <component :is="p.available ? CheckCircleIcon : XCircleIcon" class="status-icon" />
          {{ p.available ? 'Available' : 'Hidden' }}
        </div>

        <!-- Actions -->
        <div class="action-btns">
          <button class="action-btn edit-btn" @click="editProduct(p)" title="Edit">
            <PencilSquareIcon class="action-icon" />
          </button>
          <button class="action-btn delete-btn" @click="deleteProduct(p.id)" title="Delete">
            <TrashIcon class="action-icon" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <ShoppingBagIcon class="empty-icon" />
      <h3>No products yet</h3>
      <p>Add your first dish to get started!</p>
      <button class="btn btn-primary" @click="showForm = true">
        <PlusIcon class="btn-icon" /> Add First Product
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import { useToastStore } from '@/stores/toast'
import { uploadToCloudinary } from '@/cloudinary'

import {
  ShoppingBagIcon,
  PlusIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  XCircleIcon,
  CheckIcon,
  CheckCircleIcon,
  TagIcon,
  CurrencyDollarIcon,
  FolderIcon,
  DocumentTextIcon,
  ClockIcon,
  FireIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  StarIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'

const productStore = useProductStore()
const toast = useToastStore()

const showForm  = ref(false)
const editId    = ref(null)
const saving    = ref(false)
const uploading = ref(false)

const defaultForm = () => ({
  name: '', price: 0, category: '', description: '',
  image: '', prepTime: 15, calories: null,
  available: true, isBestseller: false, isNew: false,
})
const form = ref(defaultForm())

const closeForm = () => {
  showForm.value = false; editId.value = null; form.value = defaultForm()
}

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
  } catch {
    toast.error('Image upload failed. Check Cloudinary upload preset.')
  } finally { uploading.value = false }
}

const handleSave = async () => {
  if (!form.value.name || !form.value.price) {
    toast.error('Name and price are required'); return
  }
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

onMounted(() => {
  productStore.fetchProducts()
  productStore.fetchCategories()
})
</script>

<style scoped>
.admin-products { max-width: 1200px; }

/* Header */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.page-title  { display: flex; align-items: center; gap: 10px; }
.page-title-icon { width: 26px; height: 26px; color: var(--accent2); }
h1 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; }
.add-product-btn { display: flex; align-items: center; gap: 8px; }
.btn-icon { width: 15px; height: 15px; }

/* Modal overlay */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  z-index: 2000; display: flex; align-items: center; justify-content: center;
  padding: 20px; backdrop-filter: blur(6px);
}
.modal { width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; }

/* Modal header */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-title { display: flex; align-items: center; gap: 10px; }
.modal-title-icon { width: 20px; height: 20px; color: var(--accent2); }
.modal-header h3 { font-size: 17px; font-weight: 700; }
.close-btn {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--text2); cursor: pointer; display: flex;
  align-items: center; justify-content: center; transition: all 0.15s;
}
.close-btn:hover { color: var(--text); border-color: var(--text2); }
.close-icon { width: 14px; height: 14px; }

/* Modal body */
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: end; }

.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--text2);
}
.label-icon { width: 12px; height: 12px; }

/* Image upload */
.image-upload-zone {
  border: 2px dashed var(--border); border-radius: 12px;
  padding: 28px; text-align: center; cursor: pointer;
  transition: all 0.2s; min-height: 130px;
  display: flex; align-items: center; justify-content: center;
}
.image-upload-zone:hover,
.image-upload-zone.uploading {
  border-color: var(--accent); background: rgba(232,70,42,0.04);
}
.preview-img { max-height: 160px; border-radius: 8px; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; gap: 8px; align-items: center; }
.upload-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--bg3); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
}
.upload-icon { width: 22px; height: 22px; color: var(--text2); }
.upload-placeholder span { font-size: 14px; color: var(--text2); font-weight: 500; }
.upload-hint { font-size: 12px; color: var(--text2); opacity: 0.6; }

/* Toggles */
.toggles-row { grid-template-columns: repeat(3, 1fr); }
.toggle-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  padding: 10px 12px; background: var(--bg3);
  border-radius: 10px; border: 1px solid var(--border);
  transition: all 0.15s;
}
.toggle-label:has(input:checked) {
  border-color: rgba(232,70,42,0.3);
  background: rgba(232,70,42,0.06);
  color: var(--accent2);
}
.toggle-label input { accent-color: var(--accent); width: 15px; height: 15px; }
.toggle-icon { width: 15px; height: 15px; }

/* Modal footer */
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 18px 24px; border-top: 1px solid var(--border);
}
.modal-footer .btn { display: flex; align-items: center; gap: 7px; padding: 10px 20px; }

/* Table */
.products-table { overflow: hidden; }
.table-header {
  display: grid; grid-template-columns: 2.5fr 1fr 0.8fr 1fr 0.8fr;
  gap: 12px; padding: 12px 20px; border-bottom: 1px solid var(--border);
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--text2);
}
.table-row {
  display: grid; grid-template-columns: 2.5fr 1fr 0.8fr 1fr 0.8fr;
  gap: 12px; align-items: center; padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s;
}
.table-row:hover { background: var(--bg3); }
.table-row:last-child { border-bottom: none; }

/* Product cell */
.product-cell { display: flex; align-items: center; gap: 12px; min-width: 0; }
.product-cell img { width: 46px; height: 46px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.product-cell-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-cell-desc { font-size: 12px; color: var(--text2); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Category cell */
.category-cell { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text2); }
.category-cell-icon { width: 14px; height: 14px; flex-shrink: 0; }

/* Price */
.price-cell { font-size: 15px; font-weight: 700; }

/* Status */
.status-cell {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600;
  padding: 4px 10px; border-radius: 100px; width: fit-content;
}
.status-icon { width: 13px; height: 13px; }
.status-live { background: rgba(46,204,113,0.1); color: #2ecc71; }
.status-off  { background: rgba(255,255,255,0.06); color: var(--text2); }

/* Action buttons */
.action-btns { display: flex; gap: 6px; }
.action-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--border); background: var(--bg3);
  color: var(--text2); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.action-icon { width: 15px; height: 15px; }
.edit-btn:hover   { border-color: #6c6cff; color: #6c6cff; background: rgba(108,108,255,0.08); }
.delete-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(232,70,42,0.08); }

/* Empty state */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 80px 40px; text-align: center;
}
.empty-icon { width: 48px; height: 48px; color: var(--border); }
.empty-state h3 { font-size: 20px; font-weight: 700; }
.empty-state p { color: var(--text2); margin-bottom: 8px; }
.empty-state .btn { display: flex; align-items: center; gap: 8px; }

@media (max-width: 900px) {
  .table-header,
  .table-row { grid-template-columns: 1.5fr 0.8fr 0.8fr auto; }
  .table-header > :nth-child(4),
  .table-row   > :nth-child(4) { display: none; }
}
</style>