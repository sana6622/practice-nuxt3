<script setup>
import Sortable from 'sortablejs';
import { useBreakpoints } from '@vueuse/core';

// import Edit from '~/assets/svg/edit.svg';
// import EditFalse from '~/assets/svg/editFalse.svg';
// import Delete from '~/assets/svg/delete.svg';
// import IsLockTrue from '~/assets/svg/isLockTrue.svg';
// import IsLockFalse from '~/assets/svg/isLockFalse.svg';
// import IsStopTrue from '~/assets/svg/isStopTrue.svg';
// import IsStopFalse from '~/assets/svg/isStopFalse.svg';
// import IsAbolishTrue from '~/assets/svg/isAbolishTrue.svg';
// import IsAbolishFalse from '~/assets/svg/isAbolishFalse.svg';
// import IsEnable from '~/assets/svg/isEnable.svg';

// import EmptyTable from '~/assets/svg/emptyTable.svg';

const props = defineProps({
  columns: Array, // [{ label: '欄位名稱', key: 'name', type: 'text'|'link'|'switch'|'tag'|'icons', align?: 'left'|'center'|'right' }]
  items: Array,
  showPageSize: { type: Boolean, default: false }, //顯示幾筆結果
  modelValue: { type: Number, default: 1 },
  showNavigation: { type: Boolean, default: true },
  disableEdit: { type: Boolean, default: false },
  fixActions: { type: Boolean, default: true } //是否把 actions 欄固定在最右
});

const localItems = ref([...props.items]); // 本地完整資料副本

const pageSize = ref(10);
const currentPage = ref(props.modelValue);
const pageSizeOptions = ref([1, 2, 10, 25]);

const hasTriedFetch = ref(false);
const multipleSelection = ref();

// Sortable.js 初始化
const tableRef = ref(null);
let sortable = null;

const emit = defineEmits([
  'update:modelValue',
  'update:items',
  'clickIconHandler',
  'selectionHandler',
  'changePageSize',
  'switchChangeHandler'
]);

const clickIconHandler = (type, row) => {
  emit('clickIconHandler', type, row);
};

const handlePageSizeChange = (number) => {
  pageSize.value = number;
  currentPage.value = 1;
  emit('update:modelValue', 1);
  emit('changePageSize', number);
};

const switchChangeHandler = (row) => {
  emit('switchChangeHandler', row);
};

const paginatedItems = computed(() => {
  if (!props.showNavigation) return localItems.value;
  const start = (currentPage.value - 1) * pageSize.value;
  return localItems.value.slice(start, start + pageSize.value);
});

const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
};

//刪減號
const truncate = (str, maxLen = 20) =>
  typeof str === 'string' && str.length > maxLen ? str.slice(0, maxLen) + '...' : str;

const statusStyle = (status) => {
  const list = {
    驗證中: 'background-color: rgba(255, 240, 218, 1); color: rgba(181, 135, 68, 1);',
    鎖定中: 'background-color: rgba(255, 221, 221, 1); color: rgba(149, 73, 73, 1);',
    停用中: 'background-color: rgba(255, 221, 221, 1); color: rgba(149, 73, 73, 1);',
    已廢止: 'background-color: rgba(234, 234, 234, 1); color: rgba(70, 70, 70, 1);',
    啟用中: 'background-color: rgba(218, 245, 239, 1); color: rgba(49, 113, 109, 1);'
  };

  return list[status];
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
  emit('selectionHandler', multipleSelection.value);
};

const tranToDateRange = (arr) => {
  return `${arr[0]} ~ ${arr[1]}`;
};

const initDrag = async () => {
  await nextTick();
  if (!tableRef.value || !tableRef.value.$el) {
    return;
  }

  const tbody = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody');
  if (!tbody) return;

  // 如果之前有實例，先 destroy
  if (sortable) sortable.destroy();

  sortable = Sortable.create(tbody, {
    handle: '.move-handle',
    animation: 150,
    ghostClass: 'ghost-row',
    chosenClass: 'chosen-row',
    onEnd({ oldIndex, newIndex }) {
      // 1. 計算全域陣列要操作的索引
      const pageStart = (currentPage.value - 1) * pageSize.value;
      const from = pageStart + oldIndex;
      const to = pageStart + newIndex;

      // 2. 在 localItems 上做 splice
      const data = localItems.value;
      const [moved] = data.splice(from, 1);
      data.splice(to, 0, moved);

      // 3. emit 完整排序後的陣列
      emit('update:items', [...data]);
    }
  });
};

