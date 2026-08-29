// Placeholder geometry — swap for the final art direction once it's chosen
// (see docs/superpowers/specs/2026-08-29-apex-fitness-architecture-design.md §7).
export function HeroMesh() {
  return (
    <mesh castShadow receiveShadow>
      <icosahedronGeometry args={[1.6, 1]} />
      <meshStandardMaterial color="#e5e5e5" roughness={0.25} metalness={0.6} flatShading />
    </mesh>
  );
}
