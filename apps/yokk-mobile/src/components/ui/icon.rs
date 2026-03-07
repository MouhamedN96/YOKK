#![allow(non_snake_case)]

use dioxus::prelude::*;

#[derive(Props, Clone, PartialEq)]
pub struct IconProps {
    /// Lucide-compatible icon name (e.g., "search", "sun", "moon", "user", "menu")
    pub name: String,
    #[props(default = "".to_string())]
    pub color: String,
    #[props(default = 24)]
    pub size: u32,
    #[props(default = "".to_string())]
    pub class: String,
}

#[component]
pub fn Icon(props: IconProps) -> Element {
    let size = props.size;
    let color = props.color;
    let class = props.class;

    // We handle the immediate required SVG paths directly.
    // In a full conversion, a crate like dioxus-free-icons or lucide-rust would be used.
    let path_data = match props.name.as_str() {
        "search" => "M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19ZM21 21L16.65 16.65",
        "sun" => "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
        "moon" => "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
        "user" => "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
        "menu" => "M4 12h16M4 6h16M4 18h16",
        "log-out" => "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
        "settings" => "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1zM12 15a3 3 0 100-6 3 3 0 000 6z",
        "home" => "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
        "compass" => "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 11c0-1.66-1.34-3-3-3S6 9.34 6 11s1.34 3 3 3 3-1.34 3-3z", // Not true compass, using shield/circle approx
        "users" => "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
        "rocket" => "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2zM9 12l2 2M12 15l-3-3",
        "trophy" => "M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z",
        "plus-circle" => "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 8v8M8 12h8",
        "sparkles" => "M12 3l1.91 5.8a2 2 0 001.29 1.29L21 12l-5.8 1.91a2 2 0 00-1.29 1.29L12 21l-1.91-5.8a2 2 0 00-1.29-1.29L3 12l5.8-1.91a2 2 0 001.29-1.29L12 3zM18 4l.95 2.89a1 1 0 00.65.65L22.5 8.5l-2.9.96a1 1 0 00-.65.65L18 13l-.96-2.89a1 1 0 00-.65-.65L13.5 8.5l2.89-.95a1 1 0 00.65-.65L18 4z",
        _ => "M10 8h4M12 6v4M12 14v.01", // fallback to plus/alert
    };

    rsx! {
        svg {
            xmlns: "http://www.w3.org/2000/svg",
            width: "{size}",
            height: "{size}",
            view_box: "0 0 24 24",
            fill: "none",
            stroke: "{color}",
            stroke_width: "2",
            stroke_linecap: "round",
            stroke_linejoin: "round",
            class: "{class}",
            path { d: "{path_data}" }
        }
    }
}
