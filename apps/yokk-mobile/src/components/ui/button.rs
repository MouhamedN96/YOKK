#![allow(non_snake_case)]

use dioxus::prelude::*;

#[allow(dead_code)]
#[derive(PartialEq, Clone, Copy, Default)]
pub enum ButtonVariant {
    #[default]
    Default,
    Destructive,
    Outline,
    Secondary,
    Ghost,
    Link,
}

#[allow(dead_code)]
#[derive(PartialEq, Clone, Copy, Default)]
pub enum ButtonSize {
    #[default]
    Default,
    Sm,
    Lg,
    Icon,
}

#[derive(Props, Clone, PartialEq)]
pub struct ButtonProps {
    #[props(default)]
    pub variant: ButtonVariant,
    #[props(default)]
    pub size: ButtonSize,
    #[props(default = String::new())]
    pub class: String,
    #[props(default = false)]
    pub disabled: bool,
    #[props(into)]
    pub onclick: Option<EventHandler<MouseEvent>>,
    pub children: Element,
}

#[component]
pub fn Button(props: ButtonProps) -> Element {
    let base_classes = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    let variant_classes = match props.variant {
        ButtonVariant::Default => "bg-terracotta-primary text-white hover:bg-terracotta-primary/90",
        ButtonVariant::Destructive => "bg-red-500 text-white hover:bg-red-600",
        ButtonVariant::Outline => {
            "border border-white/10 bg-transparent hover:bg-white/5 hover:text-clay-white"
        }
        ButtonVariant::Secondary => "bg-white/10 text-clay-white hover:bg-white/20",
        ButtonVariant::Ghost => "hover:bg-white/5 hover:text-clay-white",
        ButtonVariant::Link => "text-terracotta-primary underline-offset-4 hover:underline",
    };

    let size_classes = match props.size {
        ButtonSize::Default => "h-10 px-4 py-2",
        ButtonSize::Sm => "h-9 rounded-md px-3",
        ButtonSize::Lg => "h-11 rounded-md px-8",
        ButtonSize::Icon => "h-10 w-10",
    };

    let full_class = format!(
        "{} {} {} {}",
        base_classes, variant_classes, size_classes, props.class
    );

    rsx! {
        button {
            class: "{full_class}",
            disabled: props.disabled,
            onclick: move |evt| {
                if let Some(handler) = &props.onclick {
                    handler.call(evt);
                }
            },
            {props.children}
        }
    }
}
