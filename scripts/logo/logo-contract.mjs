export const logoContract = {
  brand: "Светлый",
  palette: {
    amber: "#E9A91B",
    ink: "#1C1C1B",
    paper: "#F7F3EB",
  },
  lockups: ["primary", "horizontal", "symbol", "micro", "official"],
  modes: ["color", "mono", "inverse"],
  pngExports: [
    { lockup: "primary", mode: "color", sizes: [96, 256, 300, 512, 1024] },
    { lockup: "horizontal", mode: "color", sizes: [512, 1024] },
    { lockup: "symbol", mode: "color", sizes: [64, 256, 512] },
    { lockup: "micro", mode: "color", sizes: [16, 32, 64, 180, 512] },
    { lockup: "primary", mode: "mono", sizes: [300, 512, 1024] },
    { lockup: "primary", mode: "inverse", sizes: [300, 512, 1024] },
  ],
  minimumSizes: {
    primary: 160,
    horizontal: 220,
    symbol: 64,
    micro: 16,
    official: 280,
  },
};

export function svgFilename(lockup, mode) {
  return `lightyar-${lockup}-${mode}.svg`;
}

export function pngFilename(lockup, mode, size) {
  return `lightyar-${lockup}-${mode}-${size}.png`;
}
