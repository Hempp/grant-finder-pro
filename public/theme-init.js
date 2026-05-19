(function () {
  try {
    var m = localStorage.getItem("theme-mode");
    if (m === "dark" || m === "light") {
      document.documentElement.setAttribute("data-theme-mode", m);
    }
  } catch (e) {
    /* private browsing or storage disabled — fall through to system pref */
  }
})();
