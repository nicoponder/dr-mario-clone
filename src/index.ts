import App from "./App";

const element = document.getElementById("app");
if (element) {
  const app = new App(element);
  app.init();
}
