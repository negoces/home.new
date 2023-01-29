function theme_set_dark() {
    localStorage.theme = "dark";
    theme_menu_close();
    theme_set_menu_bg();
    setTheme();
}

function theme_set_light() {
    localStorage.theme = "light";
    theme_menu_close();
    theme_set_menu_bg();
    setTheme();
}

function theme_set_system() {
    localStorage.removeItem("theme");
    theme_menu_close();
    theme_set_menu_bg();
    setTheme();
}
