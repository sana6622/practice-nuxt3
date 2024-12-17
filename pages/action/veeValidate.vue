<script setup>
const onSubmit = (value, { resetForm }) => {
  console.log("表單提交的值", value);

  // 可以從第二個參數取出 resetForm 方法來重置表單
  resetForm();
};
</script>

<template>
  <div class="vee-validate">
    <VForm v-slot="{ errors, meta, resetForm }" @submit="onSubmit">
      <!-- 其他表單元素 -->
      <!-- 使用 v-slot 取出的 resetForm 方法重置表單 -->
      <p>error:{{ errors }}</p>
      <div>
        <label for="username" class="form-label">name</label>
        <VField
          id="username"
          name="username"
          class="form-control"
          :class="{ 'is-invalid': errors['username'] }"
          type="text"
          rules="required|username"
        />
        <VErrorMessage class="invalid-feedback" name="username" />
      </div>
      <div>
        <label for="phone" class="form-label">phone</label>
        <VField
          id="phone"
          name="phone"
          class="form-control"
          :class="{ 'is-invalid': errors['phone'] }"
          type="text"
          rules="required|phone"
        />
        <VErrorMessage class="invalid-feedback" name="phone" />
      </div>
      <div>
        <label class="form-label" for="userDescription">使用者簡介</label>
        <VField
          id="userDescription"
          name="userDescription"
          class="form-control"
          :class="{ 'is-invalid': errors['userDescription'] }"
          placeholder="請輸入您的簡短自我介紹"
          rules="required"
          as="textarea"
        />
        <VErrorMessage class="invalid-feedback" name="userDescription" />
      </div>
      <button class="btn btn-outline-warning" type="button" @click="resetForm">
        清空
      </button>
      <!-- :disabled 屬性綁定從 v-slot 取出的 meta.valid ，檢查欄位的驗證是否有錯誤 -->
      <button class="btn btn-primary" type="submit" :disabled="!meta.valid">
        送出
      </button>
    </VForm>
    <div class="hit">
      <p>使用檔案: plugin/veeValidate.js</p>
      <p>使用技巧: vee-Validate</p>
    </div>
  </div>
</template>

<style lang="scss">
.vee-validate {
  .invalid-feedback {
    color: red;
  }
  .hit {
    background-color: pink;
    padding: 15px;
    p {
      font-size: 18px;
    }
  }
}
</style>
