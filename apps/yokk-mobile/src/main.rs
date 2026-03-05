#![allow(non_snake_case)]

use dioxus::prelude::*;
use dioxus_logger::tracing::Level;

mod components;
use components::layout::{header::Header, sidebar::Sidebar};

#[derive(Routable, Clone, Debug, PartialEq)]
enum Route {
    #[layout(MainLayout)]
    #[route("/")]
    Home {},
    #[route("/explore")]
    Explore {},
    #[route("/community")]
    Community {},
    #[route("/launch")]
    Launch {},
    #[route("/trending")]
    Trending {},

    // In Dioxus 0.6/0.7, fallback routes apply independently
    #[route("/:..route")]
    PageNotFound { route: Vec<String> },
}

pub fn App() -> Element {
    rsx! {
        Router::<Route> {}
    }
}

#[component]
fn MainLayout() -> Element {
    let mut is_sidebar_open = use_signal(|| false);

    rsx! {
        div {
            class: "min-h-screen bg-charcoal-base text-clay-white flex flex-col font-body",

            Header {
                on_menu_click: move |_| {
                    is_sidebar_open.set(!is_sidebar_open());
                }
            }

            div { class: "flex flex-1 relative max-w-[1920px] mx-auto w-full",
                Sidebar {
                    is_open: is_sidebar_open(),
                    on_close: move |_| {
                        is_sidebar_open.set(false);
                    }
                }

                main { class: "flex-1 w-full min-w-0 bg-charcoal-base z-10",
                    Outlet::<Route> {}
                }
            }
        }
    }
}

// Stub pages
#[component]
fn Home() -> Element {
    rsx! {
        div { class: "p-8",
            h1 { class: "text-h1 font-heading text-clay-white mb-4", "Welcome to YOKK" }
            p { class: "text-body text-clay-white/70", "The community platform for African builders." }
        }
    }
}

#[component]
fn Explore() -> Element {
    rsx! { div { class: "p-8 text-clay-white", "Explore" } }
}

#[component]
fn Community() -> Element {
    rsx! { div { class: "p-8 text-clay-white", "Community" } }
}

#[component]
fn Launch() -> Element {
    rsx! { div { class: "p-8 text-clay-white", "Launches" } }
}

#[component]
fn Trending() -> Element {
    rsx! { div { class: "p-8 text-clay-white", "Trending" } }
}

#[component]
fn PageNotFound(route: Vec<String>) -> Element {
    rsx! {
        div { class: "p-8 flex flex-col items-center justify-center min-h-[50vh]",
            h1 { class: "text-h1 text-terracotta-primary mb-4", "404" }
            p { class: "text-clay-white/70", "Page not found" }
            pre { "{route:?}" }
        }
    }
}

#[allow(clippy::expect_used)]
fn main() {
    dioxus_logger::init(Level::INFO).expect("failed to init logger");
    log::info!("Starting Yokk Mobile...");
    launch(App);
}
