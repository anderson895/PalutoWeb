<template>
  <div class="admin-categories">
    <div class="page-header">
      <h1>Categories</h1>
    </div>
    <div class="categories-layout">
      <div class="add-category card">
        <h3>Add New Category</h3>
        <div class="form-group">
          <label>Category Name</label>
          <input v-model="newName" placeholder="e.g. Rice Meals" />
        </div>
        <div class="form-group">
          <label>Emoji Icon</label>
          <input v-model="newEmoji" placeholder="🍚" style="font-size:24px;text-align:center" maxlength="2" />
        </div>
        <button class="btn btn-primary" @click="handleAdd" :disabled="saving || !newName">
          {{ saving ? 'Adding...' : '+ Add Category' }}
        </button>
      </div>
      <div class="categories-list card">
        <h3>All Categories ({{ productStore.categories.length }})</h3>
        <div v-if="productStore.categories.length" class="cat-grid">
          <div v-for="cat in productStore.categories" :key="cat.id" class="cat-item">
            <span class="cat-emoji">{{ cat.emoji }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </div>
        </div>
        <div v-else class="empty-state"><p>No categories yet</p></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import { useToastStore } from '@/stores/toast'

const productStore = useProductStore()
const toast = useToastStore()
const newName = ref('')
const newEmoji = ref('🍽️')
const saving = ref(false)

const handleAdd = async () => {
  saving.value = true
  try {
    await productStore.addCategory(newName.value, newEmoji.value)
    toast.success('Category added!')
    newName.value = ''; newEmoji.value = '🍽️'
  } catch { toast.error('Failed to add category') }
  finally { saving.value = false }
}

onMounted(() => productStore.fetchCategories())
</script>
<style scoped>
.admin-categories { max-width: 900px; }
.page-header { margin-bottom: 28px; }
h1 { font-family: 'Playfair Display', serif; font-size: 32px; }
.categories-layout { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
.add-category { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.add-category h3 { font-size: 16px; font-weight: 700; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.categories-list { padding: 24px; }
.categories-list h3 { font-size: 16px; font-weight: 700; padding-bottom: 12px; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.cat-item { display: flex; align-items: center; gap: 10px; padding: 14px; background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; }
.cat-emoji { font-size: 24px; }
.cat-name { font-size: 14px; font-weight: 500; }
.empty-state { text-align: center; padding: 40px; color: var(--text2); }
@media (max-width: 768px) { .categories-layout { grid-template-columns: 1fr; } }
</style>
