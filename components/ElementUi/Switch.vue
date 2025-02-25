<script setup></script>
<template>
  <el-switch
    size="large"
    v-bind="{ ...$attrs }"
    inline-prompt
    style="--el-switch-on-color: #b5985e; --el-switch-off-color: #a0becf"
  />
</template>
<style lang="scss">
.el-switch--large {
  // @include pad {
  //   height: auto;
  // }
}
.el-switch--large .el-switch__core {
  border-radius: 38px;
  height: 30px;
  min-width: 55px;
  // @include pad {
  //   height: 25px;
  //   min-width: 45px;
  // }
}
.el-switch--large.is-checked .el-switch__core .el-switch__action {
  left: calc(100% - 23px);
  // @include pad {
  //   left: calc(100% - 21px);
  // }
}
.el-switch--large .el-switch__core .el-switch__action {
  width: 18px;
  height: 18px;
}
.el-switch__core .el-switch__action {
  left: 4px;
  // @include pad {
  //   left: 3px;
  // }
}
.el-switch__core .el-switch__inner .is-text {
  // @include setFont(16px, 30px, 600, $NotoSerifFont);
}
</style>
