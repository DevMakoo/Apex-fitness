import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";

// A single, continuous procedural sculpture — a fragment of an athletic
// torso built by lofting cross-sectional rings from waist to shoulder,
// in the spirit of classical "fragment" sculptures (torso only, no head,
// no hands, no complete limbs — e.g. the Belvedere Torso convention),
// rather than a fully assembled humanoid figure. Two short arm stubs are
// welded on by deliberately overlapping their base well inside the
// shoulder volume, so there is no visible seam between them and the torso.
// Everything is generated into ONE BufferGeometry / ONE material — no
// external model, no texture. See
// docs/superpowers/specs/2026-08-29-apex-fitness-architecture-design.md §7.

const RING_COUNT = 14;
const SEGMENTS = 24;
const TORSO_HEIGHT = 1.9;
const LEAN_X = 0.09;

// [t, radiusX, radiusZ] — waist (t=0) to shoulder line (t=1)
const RADIUS_KEYFRAMES: Array<[number, number, number]> = [
  [0.0, 0.34, 0.22],
  [0.25, 0.36, 0.24],
  [0.45, 0.4, 0.26],
  [0.65, 0.46, 0.3],
  [0.85, 0.52, 0.28],
  [1.0, 0.6, 0.24],
];

function sampleRadius(t: number): [number, number] {
  for (let i = 0; i < RADIUS_KEYFRAMES.length - 1; i += 1) {
    const [t0, rx0, rz0] = RADIUS_KEYFRAMES[i];
    const [t1, rx1, rz1] = RADIUS_KEYFRAMES[i + 1];
    if (t >= t0 && t <= t1) {
      const localT = (t - t0) / (t1 - t0);
      const eased = 0.5 - 0.5 * Math.cos(localT * Math.PI);
      return [rx0 + (rx1 - rx0) * eased, rz0 + (rz1 - rz0) * eased];
    }
  }
  const [, rx, rz] = RADIUS_KEYFRAMES[RADIUS_KEYFRAMES.length - 1];
  return [rx, rz];
}

function addArmStub(
  positions: number[],
  indices: number[],
  origin: Vector3,
  direction: Vector3,
  length: number,
  startRadius: number,
  endRadius: number
) {
  const segments = 12;
  const ringCount = 4;
  const quat = new Quaternion().setFromUnitVectors(
    new Vector3(0, -1, 0),
    direction.clone().normalize()
  );
  const baseIndex = positions.length / 3;

  for (let ring = 0; ring < ringCount; ring += 1) {
    const t = ring / (ringCount - 1);
    const radius = startRadius + (endRadius - startRadius) * t;
    for (let seg = 0; seg < segments; seg += 1) {
      const angle = (seg / segments) * Math.PI * 2;
      const local = new Vector3(Math.cos(angle) * radius, -t * length, Math.sin(angle) * radius);
      local.applyQuaternion(quat).add(origin);
      positions.push(local.x, local.y, local.z);
    }
  }

  for (let ring = 0; ring < ringCount - 1; ring += 1) {
    const a0 = baseIndex + ring * segments;
    const a1 = baseIndex + (ring + 1) * segments;
    for (let seg = 0; seg < segments; seg += 1) {
      const segNext = (seg + 1) % segments;
      indices.push(a0 + seg, a1 + seg, a0 + segNext);
      indices.push(a0 + segNext, a1 + seg, a1 + segNext);
    }
  }

  const tipIndex = positions.length / 3;
  const tip = new Vector3(0, -length, 0).applyQuaternion(quat).add(origin);
  positions.push(tip.x, tip.y, tip.z);
  const lastRingStart = baseIndex + (ringCount - 1) * segments;
  for (let seg = 0; seg < segments; seg += 1) {
    const segNext = (seg + 1) % segments;
    indices.push(tipIndex, lastRingStart + seg, lastRingStart + segNext);
  }
}

