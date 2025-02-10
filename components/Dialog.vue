<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import { iconList, getIconById } from "@/constants/icons";
import { colorList, getIconColor } from "@/constants/color";
const icons = ref(iconList);
const colors = ref(colorList);

const props = defineProps({
  mode: String, // "add" 或 "edit"
  modelValue: Object, // 綁定的表單數據
  dialogTitle: String, // Dialog 標題
  fields: Array, // 欄位陣列
});

const emit = defineEmits(["update:modelValue", "add-item", "update-item"]);

const dialogVisible = ref(false);
const formData = ref({});
const longitudeInput = ref(""); // 經度 (Longitude)
const latitudeInput = ref(""); // 緯度 (Latitude)

// **監聽 modelValue 變更**
watch(
  () => props.modelValue,
  (newVal) => {
    formData.value = { ...newVal };

    // **如果 coords 存在，解析成經度 & 緯度**
    if (Array.isArray(newVal.coords) && newVal.coords.length === 2) {
      longitudeInput.value = newVal.coords[0].toString(); // 經度
      latitudeInput.value = newVal.coords[1].toString(); // 緯度
    } else {
      longitudeInput.value = "";
      latitudeInput.value = "";
    }
    // **確保 `multi` 欄位是陣列，避免 `add` 模式時沒有初始化**
    props.fields.forEach((field) => {
      if (field.type === "multi") {
        if (!Array.isArray(formData.value[field.prop])) {
          formData.value[field.prop] = [""]; // 預設為一個空值
        }
      }
    });
  },
  { deep: true, immediate: true }
);

// **監聽經緯度輸入框的變更，更新 formData.coords**
watch([longitudeInput, latitudeInput], ([newLon, newLat]) => {
  if (newLon && newLat) {
    formData.value.coords = [parseFloat(newLon), parseFloat(newLat)];
  } else {
    formData.value.coords = [];
  }
});

// **開啟對話框 由父層控制**
const openDialog = () => {
  dialogVisible.value = true;
};
const closeDialog = () => {
  dialogVisible.value = false;
};

const selectIcon = (icon) => {
  formData.value.icon = icon.id;
  console.log("formData", formData);
};

const selectColor = (color) => {
  formData.value.bgc = color.id;
};

// **新增多筆輸入框項目**
const addMultiField = (prop) => {
  formData.value[prop].push("");
};

// **移除多筆輸入框項目**
const deleteMultiField = (prop, index) => {
  formData.value[prop].splice(index, 1);
};

// **儲存資料**
const saveItem = () => {
  if (props.mode === "edit") {
    emit("update-item", { ...formData.value });
  } else {
    emit("add-item", { ...formData.value });
  }
};

defineExpose({ openDialog, closeDialog });
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
    <el-form ref="formRef" :model="formData" label-width="100px">
      <el-form-item
        v-for="(field, index) in fields"
        :key="index"
        :label="field.label"
      >
        <el-input v-if="field.type === 'text'" v-model="formData[field.prop]" />
        <div v-if="field.type === 'multi'">
          <div
            v-for="(item, idx) in formData[field.prop]"
            :key="`item-${idx}`"
            class="multi"
          >
            <el-input v-model="formData[field.prop][idx]" />
            <el-button @click="addMultiField(field.prop)">+</el-button>
            <el-button
              v-if="formData[field.prop].length > 1"
              @click="deleteMultiField(field.prop, idx)"
              >-</el-button
            >
          </div>
        </div>
        <el-input
          v-if="field.type === 'number'"
          v-model.number="formData[field.prop]"
          type="number"
          :min="0"
        />

        <el-input
          v-if="field.type === 'textarea'"
          v-model="formData[field.prop]"
          type="textarea"
        />

        <!-- **經緯度兩個 input 欄位** -->
        <div v-if="field.prop === 'coords'">
          <div class="coords-input-group">
            <el-input
              v-model="longitudeInput"
              placeholder="請輸入經度 (Longitude)"
            />
            <el-input
              v-model="latitudeInput"
              placeholder="請輸入緯度 (Latitude)"
            />
          </div>

          <span>注意: google地圖上顯示的為緯經度</span>
        </div>
        <!-- 圖片選擇器 -->
        <div v-if="field.prop === 'icon'" class="icon-grid">
          <div
            v-for="icon in icons"
            :key="icon.id"
            class="icon-item"
            :class="{ selected: formData.icon === icon.id }"
            @click="selectIcon(icon)"
            tabindex="0"
            @keydown.enter="selectIcon(icon)"
            @keydown.space.prevent="selectIcon(icon)"
          >
            <img :src="icon.path" :alt="icon.name" />
          </div>
        </div>

        <!-- 顏色選擇器 -->
        <div v-if="field.prop === 'bgc'" class="color-grid">
          <div
            v-for="color in colors"
            :key="color.id"
            class="color-item"
            :style="{ backgroundColor: color.color }"
            :class="{ selected: formData.bgc === color.id }"
            @click="selectColor(color)"
            tabindex="0"
            @keydown.enter="selectColor(color)"
            @keydown.space.prevent="selectColor(color)"
          ></div>
        </div>
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

<style lang="scss" scoped>
.multi {
  width: 100%;
  display: flex;
  gap: 10px;
}
.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  background-color: gray;
  padding: 10px;
}

.icon-item {
  width: 50px;
  height: 50px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.icon-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.icon-item.selected {
  outline: 4px solid #409eff;
}
.coords-input-group {
  display: flex;
  gap: 10px;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  padding: 10px;
  .color-item {
    width: 20px;
    height: 20px;
  }
  .color-item.selected {
    outline: 3px solid #3f3f3d;
  }
}
</style>
