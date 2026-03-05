<template>
  <div class="admin-categories">

    <!-- Header -->
    <div class="page-header">
      <div class="page-title">
        <FolderIcon class="page-title-icon" />
        <h1>Categories</h1>
      </div>
      <span class="page-count">{{ productStore.categories.length }} total</span>
    </div>

    <div class="categories-layout">

      <!-- Add / Edit form -->
      <div class="add-category card">
        <div class="card-header">
          <component :is="editId ? PencilSquareIcon : PlusCircleIcon" class="card-header-icon" />
          <h3>{{ editId ? 'Edit Category' : 'Add New Category' }}</h3>
          <button v-if="editId" class="cancel-edit-btn" @click="cancelEdit" title="Cancel edit">
            <XMarkIcon class="cancel-icon" />
          </button>
        </div>

        <div class="form-group">
          <label><TagIcon class="label-icon" /> Category Name</label>
          <input v-model="newName" placeholder="e.g. Rice Meals" />
        </div>

        <div class="form-group">
          <label><SwatchIcon class="label-icon" /> Choose Icon</label>
          <div class="icon-picker">
            <button
              v-for="opt in iconOptions"
              :key="opt.key"
              class="icon-opt"
              :class="{ selected: selectedIcon === opt.key }"
              @click="selectedIcon = opt.key"
              :title="opt.label"
            >
              <component :is="opt.icon" class="icon-opt-svg" />
            </button>
          </div>
          <div class="selected-preview" v-if="selectedIcon">
            <component :is="selectedIconComponent" class="preview-icon" />
            <span>{{ iconOptions.find(o => o.key === selectedIcon)?.label }}</span>
          </div>
        </div>

        <button
          class="btn btn-primary add-btn"
          @click="handleSave"
          :disabled="saving || !newName || !selectedIcon"
        >
          <div class="spinner" v-if="saving" style="width:16px;height:16px;border-width:2px" />
          <component :is="editId ? CheckIcon : PlusIcon" v-else class="btn-icon" />
          {{ saving ? 'Saving...' : editId ? 'Update Category' : 'Add Category' }}
        </button>
      </div>

      <!-- Categories list -->
      <div class="categories-list card">
        <div class="card-header">
          <Squares2X2Icon class="card-header-icon" />
          <h3>All Categories</h3>
          <span class="count-badge">{{ productStore.categories.length }}</span>
        </div>

        <div v-if="productStore.categories.length" class="cat-grid">
          <div
            v-for="cat in productStore.categories"
            :key="cat.id"
            class="cat-item"
            :class="{ 'cat-item-editing': editId === cat.id }"
          >
            <div class="cat-icon-wrap">
              <component :is="getIcon(cat.emoji)" class="cat-icon" />
            </div>
            <span class="cat-name">{{ cat.name }}</span>

            <!-- Action buttons -->
            <div class="cat-actions">
              <button
                class="cat-btn cat-edit-btn"
                @click="startEdit(cat)"
                title="Edit"
              >
                <PencilSquareIcon class="cat-btn-icon" />
              </button>
              <button
                class="cat-btn cat-delete-btn"
                @click="handleDelete(cat.id, cat.name)"
                title="Delete"
              >
                <TrashIcon class="cat-btn-icon" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <FolderOpenIcon class="empty-icon" />
          <p>No categories yet</p>
          <span>Add your first category to get started</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import { useToastStore } from '@/stores/toast'

import {
  FolderIcon,
  FolderOpenIcon,
  PlusCircleIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  SwatchIcon,
  Squares2X2Icon,
  FireIcon,
  BeakerIcon,
  CakeIcon,
  BoltIcon,
  GiftIcon,
  HeartIcon,
  StarIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  TruckIcon,
  GlobeAltIcon,
  CubeIcon,
  ShoppingBagIcon,
  RocketLaunchIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  BuildingStorefrontIcon,
} from '@heroicons/vue/24/outline'

const productStore = useProductStore()
const toast = useToastStore()

const newName      = ref('')
const selectedIcon = ref('fire')
const saving       = ref(false)
const editId       = ref(null)

const iconOptions = [
  { key: 'fire',     icon: FireIcon,               label: 'Fire / Grilled'  },
  { key: 'cake',     icon: CakeIcon,               label: 'Desserts'        },
  { key: 'beaker',   icon: BeakerIcon,             label: 'Drinks / Soup'   },
  { key: 'bolt',     icon: BoltIcon,               label: 'Fried / Quick'   },
  { key: 'gift',     icon: GiftIcon,               label: 'Snacks'          },
  { key: 'heart',    icon: HeartIcon,              label: 'Favorites'       },
  { key: 'star',     icon: StarIcon,               label: 'Bestsellers'     },
  { key: 'sun',      icon: SunIcon,                label: 'Breakfast'       },
  { key: 'moon',     icon: MoonIcon,               label: 'Dinner'          },
  { key: 'sparkles', icon: SparklesIcon,           label: 'Specials'        },
  { key: 'truck',    icon: TruckIcon,              label: 'Delivery Only'   },
  { key: 'globe',    icon: GlobeAltIcon,           label: 'Seafood'         },
  { key: 'cube',     icon: CubeIcon,               label: 'Rice Meals'      },
  { key: 'bag',      icon: ShoppingBagIcon,        label: 'Combos'          },
  { key: 'rocket',   icon: RocketLaunchIcon,       label: 'New Arrivals'    },
  { key: 'music',    icon: MusicalNoteIcon,        label: 'Party Trays'     },
  { key: 'leaf',     icon: ArchiveBoxIcon,         label: 'Healthy'         },
  { key: 'store',    icon: BuildingStorefrontIcon, label: 'Store Picks'     },
]

