export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('textformat1',{
    mounted(el, binding) {
      const type = binding.arg
      console.log('binding: ' , binding)
      console.log('type',type)
      if(type ==='uppercase') el.textContent = binding.value.toUpperCase()
      if(type ==='lowercase') el.textContent = binding.value.toLowerCase()
    },
    updated(el, binding) {
      const type = binding.arg
      if(type ==='uppercase') el.textContent = binding.value.toUpperCase()
      if(type ==='lowercase') el.textContent = binding.value.toLowerCase()
    },
  }),

  //另一種寫法 ， 是用簡單不用動態變更的情況
  nuxtApp.vueApp.directive("textformat2", (el, binding) => {
    const bindingArg = {
      uppercase: binding.value.toUpperCase(),
      lowercase: binding.value.toLowerCase(),
    };
    el.innerHTML = bindingArg[binding.arg];
  });



  
})
