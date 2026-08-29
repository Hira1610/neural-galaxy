// Each palette drives node colors (leafA -> leafB gradient by importance),
// the root node color, and edge colors. A new palette is picked at random
// every time a graph is generated, so the galaxy never looks the same twice.

export const PALETTES = [
  { name: "Nebula Cyan", leafA: "#5eead4", leafB: "#8b7fff", root: "#ffd37a", edge: "#5eead4", highlight: "#ffd37a" },
  { name: "Solar Flare", leafA: "#ff8a5b", leafB: "#ff5b8a", root: "#ffe17a", edge: "#ff8a5b", highlight: "#ffe17a" },
  { name: "Emerald Circuit", leafA: "#5bff9d", leafB: "#5bd2ff", root: "#eaff5b", edge: "#5bff9d", highlight: "#eaff5b" },
  { name: "Magenta Pulse", leafA: "#ff5bd8", leafB: "#a15bff", root: "#5bf0ff", edge: "#ff5bd8", highlight: "#5bf0ff" },
  { name: "Crimson Grid", leafA: "#ff5b5b", leafB: "#ff9d5b", root: "#5bffea", edge: "#ff5b5b", highlight: "#5bffea" },
  { name: "Arctic Violet", leafA: "#7ad7ff", leafB: "#b47aff", root: "#ffb47a", edge: "#7ad7ff", highlight: "#ffb47a" },
  { name: "Golden Circuit", leafA: "#ffd76a", leafB: "#ff9d6a", root: "#6affd7", edge: "#ffd76a", highlight: "#6affd7" },
];

export function randomPalette(exclude) {
  const options = exclude ? PALETTES.filter((p) => p.name !== exclude.name) : PALETTES;
  return options[Math.floor(Math.random() * options.length)];
}

export const DEFAULT_PALETTE = PALETTES[0];