const iconMap = Object.fromEntries(iconOptions.map(o => [o.key, o.icon]))
const selectedIconComponent = computed(() => iconMap[selectedIcon.value] || SparklesIcon)
const getIcon = (key) => iconMap[key] || SparklesIcon

const startEdit = (cat) => {
  editId.value = cat.id
  newName.value = cat.name
  selectedIcon.value = cat.emoji || 'fire'
  // Scroll form into view on mobile
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editId.value = null
  newName.value = ''
  selectedIcon.value = 'fire'
}

const handleSave = async () => {
  if (!newName.value || !selectedIcon.value) return
  saving.value = true
  try {
    if (editId.value) {
      await productStore.updateCategory(editId.value, newName.value, selectedIcon.value)
      toast.success('Category updated!')
      cancelEdit()
    } else {
      await productStore.addCategory(newName.value, selectedIcon.value)
      toast.success('Category added!')
      newName.value = ''
      selectedIcon.value = 'fire'
    }
  } catch {
    toast.error('Failed to save category')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id, name) => {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
  try {
    await productStore.deleteCategory(id)
    toast.success('Category deleted!')
    if (editId.value === id) cancelEdit()
  } catch {
    toast.error('Failed to delete category')
  }
}

onMounted(() => productStore.fetchCategories())
</script>

<style scoped>
.admin-categories { max-width: 960px; }

/* Header */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px;
}
.page-title  { display: flex; align-items: center; gap: 10px; }
.page-title-icon { width: 26px; height: 26px; color: var(--accent2); }
h1 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; }
.page-count {
  font-size: 12px; font-weight: 600; color: var(--text2);
  background: var(--bg3); border: 1px solid var(--border);
  padding: 4px 12px; border-radius: 100px;
}

/* Layout */
.categories-layout {
  display: grid; grid-template-columns: 340px 1fr;
  gap: 24px; align-items: start;
}

/* Card header */
.card-header {
  display: flex; align-items: center; gap: 8px;
  padding-bottom: 14px; border-bottom: 1px solid var(--border);
  margin-bottom: 18px;
}
.card-header-icon { width: 18px; height: 18px; color: var(--accent2); }
.card-header h3 { font-size: 15px; font-weight: 700; flex: 1; }
.count-badge {
  background: rgba(232,70,42,0.12); color: var(--accent2);
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 100px;
}

/* Cancel edit btn */
.cancel-edit-btn {
  width: 28px; height: 28px; border-radius: 7px;
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--text2); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.cancel-edit-btn:hover { border-color: var(--accent); color: var(--accent2); }
.cancel-icon { width: 13px; height: 13px; }

/* Form */
.add-category { padding: 24px; display: flex; flex-direction: column; gap: 18px; }

.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--text2);
}
.label-icon { width: 13px; height: 13px; }

/* Icon picker */
.icon-picker {
  display: grid; grid-template-columns: repeat(6, 1fr);
  gap: 6px; padding: 12px; background: var(--bg3);
  border: 1px solid var(--border); border-radius: 12px;
}
.icon-opt {
  aspect-ratio: 1; border-radius: 8px; display: flex;
  align-items: center; justify-content: center;
  background: transparent; border: 1px solid transparent;
  cursor: pointer; transition: all 0.15s;
  color: var(--text2); padding: 7px;
}
.icon-opt:hover { background: rgba(255,255,255,0.06); color: var(--text); }
.icon-opt.selected {
  background: rgba(232,70,42,0.15);
  border-color: rgba(232,70,42,0.35);
  color: var(--accent2);
}
.icon-opt-svg { width: 18px; height: 18px; }

.selected-preview {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; background: rgba(232,70,42,0.06);
  border: 1px solid rgba(232,70,42,0.15); border-radius: 8px;
  font-size: 13px; color: var(--accent2); font-weight: 500;
}
.preview-icon { width: 18px; height: 18px; color: var(--accent2); }

.add-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; padding: 12px; font-size: 14px; width: 100%;
}
.btn-icon { width: 16px; height: 16px; }

/* Categories list */
.categories-list { padding: 24px; }
.cat-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.cat-item {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 16px 12px 12px;
  background: var(--bg3); border: 1px solid var(--border);
  border-radius: 12px; transition: all 0.2s; position: relative;
}
.cat-item:hover { border-color: rgba(232,70,42,0.25); }
.cat-item-editing {
  border-color: rgba(232,70,42,0.5) !important;
  background: rgba(232,70,42,0.04) !important;
}
.cat-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(232,70,42,0.1); border: 1px solid rgba(232,70,42,0.15);
  display: flex; align-items: center; justify-content: center;
}
.cat-icon { width: 22px; height: 22px; color: var(--accent2); }
.cat-name { font-size: 12px; font-weight: 600; text-align: center; color: var(--text); }

/* Category action buttons */
.cat-actions {
  display: flex; gap: 4px; margin-top: 4px;
}
.cat-btn {
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid var(--border); background: var(--bg);
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: all 0.15s;
  color: var(--text2);
}
.cat-btn-icon { width: 13px; height: 13px; }
.cat-edit-btn:hover   { border-color: #6c6cff; color: #6c6cff; background: rgba(108,108,255,0.08); }
.cat-delete-btn:hover { border-color: var(--accent); color: var(--accent2); background: rgba(232,70,42,0.08); }

/* Empty */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 48px 24px; text-align: center;
}
.empty-icon { width: 40px; height: 40px; color: var(--border); }
.empty-state p { font-size: 15px; font-weight: 600; color: var(--text2); }
.empty-state span { font-size: 13px; color: var(--text2); opacity: 0.6; }

@media (max-width: 768px) {
  .categories-layout { grid-template-columns: 1fr; }
}
</style>