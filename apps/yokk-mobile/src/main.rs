#![allow(non_snake_case)]

use dioxus::prelude::*;
use dioxus_logger::tracing::Level;

mod components;
mod models;

use components::feed::{hero::FeedHero, post_card::PostCard};
use components::layout::{create_drawer::CreateDrawer, header::Header, sidebar::Sidebar};
use models::feed::FeedItem;

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
    use_context_provider(|| Signal::new("dark".to_string()));

    rsx! {
        document::Link { rel: "stylesheet", href: asset!("/assets/tailwind.css") }
        document::Link { rel: "preconnect", href: "https://fonts.googleapis.com" }
        document::Link { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" }
        document::Link { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Grotesk:wght@300..700&display=swap" }

        Router::<Route> {}
    }
}

#[component]
fn MainLayout() -> Element {
    let mut is_sidebar_open = use_signal(|| false);
    let mut is_create_drawer_open = use_signal(|| false);
    let theme = use_context::<Signal<String>>();

    rsx! {
        div {
            class: "{theme} min-h-screen bg-background text-primary flex flex-col font-body",

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
                    },
                    on_new_post: move |_| {
                        if is_sidebar_open() {
                            is_sidebar_open.set(false);
                        }
                        is_create_drawer_open.set(true);
                    }
                }

                main { class: "flex-1 w-full min-w-0 bg-background z-10",
                    Outlet::<Route> {}
                }
            }

            CreateDrawer {
                is_open: is_create_drawer_open(),
                on_close: move |_| is_create_drawer_open.set(false),
            }
        }
    }
}

// Stub pages
#[component]
fn Home() -> Element {
    let mock_feed = FeedItem::mock_data();

    rsx! {
        div { class: "w-full overflow-y-auto pb-20 lg:pb-8",
            // The Premium Afro-futurist Hero Banner
            FeedHero {}

            // The Dynamic Feed Items (PostCards + AI Summaries + Launches)
            div { class: "max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 flex flex-col gap-6",
                for item in mock_feed {
                    PostCard { key: "{item.id}", post: item }
                }
            }
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
