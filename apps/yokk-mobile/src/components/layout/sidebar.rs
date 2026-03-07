#![allow(non_snake_case)]

use crate::components::ui::icon::Icon;
use dioxus::prelude::*;

#[derive(Props, Clone, PartialEq)]
pub struct SidebarProps {
    #[props(default = true)]
    pub is_open: bool,
    #[props(into)]
    pub on_close: Option<EventHandler<MouseEvent>>,
    #[props(into)]
    pub on_new_post: Option<EventHandler<MouseEvent>>,
}

#[derive(Clone, PartialEq)]
struct NavItem {
    label: &'static str,
    href: &'static str,
    icon: &'static str,
    badge: Option<u32>,
}

#[component]
pub fn Sidebar(props: SidebarProps) -> Element {
    let current_path = use_signal(|| "/".to_string()); // Mocked routing state

    let nav_items = vec![
        NavItem {
            label: "Home",
            href: "/",
            icon: "home",
            badge: None,
        },
        NavItem {
            label: "Explore",
            href: "/explore",
            icon: "compass",
            badge: None,
        },
        NavItem {
            label: "Community",
            href: "/community",
            icon: "users",
            badge: Some(5),
        },
        NavItem {
            label: "Launches",
            href: "/launch",
            icon: "rocket",
            badge: None,
        },
        NavItem {
            label: "Trending",
            href: "/trending",
            icon: "trophy",
            badge: None,
        },
        NavItem {
            label: "Ask Bo AI",
            href: "/bo",
            icon: "sparkles",
            badge: Some(1), // Bo has a message for you!
        },
    ];

    let is_active = move |href: &str| -> bool {
        let path = current_path();
        if href == "/" {
            path == href
        } else {
            path.starts_with(href)
        }
    };

    rsx! {
        // Mobile Overlay
        if props.is_open {
            div {
                class: "lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm",
                onclick: move |evt| {
                    if let Some(handler) = &props.on_close {
                        handler.call(evt);
                    }
                }
            }
        }

        // Sidebar Panel
        aside {
            class: format!(
                "fixed lg:sticky top-0 left-0 z-50 h-[100dvh] lg:h-[calc(100vh-5rem)] w-64 lg:w-72 bg-surface/90 backdrop-blur-xl border-r border-divider flex flex-col pt-20 lg:pt-8 transition-transform duration-300 lg:transition-none {}",
                if props.is_open { "translate-x-0" } else { "-translate-x-full lg:translate-x-0" }
            ),

            // Header
            div { class: "px-6 mb-6",
                h2 { class: "text-xs font-semibold text-secondary uppercase tracking-wider mb-4", "Navigation" }
            }

            // Links
            nav { class: "flex-1 px-3 space-y-1 overflow-y-auto",
                for item in nav_items {
                    a { // TODO: use dioxus-router Link
                        key: "{item.href}",
                        href: "{item.href}",
                        class: format!(
                            "group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50 {}",
                            if is_active(item.href) { "bg-surface text-primary border border-divider shadow-sm" }
                            else { "text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5" }
                        ),
                        if is_active(item.href) {
                            div { class: "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary" }
                        }
                        div {
                            class: format!(
                                "relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 {}",
                                if is_active(item.href) && item.label == "Ask Bo AI" { "bg-terracotta-primary text-background shadow-glow" }
                                else if is_active(item.href) { "bg-primary text-background shadow-xs" }
                                else if item.label == "Ask Bo AI" { "bg-terracotta-primary/10 text-terracotta-primary group-hover:bg-terracotta-primary/20" }
                                else { "bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 text-secondary group-hover:text-primary" }
                            ),
                            Icon {
                                name: item.icon.to_string(),
                                class: format!(
                                    "relative w-5 h-5 {}",
                                    if is_active(item.href) { "text-background" }
                                    else if item.label == "Ask Bo AI" { "text-terracotta-primary" }
                                    else { "" }
                                )
                            }
                        }
                        span { class: format!("flex-1 font-medium text-sm {}", if is_active(item.href) { "text-primary" } else { "" }), "{item.label}" }
                        if let Some(count) = item.badge {
                            div {
                                class: format!(
                                    "flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-[10px] font-bold tracking-wider {}",
                                    if is_active(item.href) { "bg-background text-primary" }
                                    else { "bg-surface text-secondary border border-divider" }
                                ),
                                "{count}"
                            }
                        }
                    }
                }
            }

            // CTA Button Group
            div { class: "p-6 border-t border-divider flex flex-col gap-3",
                button {
                    class: "w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-background hover:opacity-90 rounded-lg font-medium transition-opacity focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50",
                    onclick: move |evt| {
                        if let Some(handler) = &props.on_new_post {
                            handler.call(evt);
                        }
                    },
                    Icon { name: "plus-circle", class: "w-5 h-5" }
                    span { "New Post" }
                }
                button {
                    class: "w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface border border-terracotta-primary/30 text-terracotta-primary hover:bg-terracotta-primary/10 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50 group",
                    onclick: move |evt| {
                        if let Some(handler) = &props.on_new_post {
                            handler.call(evt);
                        }
                    },
                    Icon { name: "mic", class: "w-5 h-5 group-hover:animate-pulse" }
                    span { "Drop Voice Note" }
                }
            }

            // User Stats
            div { class: "p-6 border-t border-divider",
                a {
                    href: "#",
                    div {
                        class: "p-4 rounded-lg bg-background hover:bg-surface border border-divider hover:shadow-sm transition-all cursor-pointer",
                        div { class: "flex items-center gap-3 mb-3",
                            div {
                                class: "w-10 h-10 rounded-full bg-terracotta-primary flex items-center justify-center text-background font-bold text-sm",
                                "GU"
                            }
                            div { class: "flex-1 min-w-0",
                                p { class: "text-sm font-semibold text-primary truncate", "Guest User" }
                                p { class: "text-xs text-secondary", "Visitor" }
                            }
                        }
                    }
                }
            }
        }
    }
}
