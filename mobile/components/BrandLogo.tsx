import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

/** Header brand mark: green circle with a white scan frame + crossed fork and spoon. */
export function BrandLogo({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      <Circle cx={14} cy={14} r={14} fill="#16a34a" />

      <G stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M6.5 10V6.5H10" />
        <Path d="M18 6.5h3.5V10" />
        <Path d="M6.5 18v3.5H10" />
        <Path d="M21.5 18v3.5H18" />
      </G>

      <G
        transform="translate(0 1) rotate(32 14 14) translate(14 14) scale(0.62) translate(-14 -14)"
        fill="#fff"
      >
        <Ellipse cx={14} cy={7.4} rx={2.9} ry={3.9} />
        <Rect x={13} y={10} width={2} height={11.5} rx={1} />
      </G>

      <G
        transform="translate(0 1) rotate(-32 14 14) translate(14 14) scale(0.62) translate(-14 -14)"
        fill="#fff"
      >
        <Rect x={11.6} y={7} width={4.8} height={3.6} rx={1} />
        <Rect x={11.8} y={3.4} width={1.3} height={4.6} rx={0.65} />
        <Rect x={13.35} y={3.4} width={1.3} height={4.6} rx={0.65} />
        <Rect x={14.9} y={3.4} width={1.3} height={4.6} rx={0.65} />
        <Rect x={13} y={9.6} width={2} height={11.9} rx={1} />
      </G>
    </Svg>
  );
}
