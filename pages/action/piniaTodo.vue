<script setup>
const todoStore = usetodoStore();
// actions 的方法可以直接解構
const {addtodo, removetodo } = todoStore;

// state 資料和 getters 具有響應性，需經過 storeToRefs 解構
const { todoList, todoQuantity } = storeToRefs(todoStore);

const newtodo = ref("");

const addNewtodo = () =>{
  if (newtodo.value) {
    addtodo(newtodo.value);
    newtodo.value = "";
  }
}

const deletetodo = (id) =>{
  removetodo(id);
}

</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <h1 class="text-center mb-4">todo List</h1>
        <div class="input-group mb-3">
          <input
            v-model.trim="newtodo"
            class="form-control"
            placeholder="新增待辦事項"
          />
          <button
            @click="addNewtodo"
            class="btn btn-primary"
            :disabled="!newtodo?.length"
          >
            新增 todo
          </button>
        </div>
        <ul class="list-group">
          <li
            v-for="todo in todoStore.todoList"
            :key="todo.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {{ todo.text }}
            </span>
            <button @click="deletetodo(todo.id)" class="btn btn-danger btn-sm">
              刪除
            </button>
          </li>
        </ul>

        <p class="mt-3">{{ todoStore.todoQuantity }}</p>
      </div>
    </div>

  <div class="hit">
      <p>使用檔案: stores/todo.js</p>
      <p>使用技巧: plugin 整合vue3插件 -> .component() , .use()</p>
    </div>
  </div>
</template>

<style scoped></style>
