import Swal from "sweetalert2";

function showAlert({
  title = "Good job!",
  text = "You clicked the button!",
  icon = "success",
  showCloseButton = true,
  showCancelButton = true,
  ...otherParameters
} = {}) {
  Swal.fire({
    title,
    text,
    icon,
    showCloseButton,
    showCancelButton,
    ...otherParameters,
  });
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("showAlert", showAlert);
});
