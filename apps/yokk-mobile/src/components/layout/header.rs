#![allow(non_snake_case)]

use crate::components::ui::icon::Icon;
use dioxus::prelude::*;

#[derive(Props, Clone, PartialEq)]
pub struct HeaderProps {
    #[props(into)]
    pub on_menu_click: Option<EventHandler<MouseEvent>>,
}

#[component]
pub fn Header(props: HeaderProps) -> Element {
    let mut search_query = use_signal(String::new);
    let mut is_search_expanded = use_signal(|| false);
    let mut theme: Signal<String> = use_context();

    // In a full implementation, this integrates with Dioxus router and an Auth provider context
    let is_authenticated = false;

    let toggle_theme = move |_| {
        let new_theme = if theme() == "dark" { "light" } else { "dark" };
        theme.set(new_theme.to_string());
        // In a real app we'd interact with local_storage / document.documentElement here
    };

    rsx! {
        header {
            class: "sticky top-0 z-50 w-full transition-all duration-300 bg-surface/80 backdrop-blur-md border-b border-divider",
            div {
                class: "max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8",
                div {
                    class: "flex items-center justify-between h-16 sm:h-20",

                    // Left: Mobile Menu + Logo
                    div {
                        class: "flex items-center gap-3 sm:gap-4",
                        button {
                            onclick: move |evt| {
                                if let Some(handler) = &props.on_menu_click {
                                    handler.call(evt);
                                }
                            },
                            class: "lg:hidden p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface border border-transparent hover:border-divider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50",
                            "aria-label": "Toggle menu",
                            Icon { name: "menu" }
                        }

                        a { // Route to /
                            href: "#",
                            class: "flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50 rounded-lg",
                            div {
                                class: "relative",
                                div {
                                    class: "font-heading font-black text-2xl tracking-tighter text-primary group-hover:text-terracotta-primary transition-colors",
                                    "YOKK"
                                }
                            }
                        }
                    }

                    // Center: Search Bar
                    div {
                        class: "flex-1 max-w-xl mx-4 sm:mx-8",
                        div {
                            class: "relative",
                            div {
                                class: "relative flex items-center style-width-transition",
                                style: if is_search_expanded() { "width: 100%" } else { "width: auto" },
                                Icon {
                                    name: "search",
                                    class: "absolute left-3 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 text-secondary pointer-events-none"
                                }
                                input {
                                    r#type: "text",
                                    placeholder: "Search questions, launches, people...",
                                    value: "{search_query}",
                                    oninput: move |evt| search_query.set(evt.value()),
                                    onfocus: move |_| is_search_expanded.set(true),
                                    onblur: move |_| {
                                        if search_query().is_empty() {
                                            is_search_expanded.set(false);
                                        }
                                    },
                                    class: "w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 bg-background hover:bg-surface border border-divider hover:border-primary/20 rounded-lg text-primary text-sm sm:text-base placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50 focus:border-terracotta-primary/50 focus:bg-surface transition-all duration-200"
                                }
                            }
                        }
                    }

                    // Right: Theme Toggle + User
                    div {
                        class: "flex items-center gap-2 sm:gap-3",
                        button {
                            onclick: toggle_theme,
                            class: "relative p-2 sm:p-2.5 rounded-lg bg-background hover:bg-surface border border-divider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50 group text-secondary hover:text-primary",
                            if theme() == "dark" {
                                Icon { name: "sun", class: "w-5 h-5 transition-transform group-hover:rotate-12" }
                            } else {
                                Icon { name: "moon", class: "w-5 h-5 transition-transform group-hover:-rotate-12" }
                            }
                        }

                        if !is_authenticated {
                            div {
                                class: "hidden sm:block",
                                a {
                                    href: "#", // Route to /login
                                    class: "flex items-center gap-2 px-5 py-2.5 bg-primary text-background hover:opacity-90 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50 group",
                                    span { class: "text-sm font-bold tracking-wide", "Sign In" }
                                }
                            }
                        } else {
                            div {
                                class: "hidden sm:block",
                                button {
                                    class: "flex items-center gap-2 px-4 py-2 bg-background hover:bg-surface border border-divider rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50 group",
                                    div {
                                        class: "w-8 h-8 rounded-full bg-terracotta-primary flex items-center justify-center text-background font-bold text-xs",
                                        "GU"
                                    }
                                    span { class: "text-sm font-medium text-primary", "Guest" }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