//斷點
const breakpointsElementPlus = {
  xs: 0,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920
};

const breakpoints = useBreakpoints(breakpointsElementPlus);
const isMobile = breakpoints.smaller('sm'); // < 768px

const pagerCount = computed(() => {
  // el-pagination 的 pager-count 屬性必須是 5 到 21 之間的奇數。
  if (isMobile.value) {
    return 5; // 螢幕較窄時顯示 5 個頁碼按鈕
  }
  return 7; // 預設顯示 7 個
});

watch(
  () => props.items,
  (v) => {
    localItems.value = [...v];
    hasTriedFetch.value = true;
  },
  { immediate: true, deep: true }
);

watch(
  () => props.modelValue,
  (val) => {
    currentPage.value = val;
  }
);

watch(currentPage, (val) => {
  emit('update:modelValue', val);
});

// 只在 tableRef 綁定成功 *且* 分頁資料（paginatedItems）有變更時，再去初始化拖曳
watch(
  () => [tableRef.value, paginatedItems.value.length],
  ([table, len]) => {
    if (table && len > 0) {
      initDrag();
    }
  }
);
</script>

<template>
  <div class="table">
    <div v-if="showPageSize" class="pageSize">
      <div class="left">
        <span>顯示</span>
        <el-select v-model="pageSize" placeholder="請選擇" @change="handlePageSizeChange">
          <el-option v-for="item of pageSizeOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <span>筆結果</span>
      </div>
      <!-- 這裡要用slot讓使用者可以自定義放什麼東西在右側 -->
      <!-- 
        用法說明：
        <BaseTable :columns="columns" :items="items">
          <template #right>
            <button>Your Button</button>
          </template>
        </BaseTable>
      -->
      <slot name="right"></slot>
    </div>
    <el-table
      v-if="items.length !== 0"
      ref="tableRef"
      :row-key="(row) => row.id"
      :data="paginatedItems"
      border
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-for="el of columns"
        :key="el.key"
        :label="el.label"
        :width="el.width"
        :min-width="el.minWidth"
        :type="el.type"
        :header-align="el.headerAlign || 'left'"
        :align="el.align || 'left'"
        :fixed="el.type === 'actions' && fixActions ? 'right' : null"
      >
        <template #default="scope">
          <!-- 序號欄 -->
          <span v-if="el.type === 'index'">
            {{ el.index ? el.index(scope.$index) : scope.$index + 1 }}
          </span>

          <!-- text -->
          <div v-if="el.type === 'text'" class="text">
            <p>{{ scope.row[el.key] }}</p>
          </div>

          <!-- 超過字數刪減 -->
          <div v-if="el.type === 'minText'" class="text">
            <p class="clamp-1">{{ scope.row[el.key] }}</p>
          </div>

          <!-- price -->
          <div v-if="el.type === 'price'" class="text">
            <p>{{ Number(scope.row[el.key]).toLocaleString() }}</p>
          </div>

          <!-- dateRange -->
          <div
            v-if="el.type === 'dateRange'"
            class="dateRange"
            style="display: flex; align-items: center"
          >
            <p>{{ tranToDateRange(scope.row[el.key]) }}</p>
          </div>

          <!-- link -->
          <div v-else-if="el.type === 'link'" class="link">
            <a :href="scope.row[el.key].href" target="_blank">{{ scope.row[el.key].text }}</a>
          </div>

          <!-- status -->
          <div
            v-else-if="el.type === 'status'"
            class="status"
            style="display: flex; align-items: center"
          >
            <p :style="statusStyle(scope.row[el.key])">
              {{ scope.row[el.key] }}
            </p>
          </div>

          <!-- switch -->
          <div
            v-else-if="el.type === 'switch'"
            class="switch"
            style="display: flex; align-items: center; justify-content: center"
          >
            <el-switch
              v-model="scope.row[el.key]"
              size="large"
              inline-prompt
              active-text="開"
              inactive-text="關"
              style="--el-switch-on-color: #4da09b; --el-switch-off-color: #c4ded8"
              @change="switchChangeHandler(scope.row)"
            />
          </div>

          <!-- actions -->
          <div v-else-if="el.type === 'actions'" class="actions">
            <div v-for="svg of scope.row[el.key]" :key="svg" class="svgArea">
              <!-- 拖曳 -->
              <el-button v-if="svg === 'drag'" class="move-handle" size="small">
                <img src="@/assets/img/drag.svg" alt="" />
              </el-button>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="showNavigation && items.length !== 0" class="pageArea">
      <p>共{{ items.length }}筆</p>
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        background
        layout="prev, pager, next"
        :total="items.length"
        :pager-count="pagerCount"
      />
    </div>

    <div v-if="hasTriedFetch && items.length === 0" class="emptyTable">
      <img :src="EmptyTable" alt="Table內無資料圖示" />
      <p>查無資料</p>
      <p>請重新設定查詢條件</p>
      <p>或導入其他年度</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .pageSize {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
    .left {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-family: Noto Sans TC;
      font-weight: 400;
      line-height: 19px;
      letter-spacing: 0%;
      color: #5e5e5e;

      :deep(.el-select) {
        width: 80px;
        margin: 0 10px;
        .el-select__wrapper {
          height: 31px;
        }
      }
    }
  }

  // Table字型設定
  :deep(.el-table) {
    font-family: Noto Sans TC;
    font-size: 16px;
    line-height: 19px;

    border: 1px solid rgba(201, 217, 226, 1);
    .cell {
      padding-left: 10px;
    }
  }

  :deep(.el-table thead) {
    font-weight: 500;
    color: rgba(46, 46, 46, 1);
  }
  :deep(.el-table .el-table__body-wrapper) {
    font-weight: 400;
    color: rgba(94, 94, 94, 1);
  }

  :deep(.el-table__header) {
    border-bottom: 4px solid rgba(201, 217, 226, 1);
  }
  :deep(.el-table__cell) {
    border-right: 1px solid rgba(201, 217, 226, 1);
    border-bottom: 1px solid rgba(201, 217, 226, 1);
  }

  // 判斷單雙數row顏色
  :deep(.el-table .even-row) {
    --el-table-tr-bg-color: rgba(244, 248, 250, 1);
  }
  :deep(.el-table .odd-row) {
    --el-table-tr-bg-color: rgba(255, 255, 255, 1);
  }

  // *table中的type欄位*
  // link
  :deep(.el-table .link a) {
    font-weight: 700;
    text-align: center;
    vertical-align: middle;
    text-decoration: underline;
    text-decoration-style: solid;
    text-underline-offset: 2px; /* 調整底線距離文字的距離 */
    color: rgba(50, 133, 114, 1);
  }
  // status
  :deep(.el-table .status p) {
    font-family: Noto Sans TC;
    font-weight: 400;
    font-size: 16px;
    line-height: 100%;
    letter-spacing: 0%;
    padding: 6px;
    border-radius: 4px;
    gap: 10px;
    text-align: center;
  }

  // actions
  :deep(.el-table .actions) {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 10px;
  }

  .pageArea {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin: 20px 0;
    p {
      font-family: Noto Sans TC;
      font-weight: 400;
      font-size: 16px;
      line-height: 100%;
      letter-spacing: 0%;
      color: rgba(49, 113, 109, 1);
    }
  }

  //刪減號
  .clamp-1 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;

    line-height: 1.5;
    max-height: calc(1.5em * 1);
  }
}

.move-handle {
  width: 21px;
  height: 27px;
  border: 0px;

  margin: 0;
  padding: 0;
  background-color: transparent;
  cursor: grab;

  img {
    width: 100%;
    height: 22px;
  }
}
</style>

