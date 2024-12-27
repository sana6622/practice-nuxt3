export const usetodoStore = defineStore("todo", () => {
  // 定義 state
  const todoList = ref([]);

  // 定義 actions
  // 新增待辦事項
  const addtodo = (todo) => {
    todoList.value.push({
      id: Date.now(),
      text: todo,
    });
  };
  const removetodo = (id) => {
    const todoIndex = todoList.value.findIndex((todo) => todo.id === id);
    if (todoIndex !== -1) {
      todoList.value.splice(todoIndex, 1);
    }
  };
  // 定義 getters
  const todoQuantity = computed(() => {
    `有${todoList.value?.length}個事項`;
  });

  return {
    todoList,
    addtodo,
    removetodo,
    todoQuantity,
  };
});
