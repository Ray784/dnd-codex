(() => {
  const PHI = (1 + Math.sqrt(5)) / 2;

  function norm(v) {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }

  function buildMesh(rawV, rawF) {
    const v = rawV.map(norm);
    const faces = rawF.map((idxs) => {
      const copy = [...idxs];
      const cx = copy.reduce((s, i) => s + v[i][0], 0) / copy.length;
      const cy = copy.reduce((s, i) => s + v[i][1], 0) / copy.length;
      const cz = copy.reduce((s, i) => s + v[i][2], 0) / copy.length;
      const p0 = v[copy[0]], p1 = v[copy[1]], p2 = v[copy[2]];
      const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2];
      const bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2];
      let nx = ay * bz - az * by;
      let ny = az * bx - ax * bz;
      let nz = ax * by - ay * bx;
      if (nx * cx + ny * cy + nz * cz < 0) {
        copy.reverse();
        nx = -nx;
        ny = -ny;
        nz = -nz;
      }
      return { idxs: copy, n0: norm([nx, ny, nz]), num: 0 };
    });

    const n = faces.length;
    const used = new Array(n).fill(false);
    let lo = 1;
    let hi = n;
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      faces[i].num = lo++;
      let bestJ = -1;
      let bestDot = 2;
      for (let j = i + 1; j < n; j++) {
        if (used[j]) continue;
        const d =
          faces[i].n0[0] * faces[j].n0[0] +
          faces[i].n0[1] * faces[j].n0[1] +
          faces[i].n0[2] * faces[j].n0[2];
        if (d < bestDot) {
          bestDot = d;
          bestJ = j;
        }
      }
      if (bestJ !== -1) {
        used[bestJ] = true;
        faces[bestJ].num = hi--;
      }
    }
    return { v, faces };
  }

  function makeOctahedron() {
    const v = [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
    const f = [
      [0, 4, 2], [0, 2, 5], [0, 5, 3], [0, 3, 4],
      [1, 2, 4], [1, 5, 2], [1, 3, 5], [1, 4, 3]
    ];
    return buildMesh(v, f);
  }

  function makeD10() {
    const top = [0, 1.08, 0];
    const bot = [0, -1.08, 0];
    const ring = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5;
      const y = i % 2 === 0 ? 0.22 : -0.22;
      ring.push([Math.cos(a) * 0.92, y, Math.sin(a) * 0.92]);
    }
    const kites = [];
    for (let i = 0; i < 5; i++) {
      const i0 = 2 + i * 2;
      const i1 = 2 + ((i * 2 + 1) % 10);
      const i2 = 2 + ((i * 2 + 2) % 10);
      const i3 = 2 + ((i * 2 + 3) % 10);
      kites.push([0, i2, i1, i0]);
      kites.push([1, i1, i2, i3]);
    }
    return buildMesh([top, bot, ...ring], kites);
  }

  function makeIcosahedron() {
    const raw = [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
    ];
    const f = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];
    return buildMesh(raw, f);
  }

  function makeTetrahedron() {
    const v = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
    const f = [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]];
    return buildMesh(v, f);
  }

  // Regular dodecahedron: 12 pentagons, each normal is the cyclic dual direction 0, phi, 1.
  // buildMesh pairs each face with its antipode as lo and hi, so opposite faces sum to 13.
  function makeDodecahedron() {
    const IP = 1 / PHI;
    const v = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]);
    for (const a of [-1, 1]) {
      for (const b of [-1, 1]) {
        v.push([0, a * IP, b * PHI]);
        v.push([a * IP, b * PHI, 0]);
        v.push([a * PHI, 0, b * IP]);
      }
    }
    const centres = [];
    for (const a of [-1, 1]) {
      for (const b of [-1, 1]) {
        centres.push([0, a * PHI, b]);
        centres.push([a * PHI, b, 0]);
        centres.push([a, 0, b * PHI]);
      }
    }
    const faces = centres.map((c) => {
      const n = norm(c);
      const ranked = v
        .map((p, i) => ({ i, d: p[0] * n[0] + p[1] * n[1] + p[2] * n[2] }))
        .sort((a, b) => b.d - a.d)
        .slice(0, 5)
        .map((r) => r.i);
      const ref = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      const u = norm([
        ref[1] * n[2] - ref[2] * n[1],
        ref[2] * n[0] - ref[0] * n[2],
        ref[0] * n[1] - ref[1] * n[0]
      ]);
      const w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
      return ranked
        .map((i) => {
          const p = v[i];
          return { i, ang: Math.atan2(p[0] * w[0] + p[1] * w[1] + p[2] * w[2], p[0] * u[0] + p[1] * u[1] + p[2] * u[2]) };
        })
        .sort((a, b) => a.ang - b.ang)
        .map((r) => r.i);
    });
    return buildMesh(v, faces);
  }

  const MESHES = { 4: makeTetrahedron(), 8: makeOctahedron(), 10: makeD10(), 12: makeDodecahedron(), 20: makeIcosahedron() };

  function rot(p, rx, ry, rz) {
    const cx = Math.cos(rx), sx = Math.sin(rx);
    let y = p[1] * cx - p[2] * sx;
    let z = p[1] * sx + p[2] * cx;
    let x = p[0];
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const x2 = x * cy + z * sy;
    z = -x * sy + z * cy;
    x = x2;
    const cz = Math.cos(rz), sz = Math.sin(rz);
    return [x * cz - y * sz, x * sz + y * cz, z];
  }

  function getLandingPose(sides, targetNum) {
    const mesh = MESHES[sides];
    if (!mesh) return { rx: 0, ry: 0, rz: 0 };
    const face = mesh.faces.find((f) => f.num === Number(targetNum)) || mesh.faces[0];
    const [nx, ny, nz] = face.n0;
    const rx = Math.atan2(ny, nz);
    const z1 = Math.hypot(ny, nz);
    const ry = Math.atan2(-nx, z1);
    return { rx: rx + 0.14, ry: ry - 0.16, rz: 0 };
  }

  function drawPoly(canvas, sides, rx, ry, rz, activeNum, isLanded) {
    const mesh = MESHES[sides];
    if (!mesh || !canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const rv = mesh.v.map((p) => rot(p, rx, ry, rz));
    const proj = rv.map((p) => {
      const k = 3.2 / (3.2 - p[2]);
      return [w / 2 + p[0] * (w * 0.35) * k, h / 2 - p[1] * (h * 0.35) * k, p[2]];
    });

    const drawn = mesh.faces.map((face) => {
      const rn = rot(face.n0, rx, ry, rz);
      const dot = -0.32 * rn[0] + 0.52 * rn[1] + 0.78 * rn[2];
      const avgZ = face.idxs.reduce((s, i) => s + rv[i][2], 0) / face.idxs.length;
      const cx = face.idxs.reduce((s, i) => s + proj[i][0], 0) / face.idxs.length;
      const cy = face.idxs.reduce((s, i) => s + proj[i][1], 0) / face.idxs.length;
      return { idxs: face.idxs, num: face.num, avgZ, nz: rn[2], dot, cx, cy };
    });

    drawn.sort((a, b) => a.avgZ - b.avgZ);

    const target = isLanded ? Number(activeNum) : -1;
    const baseFontPx = sides === 20 ? 10 : sides === 12 ? 11 : sides === 10 ? 12 : sides === 4 ? 15 : 14;

    drawn.forEach((face) => {
      if (face.nz <= 0.02) return;
      const hit = face.num === target;
      const lit = Math.max(0.16, Math.min(1, 0.46 + face.dot * 0.5));
      ctx.beginPath();
      face.idxs.forEach((vi, k) => {
        const pt = proj[vi];
        if (k === 0) ctx.moveTo(pt[0], pt[1]);
        else ctx.lineTo(pt[0], pt[1]);
      });
      ctx.closePath();

      const r = Math.round(22 + lit * 28);
      const g = Math.round(27 + lit * 33);
      const b = Math.round(39 + lit * 42);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.strokeStyle = "rgba(212, 168, 83, 0.55)";
      ctx.lineWidth = 1.25;
      ctx.fill();
      ctx.stroke();

      const alpha = Math.min(1, Math.max(0.35, face.nz * 1.25));
      const fontSize = hit ? baseFontPx + 6 : baseFontPx;
      ctx.font = `${hit ? 800 : 600} ${fontSize}px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
      ctx.fillText(String(face.num), face.cx + 0.8, face.cy + 0.8);
      ctx.fillStyle = hit ? "#fef08a" : `rgba(226, 200, 145, ${alpha.toFixed(2)})`;
      ctx.fillText(String(face.num), face.cx, face.cy);
    });
  }

  window.DICE_3D = { drawPoly, getLandingPose, MESHES, rot };
})();
