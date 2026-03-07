use crate::components::ui::button::{Button, ButtonVariant};
use crate::components::ui::icon::Icon;
use dioxus::prelude::*;

#[component]
pub fn FeedHero() -> Element {
    rsx! {
        div {
            class: "glass-card mb-6 rounded-2xl overflow-hidden relative group",
            div {
                class: "absolute inset-0 bg-gradient-to-r from-terracotta-base/20 to-indigo-500/10 z-0",
            }
            div {
                class: "absolute -top-24 -right-24 w-64 h-64 bg-savanna-gold/20 rounded-full blur-3xl opacity-50 z-0 group-hover:opacity-70 transition-opacity duration-700",
            }

            div {
                class: "relative z-10 p-6 sm:p-8",
                div {
                    class: "flex items-center gap-2 mb-4",
                    span {
                        class: "inline-flex items-center justify-center p-1.5 rounded-lg bg-terracotta-base/20 text-terracotta-light border border-terracotta-base/30",
                        Icon { name: "Flame", class: "w-4 h-4" }
                    }
                    span {
                        class: "text-sm font-semibold text-clay-white tracking-widest uppercase",
                        "YOKK · Built for Africa"
                    }
                }

                h1 {
                    class: "text-2xl sm:text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-clay-white to-clay-white/70 leading-tight mb-3",
                    "Offline-first, bandwidth-aware community."
                }

                p {
                    class: "text-clay-white/70 mb-6 font-body text-sm sm:text-base max-w-lg",
                    "Join the fastest growing builder community in Dakar and beyond. Showcase your launches, discuss architecture, and upvote the best ideas."
                }

                div {
                    class: "flex flex-wrap items-center gap-3",
                    Button {
                        class: "bg-terracotta-base hover:bg-terracotta-dark text-white border-0",
                        "Start Building"
                    }
                    Button {
                        variant: ButtonVariant::Outline,
                        class: "border-white/20 text-clay-white hover:bg-white/10 hover:text-white",
                        Icon { name: "Sparkles", class: "w-4 h-4 mr-2" }
                        "Explore Tech"
                    }
                }
            }
        }
    }
}
