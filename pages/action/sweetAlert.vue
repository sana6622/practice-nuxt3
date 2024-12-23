<script setup>
const { $swal } = useNuxtApp();

const showAlert = () => {
  $swal
    .fire({
      title: "訂單確認",
      text: "是否確認提交訂單？",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "是",
      cancelButtonText: "否",
    })
    .then((result) => {
      if (result.isConfirmed) {
        $swal.fire("成功", "您的訂單已提交", "success");
      } else {
        $swal.fire("取消", "您的訂單未提交", "error");
      }
    });
};
const errorAlert = () => {
  $swal.fire({
    title: "錯誤訊息",
    // text: "是否確認提交訂單？",
    icon: "error",
    confirmButtonText: "是",
  });
};
</script>

<template>
  <div class="sweetAlert">
    <button @click="showAlert" class="btn">顯示 SweetAlert</button>
    <button @click="errorAlert" class="btn btn-primary">error</button>
    <div class="hit">
      <p>安裝 : npm install sweetalert2</p>

      <p>使用檔案: plugin/sweetAlert.js</p>
      <p>使用技巧</p>
      <ul>
        <li>$swal.fire({title:'XXX',icon:'error'})</li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.sweetAlert {
  .btn {
    padding: 20px;
    background-color: burlywood;
    margin-left: 20px;
    margin-bottom: 20px;
    border: 1px solid burlywood;
    border-radius: 10px;
    cursor: pointer;
  }
}
</style>
