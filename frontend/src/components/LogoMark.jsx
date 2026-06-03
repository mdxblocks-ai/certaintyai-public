// Phase 1.5.5 — Real CertaintyAI / MDxBlocks brand mark.
//
// We replaced the SVG approximation with the actual brand mark that
// lives in /CAI-AIP/Logos/CAI_Logo-WithoutText.png. The PNG was processed
// to transparent background and recolored variants saved into
// /frontend/public/:
//   certaintyai-logo-cyan.png   ← default, for dark backgrounds
//   certaintyai-logo-navy.png   ← original brand navy on transparent bg
//   certaintyai-logo-white.png  ← white variant for print / report header
//
// The component keeps the same {className, title} props as before so
// Navbar / Hero / Footer continue to work without any change.
export default function LogoMark({
  className = 'w-10 h-10',
  title = 'CertaintyAI',
}) {
  const isDark = className.includes('text-cyan-400')
  const src = isDark ? '/certaintyai-logo-cyan.png' : '/CAI_Logo-WithoutText.png'

  return (
    <img
      src={src}
      alt={title}
      className={`${className} object-contain select-none`}
      draggable={false}
    />
  )
}
