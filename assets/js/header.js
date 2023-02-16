var menu_status = "close";
var theme_menu_status = "close";

function menu_open() {
    menu_status = "open";
    document.getElementById("open").classList.add("hidden");
    document.getElementById("open").classList.remove("block");
    document.getElementById("close").classList.add("block");
    document.getElementById("close").classList.remove("hidden");

    document.getElementById("mobile-menu").classList.remove("hidden");
}

function menu_close() {
    menu_status = "close";
    document.getElementById("open").classList.add("block");
    document.getElementById("open").classList.remove("hidden");
    document.getElementById("close").classList.add("hidden");
    document.getElementById("close").classList.remove("block");

    document.getElementById("mobile-menu").classList.add("hidden");
}

document.getElementById("menu_btn").addEventListener("click", () => {
    if (menu_status == "close") {
        menu_open();
    } else {
        menu_close();
    }
});

function theme_menu_close() {
    theme_menu_status = "close";
    const menu = document.getElementById("theme_menu");
    menu.classList.add("hidden");
}

function theme_menu_open() {
    theme_menu_status = "open";
    const menu = document.getElementById("theme_menu");
    menu.classList.remove("hidden");
}

document.getElementById("theme_btn").addEventListener("click", () => {
    if (theme_menu_status == "close") {
        theme_menu_open();
    } else {
        theme_menu_close();
    }
});

function theme_set_menu_bg() {
    const system = document.getElementById("menu_item_system");
    const light = document.getElementById("menu_item_light");
    const dark = document.getElementById("menu_item_dark");
    if (localStorage.theme === "dark") {
        system.classList.remove("text-rose-500");
        system.classList.remove("dark:text-rose-400");
        light.classList.remove("text-rose-500");
        light.classList.remove("dark:text-rose-400");
        dark.classList.add("text-rose-500");
        dark.classList.add("dark:text-rose-400");
    } else if (localStorage.theme === "light") {
        system.classList.remove("text-rose-500");
        system.classList.remove("dark:text-rose-400");
        light.classList.add("text-rose-500");
        light.classList.add("dark:text-rose-400");
        dark.classList.remove("text-rose-500");
        dark.classList.remove("dark:text-rose-400");
    } else {
        system.classList.add("text-rose-500");
        system.classList.add("dark:text-rose-400");
        light.classList.remove("text-rose-500");
        light.classList.remove("dark:text-rose-400");
        dark.classList.remove("text-rose-500");
        dark.classList.remove("dark:text-rose-400");
    }
}

theme_set_menu_bg();

console.debug("当前位置：", window.location.pathname);
const a_tiems = document.getElementsByClassName("router-items");
for (var i = 0; i < a_tiems.length; i++) {
    const element = a_tiems.item(i);
    if (
        element.href === document.URL ||
        document.URL.indexOf(element.href + "page/") == 0
    ) {
        element.classList.add("text-rose-500");
        element.classList.add("dark:text-rose-400");
        element.classList.add("bg-rose-400/10");
    }
}
