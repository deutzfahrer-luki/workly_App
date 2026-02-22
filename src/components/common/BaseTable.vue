<template>
  <div class="base-table-container">
    <table class="custom-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id" @click="$emit('row-click', item)">
          <td v-for="col in columns" :key="col.key">
            <slot :name="'col-' + col.key" :value="item[col.key]" :item="item">
              {{ item[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps(['columns', 'data']);
defineEmits(['row-click']);
</script>

<style scoped>
.custom-table { width: 100%; border-collapse: collapse; color: white; }
.custom-table th { text-align: left; padding: 12px; color: #5c626d; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1f2229; }
.custom-table td { padding: 16px 12px; border-bottom: 1px solid #1f2229; cursor: pointer; }
.custom-table tr:hover { background: rgba(255,255,255,0.02); }
</style>