use crate::components::ui::button::{Button, ButtonSize, ButtonVariant};
use crate::components::ui::icon::Icon;
use dioxus::prelude::*;

#[derive(Props, Clone, PartialEq)]
pub struct VoicePlayerProps {
    #[props(default = false)]
    pub is_playing: bool,
    #[props(default = "0:00".to_string())]
    pub duration: String,
    pub transcription: Option<String>,
}

#[component]
pub fn VoicePlayer(props: VoicePlayerProps) -> Element {
    let mut is_playing = use_signal(|| props.is_playing);

    // Mock waveform data - usually this would be an array of floats
    let waveform_bars = vec![
        0.2, 0.4, 0.7, 0.5, 0.3, 0.8, 1.0, 0.6, 0.4, 0.2, 0.3, 0.5, 0.9, 0.7, 0.4, 0.2, 0.3, 0.6,
        0.8, 0.5, 0.3, 0.2,
    ];

    let opacity = if is_playing() { 1.0 } else { 0.5 };
    let bars_iter = waveform_bars.into_iter().enumerate().map(|(i, height)| {
        let h_pct = height * 100.0;
        rsx! {
            div {
                key: "{i}",
                class: format!(
                    "w-1 rounded-full transition-all duration-300 {}",
                    if is_playing() { "bg-terracotta-primary" } else { "bg-primary" }
                ),
                style: "height: {h_pct}%; opacity: {opacity};"
            }
        }
    });

    rsx! {
        div {
            class: "flex flex-col gap-3 p-4 rounded-xl bg-surface border-2 border-primary/5 hover:border-terracotta-primary/20 transition-all group relative",
            // Small badge to explicitly call out "VOICE"
            div {
                class: "absolute -top-2.5 right-4 bg-terracotta-primary text-background text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase",
                "Voice Note"
            }

            // Audio Player Controls & Waveform
            div {
                class: "flex items-center gap-3",

                // Play/Pause Button
                Button {
                    variant: ButtonVariant::Secondary,
                    size: ButtonSize::Icon,
                    class: format!(
                        "h-10 w-10 shrink-0 rounded-full border transition-colors flex items-center justify-center {}",
                        if is_playing() { "bg-terracotta-primary border-terracotta-primary text-background shadow-md" }
                        else { "bg-primary border-primary text-background hover:bg-terracotta-primary/90 hover:border-terracotta-primary" }
                    ),
                    onclick: move |_| is_playing.set(!is_playing()),
                    Icon {
                        name: if is_playing() { "Pause" } else { "Play" },
                        class: "h-4 w-4 ml-0.5" // tiny optical adjustment for the play triangle
                    }
                }

                // Haptic Waveform (Mock)
                div {
                    class: "flex-1 flex items-center justify-between h-8 gap-1 opacity-50 group-hover:opacity-100 transition-opacity",
                    {bars_iter}
                }

                // Duration Info
                div {
                    class: "text-xs font-medium font-body text-secondary tabular-nums shrink-0",
                    "{props.duration}"
                }
            }

            // Inline Transcription
            if let Some(text) = &props.transcription {
                div {
                    class: "flex items-start gap-2 mt-1 pt-3 border-t border-divider",
                    Icon {
                        name: "Text", // Using 'Text' or 'FileText' as a transcription indicator
                        class: "h-3.5 w-3.5 mt-0.5 text-secondary shrink-0"
                    }
                    div {
                        p {
                            class: "text-sm text-primary/80 font-body leading-relaxed",
                            "{text}"
                        }
                    }
                }
            }
        }
    }
}
