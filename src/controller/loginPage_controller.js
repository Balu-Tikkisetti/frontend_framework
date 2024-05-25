export function hide_login() {
  document.getElementById("first").classList.add("invisible");
  console.log("closed");
}

export function show_login() {
  document.getElementById("first").classList.remove("invisible");
}
