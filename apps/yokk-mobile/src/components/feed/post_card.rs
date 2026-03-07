use crate::components::feed::voice_player::VoicePlayer;
use crate::components::ui::button::{Button, ButtonSize, ButtonVariant};
use crate::components::ui::icon::Icon;
use crate::models::feed::FeedItem;
use dioxus::prelude::*;

#[derive(Props, Clone, PartialEq)]
pub struct PostCardProps {
    pub post: FeedItem,
}

#[component]
pub fn PostCard(props: PostCardProps) -> Element {
    let post = &props.post;

    // Check if it's a showcase/featured item
    let is_featured = post.item_type == "launch" || post.item_type == "showcase";
    let is_bo_summary = post.item_type == "bo_summary";
    let has_image = !post.image_url.is_empty();

    let category = post
        .tags
        .first()
        .cloned()
        .unwrap_or_else(|| "other".to_string());

    // Using a simplified time ago for mock
    let time_ago = "2h ago";

    if is_bo_summary {
        // Supreme Minimalist Bo AI Summary Card
        rsx! {
            article {
                class: "p-4 sm:p-5 rounded-2xl bg-surface border border-divider relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow",
                div {
                    class: "absolute -top-10 -right-10 w-32 h-32 bg-sunset-gradient blur-[60px] opacity-10 dark:opacity-20"
                }
                div {
                    class: "flex items-center gap-2 mb-4",
                    div {
                        class: "h-8 w-8 rounded-full bg-terracotta-primary flex items-center justify-center shadow-glow border-2 border-terracotta-primary/30",
                        Icon { name: "Sparkles", class: "h-4 w-4 text-background animate-pulse" }
                    }
                    span { class: "text-xs font-black tracking-widest text-terracotta-primary uppercase", "Bo AI Intelligence" }
                    span { class: "text-[10px] text-secondary ml-auto block border border-divider px-2 py-0.5 rounded-full font-medium", "AI SYNTHESIS" }
                }
                h3 { class: "text-lg sm:text-xl font-heading font-bold text-primary mb-2 tracking-tight", "{post.title}" }
                p { class: "text-primary/80 font-body text-sm sm:text-base leading-relaxed", "{post.excerpt}" }

                div {
                    class: "mt-4 pt-4 border-t border-divider flex items-center justify-between",
                    div {
                        class: "flex gap-2 flex-wrap",
                        for tag in post.tags.iter() {
                            span {
                                class: "px-2 py-1 rounded bg-background border border-divider text-[10px] font-medium text-secondary uppercase",
                                "{tag}"
                            }
                        }
                    }
                    Button {
                        variant: ButtonVariant::Ghost, size: ButtonSize::Sm, class: "text-terracotta-primary hover:bg-terracotta-primary/10 font-bold px-3 border border-terracotta-primary/20 rounded-lg",
                        "Chat with Bo"
                        Icon { name: "Sparkles", class: "w-4 h-4 ml-1.5" }
                    }
                }
            }
        }
    } else if is_featured && has_image {
        // Featured / Bilibili style big card
        rsx! {
            article {
                class: "rounded-2xl overflow-hidden group border border-divider bg-surface hover:shadow-md transition-all duration-300",

                div {
                    class: "relative aspect-video overflow-hidden",
                    img {
                        src: "{post.image_url}",
                        alt: "{post.title}",
                        class: "w-full h-full object-cover transition-transform group-hover:scale-105"
                    }
                    div {
                        class: "absolute top-3 left-3 flex flex-wrap gap-2",
                        span {
                            class: "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-background text-primary border border-divider tracking-wider",
                            "{category.to_uppercase()}"
                        }
                        span {
                            class: "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-terracotta-primary text-background border-0 tracking-wider",
                            Icon { name: "Sparkles", class: "h-3 w-3 mr-1" }
                            "FEATURED"
                        }
                    }
                }

                div {
                    class: "p-4 sm:p-5 bg-surface",
                    a {
                        href: "#",
                        class: "block mb-2 group-hover:opacity-90 transition-opacity",
                        h2 {
                            class: "text-lg sm:text-xl font-heading font-bold text-primary leading-tight mb-2 line-clamp-2 hover:text-terracotta-primary transition-colors",
                            "{post.title}"
                        }
                    }
                    p {
                        class: "text-secondary font-body line-clamp-2 mb-6 sm:text-sm",
                        "{post.excerpt}"
                    }

                    div {
                        class: "flex items-center justify-between",
                        a {
                            href: "#",
                            class: "flex items-center gap-2 group/author",
                            div {
                                class: "h-8 w-8 rounded-full border border-divider group-hover/author:border-terracotta-primary transition-colors overflow-hidden bg-background flex items-center justify-center",
                                if !post.avatar.is_empty() {
                                    img { src: "{post.avatar}", class: "w-full h-full object-cover" }
                                } else {
                                    span { class: "text-primary font-medium text-xs", "{post.author.chars().next().unwrap_or('A')}" }
                                }
                            }
                            div {
                                p {
                                    class: "text-sm font-medium text-primary group-hover/author:text-terracotta-primary transition-colors tracking-tight",
                                    "{post.author}"
                                }
                                p {
                                    class: "text-xs text-secondary",
                                    "{time_ago}"
                                }
                            }
                        }

                        div {
                            class: "flex items-center gap-2 mt-4",
                            Button {
                                variant: ButtonVariant::Secondary,
                                size: ButtonSize::Sm,
                                class: "h-9 px-4 rounded-full bg-background border border-divider text-primary hover:border-primary/30 font-medium",
                                Icon { name: "ArrowUp", class: "h-4 w-4 mr-1.5 text-secondary" }
                                span { class: "text-sm", "{post.votes}" }
                            }
                            Button {
                                variant: ButtonVariant::Secondary,
                                size: ButtonSize::Sm,
                                class: "h-9 px-4 rounded-full bg-background border border-divider text-primary hover:border-primary/30 font-medium",
                                Icon { name: "MessageCircle", class: "h-4 w-4 mr-1.5 text-secondary" }
                                span { class: "text-sm", "{post.comments}" }
                            }
                            Button {
                                variant: ButtonVariant::Secondary,
                                size: ButtonSize::Sm,
                                class: "h-9 px-4 rounded-full bg-background border border-divider text-primary hover:border-primary/30 font-medium",
                                Icon { name: "Share2", class: "h-4 w-4 mr-1.5 text-secondary" }
                                span { class: "text-sm", "Share" }
                            }

                            // The Grok-like @Bo Summoner
                            Button {
                                variant: ButtonVariant::Secondary,
                                size: ButtonSize::Sm,
                                class: "h-9 px-4 rounded-full ml-auto bg-terracotta-primary/10 border border-terracotta-primary/20 text-terracotta-primary hover:bg-terracotta-primary/20 font-bold tracking-tight shadow-sm",
                                Icon { name: "Sparkles", class: "h-4 w-4 mr-1.5" }
                                span { class: "text-sm", "Ask @Bo" }
                            }
                        }
                    }
                }
            }
        }
    } else {
        // Compact / X style discussion card
        rsx! {
            article {
                class: "rounded-xl p-5 bg-background border border-divider group hover:bg-surface transition-colors cursor-pointer shadow-none relative",
                div {
                    class: "flex gap-3",
                    a {
                        href: "#",
                        class: "flex-shrink-0",
                        div {
                            class: "h-10 w-10 rounded-full border border-divider overflow-hidden bg-surface flex items-center justify-center",
                            if !post.avatar.is_empty() {
                                img { src: "{post.avatar}", class: "w-full h-full object-cover bg-surface" }
                            } else {
                                span { class: "text-primary font-medium text-sm", "{post.author.chars().next().unwrap_or('A')}" }
                            }
                        }
                    }
                    div {
                        class: "flex-1 min-w-0",
                        div {
                            class: "flex items-center gap-2 mb-1 flex-wrap",
                            a {
                                href: "#",
                                class: "font-semibold text-primary hover:text-terracotta-primary transition-colors text-sm",
                                "{post.author}"
                            }
                            span { class: "text-secondary/70 text-xs font-medium", "@{post.author.to_lowercase().replace(' ', \"\")}" }
                            span { class: "text-divider text-xs", "·" }
                            span { class: "text-secondary text-xs", "{time_ago}" }
                            span {
                                class: "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ml-auto font-medium text-secondary bg-surface border border-divider tracking-wider uppercase",
                                "{category.to_uppercase()}"
                            }
                        }

                        a {
                            href: "#",
                            class: "block mb-2 group-hover:opacity-90 transition-opacity",
                            if !post.title.is_empty() {
                                h3 { class: "text-base font-bold text-primary mb-2", "{post.title}" }
                            }
                            p { class: "text-primary/90 font-body text-sm whitespace-pre-wrap leading-relaxed", "{post.excerpt}" }
                        }

                        if has_image {
                            div {
                                class: "rounded-xl overflow-hidden mb-4 border border-divider mt-2",
                                img {
                                    src: "{post.image_url}",
                                    class: "w-full max-h-80 object-cover"
                                }
                            }
                        }

                        if post.has_voice {
                            div {
                                class: "mb-3",
                                VoicePlayer {
                                    duration: post.voice_duration.clone().unwrap_or_else(|| "0:00".into()),
                                    transcription: post.transcription.clone()
                                }
                            }
                        }

                        div {
                            class: "flex items-center gap-2 mt-4 pt-3 border-t border-divider/50",
                            Button {
                                variant: ButtonVariant::Secondary,
                                size: ButtonSize::Sm,
                                class: "h-9 px-3 sm:px-4 rounded-full bg-surface border border-divider text-primary hover:border-primary/30 font-medium transition-all shadow-sm flex-1 sm:flex-none justify-center",
                                Icon { name: "MessageCircle", class: "h-4 w-4 mr-1.5 text-secondary" }
                                span { class: "text-sm", "{post.comments}" }
                            }
                            Button {
                                variant: ButtonVariant::Secondary,
                                size: ButtonSize::Sm,
                                class: "h-9 px-3 sm:px-4 rounded-full bg-surface border border-divider text-primary hover:border-primary/30 font-medium transition-all shadow-sm flex-1 sm:flex-none justify-center",
                                Icon { name: "ArrowUp", class: "h-4 w-4 mr-1.5 text-secondary" }
                                span { class: "text-sm", "{post.votes}" }
                            }
                            Button {
                                variant: ButtonVariant::Secondary,
                                size: ButtonSize::Icon,
                                class: "h-9 w-9 shrink-0 rounded-full bg-surface border border-divider text-primary hover:border-primary/30 transition-all shadow-sm",
                                Icon { name: "Share2", class: "h-4 w-4 text-secondary" }
                            }

                            // The Grok-like @Bo Summoner
                            Button {
                                variant: ButtonVariant::Secondary,
                                size: ButtonSize::Sm,
                                class: "h-9 px-4 rounded-full ml-auto bg-terracotta-primary border border-terracotta-primary text-background hover:bg-terracotta-primary/90 font-bold tracking-tight shadow-md flex shrink-0 items-center justify-center group/bo",
                                Icon { name: "Sparkles", class: "h-4 w-4 mr-1.5 group-hover/bo:animate-pulse" }
                                span { class: "text-sm", "Ask @Bo" }
                            }
                        }
                    }
                }
            }
        }
    }
}
