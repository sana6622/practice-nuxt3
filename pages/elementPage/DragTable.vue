<script setup>
const currentPage = ref(1);
const pageSize = ref(10);

// *Table資料*
const tableData = ref([
  {
    id: 's1',
    content: 'test1',
    moreContent: '123456789123456789123456789123456789123456789',
    status: '驗證中',
    price: 100000,
    dateRange: ['2025-05-01 16:00:00', '2025-05-08 16:00:00'],
    updatedAt: '2025-05-08 16:00:00',
    actions: ['drag']
  },
  {
    id: 's2',
    content: 'test2',
    moreContent: '5555555555555555555555555',
    status: '停用中',
    price: 20000,
    dateRange: ['2025-05-01 16:00:00', '2025-05-08 16:00:00'],
    updatedAt: '2025-05-08 16:00:00',
    actions: ['drag']
  },
  {
    id: 's3',
    content: 'test2',
    moreContent: '33333333333333',
    status: '停用中',
    price: 1000000,
    dateRange: ['2025-05-01 16:00:00', '2025-05-08 16:00:00'],
    updatedAt: '2025-05-08 16:00:00',
    actions: ['drag']
  }
]);
const columnsMarqueeSection = ref([
  {
    key: 'index',
    label: '序號',
    type: 'index',
    width: '72',
    align: 'center',
    headerAlign: 'center',
    // index 欄的計算方式：如果有分頁，就要考慮當前頁數
    index: (idx) => (currentPage.value - 1) * pageSize.value + idx + 1
  },
  {
    key: 'content',
    label: '內容',
    type: 'text',
    width: 'auto',
    minWidth: '200',
    align: 'center',
    headerAlign: 'center'
  },
  { key: 'moreContent', label: '內容多多', type: 'minText', width: 'auto', minWidth: '200' },
  {
    key: 'price',
    label: '價格',
    type: 'price',
    width: 'auto',
    minWidth: '200',
    headerAlign: 'center',
    align: 'right'
  },
  { key: 'status', label: '狀態', type: 'status', width: '100' },
  { key: 'dateRange', label: '上下架日期', type: 'dateRange', width: '180' },
  { key: 'updatedAt', label: '更新時間', type: 'text', width: '180' },
  { key: 'actions', label: '', type: 'actions', width: '100' }
]);

const marqueeDialogData = reactive({
  id: '',
  type: 'create',
  show: false,
  title: '新增跑馬燈',
  content: '',
  dateRange: [] //  ['2025-05-01 16:00:00','2025-05-08 16:00:00']
});

const marqueeErrorStatus = reactive({
  content: false,
  dateRange: false
});

const changePageSize = (number) => {
  pageSize.value = number;
};

/**
 * 當拖曳排序完成、BaseTable emit update:items 時被觸發
 */
const handleSortedItems = async (items) => {
  console.log('資料順序已更新:', items);
};
</script>

<template>
  <div>
    <div class="content">
      <TableDragTableSort
        v-model="currentPage"
        v-model:items="tableData"
        :columns="columnsMarqueeSection"
        :showNavigation="true"
        :showPageSize="true"
        :fixActions="true"
        @clickIconHandler="(type, row) => showMarqueeDialog(type, row)"
        @changePageSize="changePageSize"
        @update:items="handleSortedItems"
      >
      </TableDragTableSort>
    </div>

    <div class="hit">
      <ul>
        <li>使用檔案 : components/Table/DragTable</li>
        <ol>
          <li>el-table</li>
          <li>拖曳:使用'sortable.js' + vueUse的 useSortable</li>
        </ol>
        <li>安裝 : npm i sortablejs</li>
        <li>表格設定 :</li>
        <ol>
          <li>動態欄位寬度 + 設定最小寬度: width: 'auto', minWidth: '200'</li>
          <li>右側欄位凍結: fixActions="true"</li>
          <li>內容欄位對齊方向 :align</li>
          <li>表頭欄位對齊方向 :headerAlign</li>
        </ol>
      </ul>
    </div>
  </div>
</template>

