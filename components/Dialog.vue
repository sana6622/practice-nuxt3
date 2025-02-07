<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
    <el-form ref="formRef" :model="formData" label-width="100px">
      <el-form-item
        v-for="(field, index) in fields"
        :key="index"
        :label="field.label"
      >
        <el-input v-if="field.type === 'text'" v-model="formData[field.prop]" />
        <el-input
          v-if="field.type === 'number'"
          v-model.number="formData[field.prop]"
          type="number"
        />
        <el-input
          v-if="field.type === 'textarea'"
          v-model="formData[field.prop]"
          type="textarea"
        />
        <el-input
          v-if="field.type === 'array'"
          v-model="formData[field.prop]"
          placeholder="請輸入 [121.4329, 25.1754]"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveItem">{{
          mode === "edit" ? "更新" : "新增"
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";

const props = defineProps({
  mode: String, // "add" 或 "edit"
  modelValue: Object, // 綁定的表單數據
  dialogTitle: String, // Dialog 標題
  fields: Array, // 欄位陣列
});

const emit = defineEmits(["update:modelValue", "add-item", "update-item"]);

const dialogVisible = ref(false);
const formData = ref({});

// **監聽 modelValue 變更**
watch(
  () => props.modelValue,
  (newVal) => {
    formData.value = { ...newVal };
  },
  { deep: true, immediate: true }
);

// **開啟對話框 由父層控制**
const openDialog = () => {
  dialogVisible.value = true;
};

// **儲存資料**
const saveItem = () => {
  if (formData.value.coords && typeof formData.value.coords === "string") {
    try {
      formData.value.coords = JSON.parse(formData.value.coords);
    } catch (error) {
      console.error("經緯度格式錯誤，請使用 [121.4329, 25.1754]");
      return;
    }
  }

  if (props.mode === "edit") {
    emit("update-item", { ...formData.value });
  } else {
    emit("add-item", { ...formData.value });
  }

  dialogVisible.value = false;
};

defineExpose({ openDialog });
</script>
