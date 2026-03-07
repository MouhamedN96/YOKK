use crate::components::ui::button::{Button, ButtonSize, ButtonVariant};
use crate::components::ui::icon::Icon;
use dioxus::prelude::*;

#[derive(Props, Clone, PartialEq)]
pub struct CreateDrawerProps {
    #[props(default = false)]
    pub is_open: bool,
    #[props(into)]
    pub on_close: Option<EventHandler<MouseEvent>>,
}

#[component]
pub fn CreateDrawer(props: CreateDrawerProps) -> Element {
    rsx! {
        if props.is_open {
            div { class: "fixed inset-0 z-[9999] flex",
                // Backdrop
                div {
                    class: "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
                    onclick: move |evt| {
                        if let Some(handler) = &props.on_close {
                            handler.call(evt);
                        }
                    }
                }

                // Drawer Content -> Slide up from bottom
                div {
                    class: "relative mt-auto h-[90vh] w-full bg-background rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border-t-2 border-divider transition-transform duration-300",

                    // Header
                    div {
                        class: "h-14 flex items-center justify-between px-6 border-b border-divider bg-surface",
                        div { class: "flex items-center gap-2 text-primary font-heading font-bold",
                            Icon { name: "PenTool", class: "w-5 h-5 text-terracotta-primary" }
                            "Create"
                        }
                        Button {
                            variant: ButtonVariant::Ghost,
                            size: ButtonSize::Icon,
                            class: "rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-secondary",
                            onclick: move |evt| {
                                if let Some(handler) = &props.on_close {
                                    handler.call(evt);
                                }
                            },
                            Icon { name: "X", class: "w-5 h-5 text-primary" }
                        }
                    }

                    // Body (Notebook LM Style)
                    div {
                        class: "flex-1 flex flex-col md:flex-row overflow-hidden",

                        // Left Pane: Context Dropzone (Sources)
                        div {
                            class: "w-full md:w-1/3 bg-surface border-r border-divider flex flex-col p-4 sm:p-6 gap-4 overflow-y-auto",

                            div { class: "text-xs font-bold text-secondary uppercase tracking-wider mb-2", "Source Material" }

                            // Mock Source Item 1
                            div { class: "p-3 rounded-xl border border-divider bg-background flex items-center gap-3",
                                div { class: "h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0",
                                    Icon { name: "Link", class: "w-5 h-5" }
                                }
                                div { class: "flex-1 min-w-0 flex flex-col",
                                    span { class: "text-sm font-semibold truncate text-primary", "AWS SDK Rust Docs" }
                                    span { class: "text-xs text-secondary truncate", "docs.aws.amazon.com" }
                                }
                            }

                            // Mock Source Item 2
                            div { class: "p-3 rounded-xl border border-divider bg-background flex items-center gap-3",
                                div { class: "h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0",
                                    Icon { name: "Image", class: "w-5 h-5" }
                                }
                                div { class: "flex-1 min-w-0 flex flex-col",
                                    span { class: "text-sm font-semibold truncate text-primary", "architecture-v2.png" }
                                    span { class: "text-xs text-secondary truncate", "2.4 MB" }
                                }
                            }

                            // Dropzone Area
                            div {
                                class: "mt-auto p-6 rounded-xl border-2 border-dashed border-divider bg-background text-center flex flex-col items-center justify-center text-secondary hover:border-primary/30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer min-h-[140px]",
                                Icon { name: "Plus", class: "w-6 h-6 mb-2" }
                                span { class: "text-sm font-medium", "Drop links, images, or files" }
                            }
                        }

                        // Right Pane: Ideation Space
                        div {
                            class: "flex-1 flex flex-col bg-background relative",

                            textarea {
                                class: "flex-1 w-full bg-transparent p-6 sm:p-8 text-primary placeholder:text-secondary/50 resize-none outline-none font-body text-lg sm:text-xl leading-relaxed",
                                placeholder: "Synthesize your thoughts..."
                            }

                            // Toolbar / Bo AI Synthesis Action
                            div {
                                class: "h-16 border-t border-divider bg-surface px-4 sm:px-6 flex items-center justify-between",
                                div { class: "flex items-center gap-2",
                                    Button {
                                        variant: ButtonVariant::Ghost, size: ButtonSize::Icon, class: "text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5",
                                        Icon { name: "Type", class: "w-5 h-5" }
                                    }
                                    Button {
                                        variant: ButtonVariant::Ghost, size: ButtonSize::Icon, class: "text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5",
                                        Icon { name: "List", class: "w-5 h-5" }
                                    }
                                }

                                div { class: "flex items-center gap-3",
                                    // Bo AI Synthesis Action
                                    Button {
                                        variant: ButtonVariant::Secondary,
                                        size: ButtonSize::Default,
                                        class: "bg-terracotta-primary border-terracotta-primary text-background hover:bg-terracotta-primary/90 font-bold tracking-tight shadow-md flex items-center gap-2 rounded-full px-4",
                                        Icon { name: "Sparkles", class: "w-4 h-4 animate-pulse" }
                                        "Bo Synthesis"
                                    }
                                    Button {
                                        variant: ButtonVariant::Default,
                                        size: ButtonSize::Default,
                                        class: "bg-primary text-background hover:opacity-90 font-bold rounded-full px-6",
                                        "Post"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