function buildSculptureGeometry(): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const ringStart: number[] = [];

  for (let ring = 0; ring < RING_COUNT; ring += 1) {
    const t = ring / (RING_COUNT - 1);
    const y = t * TORSO_HEIGHT;
    const [radiusX, radiusZ] = sampleRadius(t);
    const centerX = LEAN_X * t;
    const centerZ = 0.05 * Math.sin(t * Math.PI);
    const twist = 0.5 * t;
    const shoulderLiftStrength = t > 0.75 ? (t - 0.75) * 0.5 : 0;

    ringStart.push(positions.length / 3);

    for (let seg = 0; seg < SEGMENTS; seg += 1) {
      const angle = (seg / SEGMENTS) * Math.PI * 2 + twist;
      const undulation =
        1 + 0.035 * Math.sin(angle * 2 + ring * 0.6) + 0.02 * Math.sin(angle * 3 - ring * 0.35);
      const shoulderLift = Math.max(0, Math.cos(angle)) * shoulderLiftStrength;

      const x = centerX + Math.cos(angle) * radiusX * undulation;
      const z = centerZ + Math.sin(angle) * radiusZ * undulation;
      const yy = y + shoulderLift;

      positions.push(x, yy, z);
    }
  }

  for (let ring = 0; ring < RING_COUNT - 1; ring += 1) {
    const a0 = ringStart[ring];
    const a1 = ringStart[ring + 1];
    for (let seg = 0; seg < SEGMENTS; seg += 1) {
      const segNext = (seg + 1) % SEGMENTS;
      indices.push(a0 + seg, a1 + seg, a0 + segNext);
      indices.push(a0 + segNext, a1 + seg, a1 + segNext);
    }
  }

  // Bottom cap — a clean, deliberate "cut" at the waist.
  const bottomCenter = positions.length / 3;
  positions.push(0, 0, 0);
  for (let seg = 0; seg < SEGMENTS; seg += 1) {
    const segNext = (seg + 1) % SEGMENTS;
    indices.push(bottomCenter, ringStart[0] + segNext, ringStart[0] + seg);
  }

  // Top cap — follows the uneven shoulder line, reading as a natural fracture
  // rather than a flat mechanical cut.
  const topRingStart = ringStart[RING_COUNT - 1];
  let avgX = 0;
  let avgY = 0;
  let avgZ = 0;
  for (let seg = 0; seg < SEGMENTS; seg += 1) {
    avgX += positions[(topRingStart + seg) * 3];
    avgY += positions[(topRingStart + seg) * 3 + 1];
    avgZ += positions[(topRingStart + seg) * 3 + 2];
  }
  const topCenter = positions.length / 3;
  positions.push(avgX / SEGMENTS, avgY / SEGMENTS, avgZ / SEGMENTS);
  for (let seg = 0; seg < SEGMENTS; seg += 1) {
    const segNext = (seg + 1) % SEGMENTS;
    indices.push(topCenter, topRingStart + seg, topRingStart + segNext);
  }

  // Two short arm stubs, welded by overlapping their base well inside the
  // shoulder mass — asymmetric in angle and length so neither mirrors the
  // other exactly.
  const shoulderCenterX = LEAN_X;
  addArmStub(
    positions,
    indices,
    new Vector3(shoulderCenterX + 0.3, TORSO_HEIGHT - 0.08, 0.05),
    new Vector3(0.8, -0.45, 0.2),
    0.5,
    0.16,
    0.13
  );
  addArmStub(
    positions,
    indices,
    new Vector3(shoulderCenterX - 0.32, TORSO_HEIGHT - 0.22, 0.05),
    new Vector3(-0.75, -0.55, 0.12),
    0.42,
    0.155,
    0.12
  );

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const sculptureGeometry = buildSculptureGeometry();

const marbleMaterial = new MeshStandardMaterial({
  color: "#d9d3c6", // warm, neutral stone — not bright white
  roughness: 0.8,
  metalness: 0.03,
  // Safety net for the hand-authored triangle winding above: with a single
  // opaque mesh the fill-rate cost is negligible, and this guarantees the
  // surface is never back-face-culled into invisibility from any angle.
  side: DoubleSide,
});

export function HeroMesh() {
  return (
    <mesh geometry={sculptureGeometry} material={marbleMaterial} position={[0.95, -0.9, 0]} rotation={[0, -0.5, 0]} />
  );
}
