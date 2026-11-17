/* Epsilon3 home page (Squarespace). Requires three r128 + GLTFLoader + DRACOLoader loaded before this file. */
(function () { var me = document.currentScript && document.currentScript.src; var base = me ? me.replace(/[^/]*$/, '') : '';
  window.E3_GLB_BASE = base + 'e3d/'; window.E3_GLB_FORMAT = 'js';
  window.E3_DRACO_PATH = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/'; window.E3_DRACO_TYPE = 'js'; })();

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // footer wordmark: outline at rest, fills left to right when it scrolls into view


  // demo form: prototype only
  const df = document.getElementById('demo-form'); if (df && !df.dataset.live) df.addEventListener('submit', e => { e.preventDefault(); document.getElementById('d-sent').hidden = false; });

  // CONOP: step through the program, lighting each node and its link to the core
  const steps = Array.from(document.querySelectorAll('#steps li'));
  const nodes = Array.from(document.querySelectorAll('#conop .node')), edges = Array.from(document.querySelectorAll('#conop .edge')), pulses = Array.from(document.querySelectorAll('#conop .pulse'));
  let si = 0;
  function stepTo(i) {
    steps.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); });
    nodes.forEach((n, k) => { n.classList.toggle('on', k <= i); n.classList.toggle('cur', k === i); });
    edges.forEach((e, k) => e.classList.toggle('on', k <= i));
    pulses.forEach((p, k) => p.style.opacity = k === i ? 1 : 0);
  }
  if (reduce) stepTo(steps.length - 1);
  else { stepTo(0); setInterval(() => { si = (si + 1) % (steps.length + 1); if (si < steps.length) stepTo(si); else { steps.forEach(s => s.classList.add('done')); } }, 2400); }

  if (window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { e.target.classList.toggle('lit', e.isIntersecting); }), { rootMargin: '-35% 0px -35% 0px' });
    document.querySelectorAll('.plat-tile').forEach(t => io.observe(t));
  }
  (function () { const w = document.getElementById('whatif'); if (!w) return;
    if (reduce || !('IntersectionObserver' in window)) { w.classList.add('in'); return; }
    new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { w.classList.add('in'); io.disconnect(); } }, { rootMargin: '0px 0px -30% 0px' }).observe(w); })();
  (function () {
    const hdr = document.getElementById('e3c-header'), hero = document.querySelector('.hero'); if (!hdr || !hero) return;
    let tick = false;
    const upd = () => { tick = false; hdr.classList.toggle('over', hero.getBoundingClientRect().bottom > hdr.offsetHeight + 1); };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  })();
  if (!window.THREE) return;
/* Epsilon3 procedural chrome assets. Requires THREE (r128). Exposes window.E3D. */
(function () {
  const T = THREE;
  const V2 = (x, y) => new T.Vector2(x, y);

  /* ---------- studio environment: dark room with hard softboxes -> liquid chrome reflections ---------- */
  function studioEnv(renderer) {
    const es = new T.Scene();
    const sg = new T.SphereGeometry(40, 48, 24);
    const cols = [], pos = sg.attributes.position;
    const top = new T.Color(0x2e2e2e), mid = new T.Color(0x0c0c0c), bot = new T.Color(0x030303), c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 40;
      if (y > 0) c.copy(mid).lerp(top, Math.pow(y, 0.7)); else c.copy(mid).lerp(bot, Math.min(1, -y * 1.6));
      cols.push(c.r, c.g, c.b);
    }
    sg.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    es.add(new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    const ring = (y, h, k, r = 30) => { const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 96, 1, true), new T.MeshBasicMaterial({ color: new T.Color(k, k, k), side: T.BackSide })); m.position.y = y; es.add(m); };
    ring(0.6, 1.4, 2.2); ring(4.5, 0.7, 1.4); ring(9, 2.4, 1.8); ring(-3.5, 0.5, 0.7); ring(15, 1.2, 1.2);
    const box = (w, h, x, y, z, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k, k, k), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); };
    box(26, 10, 0, 24, 4, 3.0);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; box(2.4, 30, Math.cos(a) * 26, 2, Math.sin(a) * 26, i % 2 ? 2.4 : 1.2); }
    const pm = new T.PMREMGenerator(renderer);
    const tex = pm.fromScene(es, 0.01).texture;
    pm.dispose();
    return tex;
  }

  function materials(env) {
    const std = (o) => new T.MeshStandardMaterial(Object.assign({ envMap: env, envMapIntensity: 1 }, o));
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d'); g.fillStyle = '#0d151b'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(160,180,190,.55)'; g.lineWidth = 2;
    for (let i = 0; i <= 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
    const grid = new T.CanvasTexture(cv);
    const rc = document.createElement('canvas'); rc.width = 512; rc.height = 4; const rg = rc.getContext('2d');
    for (let i = 0; i < 512; i++) { const v = 128 + Math.round(Math.sin(i / 512 * Math.PI * 2 * 96) * 110); rg.fillStyle = `rgb(${v},${v},${v})`; rg.fillRect(i, 0, 1, 4); }
    const ribs = new T.CanvasTexture(rc); ribs.wrapS = ribs.wrapT = T.RepeatWrapping;
    return {
      ribbed: std({ color: 0xffffff, metalness: 1, roughness: 0.08, bumpMap: ribs, bumpScale: 0.012 }),
      chrome: std({ color: 0xffffff, metalness: 1, roughness: 0.05 }),
      satin: std({ color: 0xe6e6e6, metalness: 1, roughness: 0.22, envMapIntensity: 1.5 }),
      hull: std({ color: 0xf2f2f2, metalness: 1, roughness: 0.16, envMapIntensity: 1.6 }),
      dark: std({ color: 0x2b2b2b, metalness: 0.85, roughness: 0.3 }),
      glass: std({ color: 0x1b262b, metalness: 1, roughness: 0.04 }),
      rubber: std({ color: 0x121212, metalness: 0.1, roughness: 0.85, envMapIntensity: 0.4 }),
      solar: std({ color: 0xffffff, map: grid, metalness: 0.6, roughness: 0.22 }),
      stand: std({ color: 0x6a6a6a, metalness: 0.9, roughness: 0.45 }),
    };
  }

  /* ---------- helpers ---------- */
  function lathe(points, mat, seg = 64) { const g = new T.LatheGeometry(points.map(p => V2(p[0], p[1])), seg); const m = new T.Mesh(g, mat); m.material.side = T.DoubleSide; return m; }
  const boxCache = new Map();
  function box(w, h, d, mat, x = 0, y = 0, z = 0) {
    const b = Math.min(0.04, Math.min(w, h, d) * 0.22);
    const key = [w, h, d].join(',');
    let geo = boxCache.get(key);
    if (!geo) {
      if (b < 0.006) geo = new T.BoxGeometry(w, h, d);
      else {
        const s = new T.Shape(); const hw = w / 2 - b, hh = h / 2 - b;
        s.moveTo(-hw, -hh); s.lineTo(hw, -hh); s.lineTo(hw, hh); s.lineTo(-hw, hh); s.closePath();
        geo = new T.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 4 });
        geo.translate(0, 0, -(d - 2 * b) / 2);
      }
      boxCache.set(key, geo);
    }
    const m = new T.Mesh(geo, mat); m.position.set(x, y, z); return m;
  }
  function cyl(rt, rb, h, mat, seg = 40) { return new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg), mat); }
  function tube(pts, r, mat) { const c = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(p[0], p[1], p[2]))); return new T.Mesh(new T.TubeGeometry(c, 64, r, 16, false), mat); }
  function extrude(pts, depth, mat, bevel = 0.04) {
    const s = new T.Shape(); s.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => s.lineTo(p[0], p[1])); s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 12 });
    g.translate(0, 0, -depth / 2); return new T.Mesh(g, mat);
  }

  /* ---------- assets: each returns { group, exhaust: {pos, dir, len} | null, spin: mesh | null } ---------- */
  function rocket(M) {
    const g = new T.Group();
    // injector dome + chamber + throat
    g.add(lathe([[0, 2.2], [0.22, 2.18], [0.36, 2.1], [0.43, 1.98], [0.47, 1.95], [0.47, 1.88], [0.42, 1.86], [0.42, 1.0], [0.47, 0.98], [0.47, 0.92], [0.41, 0.9], [0.36, 0.7], [0.24, 0.42], [0.21, 0.32], [0, 0.32]], M.chrome, 96));
    // bell with cooling-tube ribs
    g.add(lathe([[0.21, 0.32], [0.26, 0.1], [0.42, -0.45], [0.66, -1.15], [0.92, -1.95], [1.04, -2.35], [1.07, -2.4], [1.02, -2.4], [0.9, -1.97], [0.64, -1.16], [0.4, -0.46], [0.24, 0.1], [0.19, 0.32]], M.ribbed, 128));
    const lip = new T.Mesh(new T.TorusGeometry(1.05, 0.035, 12, 96), M.chrome); lip.rotation.x = Math.PI / 2; lip.position.y = -2.39; g.add(lip);
    [-0.15, -1.0, -1.8].forEach((y, i) => { const r = [0.33, 0.6, 0.86][i]; const b = new T.Mesh(new T.TorusGeometry(r, 0.022, 10, 80), M.satin); b.rotation.x = Math.PI / 2; b.position.y = y; g.add(b); });
    const man = new T.Mesh(new T.TorusGeometry(0.5, 0.05, 12, 64), M.chrome); man.rotation.x = Math.PI / 2; man.position.y = 1.9; g.add(man);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.add(box(0.03, 0.05, 0.03, M.dark, Math.cos(a) * 0.475, 1.915, Math.sin(a) * 0.475)); g.add(box(0.03, 0.05, 0.03, M.dark, Math.cos(a) * 0.475, 0.945, Math.sin(a) * 0.475)); }
    // gimbal + thrust frame
    g.add(box(0.36, 0.2, 0.36, M.dark, 0, 2.3, 0));
    const gb = new T.Mesh(new T.SphereGeometry(0.16, 24, 16), M.chrome); gb.position.y = 2.42; g.add(gb);
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => g.add(tube([[0.12 * sx, 2.35, 0.12 * sz], [0.36 * sx, 2.15, 0.36 * sz], [0.44 * sx, 1.98, 0.44 * sz]], 0.025, M.satin)));
    // turbopump assembly
    const tp = cyl(0.2, 0.2, 0.62, M.chrome); tp.position.set(0.82, 1.45, 0.18); g.add(tp);
    const tb = cyl(0.26, 0.22, 0.2, M.satin); tb.position.set(0.82, 1.05, 0.18); g.add(tb);
    [1.75, 1.2].forEach(y => { const r = cyl(0.24, 0.24, 0.05, M.dark); r.position.set(0.82, y, 0.18); g.add(r); });
    g.add(tube([[0.82, 0.95, 0.18], [0.95, 0.4, 0.3], [0.9, -0.3, 0.42], [0.62, -0.95, 0.42]], 0.1, M.dark));
    g.add(tube([[0.82, 1.75, 0.18], [0.75, 2.0, 0.1], [0.4, 2.08, 0.05]], 0.05, M.satin));
    g.add(tube([[0.62, 1.4, 0.18], [0.5, 1.3, 0.1], [0.43, 1.35, 0.05]], 0.055, M.satin));
    // gas generator + valves + fuel lines
    const gg = cyl(0.13, 0.13, 0.42, M.chrome); gg.position.set(-0.78, 1.4, -0.1); g.add(gg);
    g.add(tube([[-0.78, 1.2, -0.1], [-0.6, 1.1, -0.05], [-0.43, 1.2, 0]], 0.05, M.satin));
    g.add(tube([[-0.78, 1.62, -0.1], [-0.7, 2.0, 0], [-0.3, 2.12, 0]], 0.05, M.satin));
    g.add(tube([[-0.2, 2.1, 0.42], [-0.6, 1.6, 0.6], [-0.7, 0.9, 0.5], [-0.44, 0.6, 0.3]], 0.04, M.satin));
    g.add(tube([[0.3, 2.1, -0.4], [0.62, 1.5, -0.55], [0.6, 0.8, -0.45], [0.42, 0.55, -0.3]], 0.04, M.satin));
    [[-0.78, 1.85, -0.1], [0.62, 1.1, -0.48], [-0.66, 1.05, 0.5]].forEach(p => { const v = new T.Mesh(new T.SphereGeometry(0.075, 20, 14), M.chrome); v.position.set(...p); g.add(v); });
    return { group: g, exhaust: { pos: [0, -2.35, 0], dir: [0, -1, 0], len: 3.4 } };
  }

  function turbofan(M) {
    const g = new T.Group(); const core = new T.Group();
    // nacelle shell, axis +y = intake
    core.add(lathe([[0.96, 1.62], [1.06, 1.56], [1.1, 1.3], [1.09, 0.4], [1.02, -0.6], [0.88, -1.2], [0.86, -1.18], [0.84, -0.9], [0.9, 1.0], [0.92, 1.45], [0.96, 1.62]], M.chrome, 128));
    [1.1, -0.2].forEach(y => { const sm = new T.Mesh(new T.TorusGeometry(y > 0 ? 1.095 : 1.06, 0.008, 6, 128), M.dark); sm.rotation.x = Math.PI / 2; sm.position.y = y; core.add(sm); });
    // core cowl + nozzle + plug
    core.add(lathe([[0.62, -1.0], [0.64, -1.4], [0.52, -1.95], [0.5, -1.98], [0.46, -1.98], [0.58, -1.4], [0.6, -1.0]], M.satin, 72));
    core.add(lathe([[0.4, -1.9], [0.36, -2.15], [0.18, -2.45], [0, -2.55]], M.chrome, 64));
    core.add(lathe([[0, 1.52], [0.08, 1.45], [0.16, 1.32], [0.2, 1.2], [0.2, 1.1]], M.chrome, 48));
    const fan = new T.Group();
    const hub = cyl(0.22, 0.22, 0.12, M.dark); hub.position.y = 1.12; fan.add(hub);
    for (let i = 0; i < 22; i++) {
      const b = box(0.7, 0.03, 0.16, M.satin); b.position.set(0.55, 0, 0);
      const holder = new T.Group(); holder.add(b); b.rotation.x = 0.55;
      holder.rotation.y = i / 22 * Math.PI * 2; holder.position.y = 1.15; fan.add(holder);
    }
    const disk = cyl(0.88, 0.88, 0.02, M.dark); disk.position.y = 1.0; core.add(disk);
    core.add(fan);
    core.rotation.z = Math.PI / 2; // intake to -x
    g.add(core);
    g.rotation.y = 0.75;
    const py = extrude([[-0.6, 0], [1.4, 0], [1.9, 0.75], [-0.2, 0.75]], 0.22, M.chrome, 0.05); py.position.set(-0.3, 1.02, 0); g.add(py);
    g.add(box(3.4, 0.08, 1.2, M.satin, 0.5, 1.82, 0));
    const w = new T.Group(); w.add(g); return { group: w, exhaust: { pos: [2.5, 0, 0], dir: [1, 0, 0], len: 3.4, local: g }, spin: fan, spinAxis: 'y' };
  }

  function fighter(M) {
    const g = new T.Group();
    const fus = lathe([[0, 2.3], [0.1, 2.05], [0.2, 1.6], [0.29, 0.9], [0.33, 0], [0.34, -1.4], [0.3, -1.95], [0.27, -2.05], [0, -2.05]], M.chrome, 64);
    fus.rotation.x = Math.PI / 2; fus.scale.set(1.25, 1, 0.72); g.add(fus);
    const wing = (sx) => { const pts = [[0.25, 0.4], [2.05, -0.95], [2.05, -1.22], [0.25, -1.4]].map(p => [p[0] * sx, p[1]]); const m = extrude(pts, 0.06, M.chrome, 0.025); m.rotation.x = -Math.PI / 2; return m; };
    g.add(wing(1)); g.add(wing(-1));
    const tail = (sx) => { const pts = [[0.2, -1.55], [0.95, -2.0], [0.95, -2.15], [0.2, -2.1]].map(p => [p[0] * sx, p[1]]); const m = extrude(pts, 0.04, M.satin, 0.02); m.rotation.x = -Math.PI / 2; return m; };
    g.add(tail(1)); g.add(tail(-1));
    const fin = (sx) => { const m = extrude([[0, 0], [0.55, 0], [0.75, 0.75], [0.48, 0.75]], 0.04, M.chrome, 0.02); m.rotation.y = Math.PI / 2; const h = new T.Group(); h.add(m); h.position.set(0.28 * sx, 0.12, -1.3); h.rotation.z = -0.35 * sx; return h; };
    g.add(fin(1)); g.add(fin(-1));
    const can = new T.Mesh(new T.SphereGeometry(1, 32, 16), M.glass); can.scale.set(0.17, 0.16, 0.6); can.position.set(0, 0.2, 1.15); g.add(can);
    [-1, 1].forEach(s => { const ik = box(0.18, 0.22, 0.9, M.dark, 0.38 * s, -0.04, 0.2); g.add(ik); const nz = cyl(0.15, 0.13, 0.25, M.dark); nz.rotation.x = Math.PI / 2; nz.position.set(0.14 * s, 0, -2.12); g.add(nz); });
    g.rotation.set(0.55, -0.7, 0.1);
    const wrap = new T.Group(); wrap.add(g);
    return { group: wrap, exhaust: { pos: [0, 0, -2.3], dir: [0, 0, -1], len: 2.8, local: g } };
  }

  function ship(M) {
    const g = new T.Group();
    const hull = extrude([[-3.2, -0.05], [2.7, -0.05], [3.3, 0.12], [2.95, -0.42], [2.4, -0.62], [-3.0, -0.62], [-3.22, -0.3]], 0.86, M.hull, 0.06);
    { const p = hull.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); if (x > 1.2) { const k = 1 - Math.min(1, (x - 1.2) / 2.1) * 0.85; p.setZ(i, p.getZ(i) * k); } else if (x < -2.4) { p.setZ(i, p.getZ(i) * (1 - (-2.4 - x) * 0.25)); } } hull.geometry.computeVertexNormals(); }
    g.add(hull);
    g.add(box(6.0, 0.04, 0.9, M.satin, -0.2, -0.04, 0));
    const deck = [[-1.6, 0.36, 1.5, 0.7], [0.0, 0.62, 1.1, 0.62]];
    deck.forEach(([x, y, w, d]) => g.add(box(w, y * 2 - 0.05, d, M.hull, x, y / 2 + 0.0, 0)));
    g.add(box(1.4, 0.55, 0.6, M.hull, -0.2, 0.6, 0));
    g.add(box(0.75, 0.42, 0.5, M.hull, -0.05, 1.08, 0));
    [-0.26, 0.26].forEach(z => { const p = box(0.36, 0.3, 0.02, M.glass, 0.05, 1.08, z); g.add(p); });
    const mast = cyl(0.045, 0.07, 1.2, M.satin); mast.position.set(-0.1, 1.85, 0); g.add(mast);
    g.add(box(0.7, 0.04, 0.04, M.satin, -0.1, 2.05, 0)); g.add(box(0.45, 0.04, 0.04, M.satin, -0.1, 2.25, 0));
    const fun = box(0.45, 0.6, 0.42, M.hull, -1.55, 0.95, 0); g.add(fun); g.add(box(0.5, 0.06, 0.46, M.dark, -1.55, 1.27, 0));
    const tur = cyl(0.2, 0.24, 0.16, M.hull); tur.position.set(1.9, 0.1, 0); g.add(tur);
    const bar = cyl(0.025, 0.025, 0.8, M.satin); bar.rotation.z = Math.PI / 2 - 0.12; bar.position.set(2.3, 0.18, 0); g.add(bar);
    g.add(box(0.5, 0.06, 0.5, M.dark, 1.2, 0.01, 0)); g.add(box(0.7, 0.06, 0.5, M.dark, -2.5, 0.01, 0));
    g.add(box(0.5, 0.3, 0.6, M.hull, -2.75, 0.13, 0));
    g.scale.setScalar(0.72); g.rotation.set(0.18, -0.55, 0);
    const w = new T.Group(); w.add(g); return { group: w, exhaust: null };
  }

  function vehicle(M) {
    const g = new T.Group();
    g.add(extrude([[-2.2, -0.15], [-2.2, 0.35], [-1.95, 0.7], [-0.9, 0.95], [1.1, 0.95], [1.9, 0.5], [2.25, 0.15], [2.25, -0.15]], 1.5, M.hull, 0.08));
    [-0.78, 0.78].forEach(z => {
      [-1.45, -0.5, 0.65, 1.55].forEach(x => {
        const t = cyl(0.46, 0.46, 0.3, M.rubber, 36); t.rotation.x = Math.PI / 2; t.position.set(x, -0.2, z); g.add(t);
        const h = cyl(0.27, 0.27, 0.32, M.hull, 24); h.rotation.x = Math.PI / 2; h.position.set(x, -0.2, z * 1.01); g.add(h);
      });
    });
    [-0.79, 0.79].forEach(z => { g.add(box(0.55, 0.22, 0.02, M.glass, -0.55, 0.7, z)); g.add(box(0.55, 0.22, 0.02, M.glass, 0.25, 0.7, z)); });
    const ws = extrude([[1.18, 0.9], [1.82, 0.52], [1.7, 0.5], [1.12, 0.84]], 1.3, M.glass, 0.01); g.add(ws);
    g.add(box(0.7, 0.3, 0.6, M.hull, -0.2, 1.17, 0));
    const b = cyl(0.04, 0.04, 1.2, M.satin); b.rotation.z = Math.PI / 2 - 0.05; b.position.set(0.55, 1.2, 0); g.add(b);
    g.add(box(0.26, 0.16, 0.3, M.dark, -0.3, 1.4, 0));
    g.scale.setScalar(0.82); g.rotation.set(0.12, -0.6, 0);
    const w = new T.Group(); w.add(g); return { group: w, exhaust: null };
  }

  function satellite(M) {
    const g = new T.Group();
    g.add(box(0.9, 1.15, 0.9, M.hull));
    g.add(box(0.94, 0.12, 0.94, M.satin, 0, 0.62, 0));
    [-1, 1].forEach(s => {
      const boom = cyl(0.03, 0.03, 0.5, M.satin); boom.rotation.z = Math.PI / 2; boom.position.set(0.7 * s, 0, 0); g.add(boom);
      for (let k = 0; k < 3; k++) { const p = box(0.95, 0.03, 0.75, M.solar, s * (1.45 + k * 1.0), 0, 0); g.add(p); const f = new T.LineSegments(new T.EdgesGeometry(p.geometry), new T.LineBasicMaterial({ color: 0x9aa7ad })); f.position.copy(p.position); g.add(f); }
    });
    const dish = lathe([[0, 0], [0.15, 0.015], [0.3, 0.06], [0.45, 0.13], [0.6, 0.23], [0.61, 0.23]], M.hull, 64);
    dish.position.set(0, 0.95, 0); g.add(dish);
    const st = cyl(0.05, 0.05, 0.35, M.satin); st.position.set(0, 0.78, 0); g.add(st);
    const feed = cyl(0.02, 0.02, 0.4, M.satin); feed.position.set(0, 1.2, 0); g.add(feed);
    const fs = new T.Mesh(new T.SphereGeometry(0.06, 16, 12), M.hull); fs.position.set(0, 1.42, 0); g.add(fs);
    g.add(box(0.5, 0.2, 0.5, M.dark, 0, -0.68, 0));
    g.rotation.set(0.35, -0.5, -0.18);
    const w = new T.Group(); w.add(g); return { group: w, exhaust: null };
  }

  /* engine on a maintenance stand, with a usage meter and status lamp (hero) */
  function standTurbofan(M) {
    const a = turbofan(M); const g = new T.Group(); g.add(a.group);
    const S = M.stand;
    [-1.2, 1.4].forEach(x => {
      g.add(box(0.1, 1.4, 0.1, S, x, -1.0, 0.75)); g.add(box(0.1, 1.4, 0.1, S, x, -1.0, -0.75));
      g.add(box(0.12, 0.1, 1.6, S, x, -0.32, 0));
      const cr = new T.Mesh(new T.TorusGeometry(1.12, 0.05, 12, 48, Math.PI), S); cr.rotation.set(0, Math.PI / 2, Math.PI); cr.position.set(x, 0, 0); g.add(cr);
    });
    g.add(box(3.2, 0.1, 0.12, S, 0.1, -1.7, 0.78)); g.add(box(3.2, 0.1, 0.12, S, 0.1, -1.7, -0.78));
    [-1.3, 1.5].forEach(x => [0.85, -0.85].forEach(z => { const w = cyl(0.11, 0.11, 0.08, M.rubber, 20); w.rotation.x = Math.PI / 2; w.position.set(x, -1.86, z); g.add(w); }));
    const track = box(0.07, 2.6, 0.07, M.dark, 2.15, -0.5, 0.8); g.add(track);
    const fillMat = new T.MeshBasicMaterial({ color: 0xe9e9e9 });
    const fill = new T.Mesh(new T.BoxGeometry(0.08, 1, 0.08), fillMat); fill.position.set(2.15, -1.8, 0.8); g.add(fill);
    const tick = box(0.2, 0.02, 0.1, M.satin, 2.15, -1.8 + 2.6 * 0.9, 0.8); g.add(tick);
    const lampMat = new T.MeshBasicMaterial({ color: new T.Color(0x2bd900).convertSRGBToLinear(), toneMapped: false });
    const lamp = new T.Mesh(new T.BoxGeometry(0.16, 0.16, 0.16), lampMat); lamp.position.set(-1.2, 0.95, 0.8); g.add(lamp);
    const post = box(0.04, 0.55, 0.04, S, -1.2, 0.62, 0.8); g.add(post);
    a.group.position.y = 0.05;
    return { group: g, exhaust: a.exhaust, spin: a.spin, spinAxis: a.spinAxis, meter: { fill, mat: fillMat, base: -1.8, h: 2.6 }, lamp: lampMat };
  }

  const BUILD = { space: rocket, civil: turbofan, air: fighter, sea: ship, land: vehicle, orbit: satellite, hero: rocket };

  /* ---------- plume sprite texture ---------- */
  function plumeTex() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,246,236,1)'); gr.addColorStop(0.3, 'rgba(250,190,140,.75)'); gr.addColorStop(0.7, 'rgba(220,120,70,.2)'); gr.addColorStop(1, 'rgba(200,100,60,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c);
  }
  function poolTex() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c);
  }

  /* ---------- Stage: one renderer + scene; holds one asset at a time ---------- */
  class Stage {
    constructor(canvas, opts = {}) {
      this.canvas = canvas; this.opts = opts;
      this.ok = false;
      try {
        this.r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch (e) { return; }
      if (!this.r || !this.r.getContext()) return;
      this.ok = true;
      const r = this.r;
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
      r.localClippingEnabled = true;
      this.scene = new T.Scene();
      this.cam = new T.PerspectiveCamera(28, 1, 0.1, 100);
      this.env = studioEnv(r);
      this.M = materials(this.env);
      this.solidMats = Object.values(this.M);
      const BRAND_G = () => new T.Color(0x2bd900).convertSRGBToLinear(); this.brandG = BRAND_G;
      this.wireMat = new T.LineBasicMaterial({ color: BRAND_G(), transparent: true, opacity: 0.9, toneMapped: false });
      this.clipSolid = new T.Plane(new T.Vector3(0, -1, 0), 10);
      this.clipWire = new T.Plane(new T.Vector3(0, -1, 0), 10);
      this.clipWireLo = new T.Plane(new T.Vector3(0, 1, 0), 100);
      this.solidMats.forEach(m => { m.clippingPlanes = [this.clipSolid]; });
      this.wireMat.clippingPlanes = [this.clipWire, this.clipWireLo];
      this.wireMatD = new T.LineBasicMaterial({ color: BRAND_G(), transparent: true, opacity: 0.9, toneMapped: false }); this.wireMatD.clippingPlanes = this.wireMat.clippingPlanes; this.density = 1;
      this.rx = 0; this.rz = 0;
      this.scene.add(new T.AmbientLight(0xffffff, 0.1));
      // clay lighting: raking key from the left, rim from back right, so form reads on matte surfaces
      const d = new T.DirectionalLight(0xffffff, 1.6); d.position.set(-5, 3, 1.5); this.scene.add(d); const d2 = new T.DirectionalLight(0xffffff, 0.9); d2.position.set(4, 2, -3); this.scene.add(d2); this.scene.add(new T.HemisphereLight(0xffffff, 0x101010, 0.2));
      this.pivot = new T.Group(); this.scene.add(this.pivot);
      this.pool = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: poolTex(), transparent: true, depthWrite: false }));
      this.pool.rotation.x = -Math.PI / 2; this.scene.add(this.pool);
      this.plume = new T.Group(); this.scene.add(this.plume);
      const pt = plumeTex();
      for (let i = 0; i < 7; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: pt, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 })); this.plume.add(s); }
      this.plumeOn = 0; this.plumeTarget = 0;
      this.t0 = performance.now(); this.tilt = 0; this.tiltTarget = 0; this.spinAcc = 0; this.lastT = 0; this.scanOn = false; this.exK = 0; this.visible = true; this.yaw = 0; this.sway = opts.sway ?? 0.35; this.reveal = null;
      this.offset = opts.offset || [0, 0];
      this.resize(); window.addEventListener('resize', () => this.resize());
      if ('IntersectionObserver' in window) new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }, { rootMargin: '100px' }).observe(canvas);
      this.loop();
    }
    resize() {
      const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
      this.W = w; this.H = h;
      this.r.setSize(w, h, false); this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); this.frame();
    }
    set(key) {
      if (!this.ok) return;
      if (this.asset) { this.pivot.remove(this.asset.group); }
      const a = BUILD[key](this.M); this.asset = a; if (this.key !== key) this.spinAcc = 0; this.key = key;
      // wireframe twins
      a.group.updateMatrixWorld(true);
      const meshes = []; a.group.traverse(o => { if (o.isMesh) meshes.push(o); });
      meshes.forEach(m => {
        if (m.userData.edgesSparse) { m.add(new T.LineSegments(m.userData.edgesSparse, this.wireMat)); m.add(new T.LineSegments(m.userData.edges, this.wireMatD)); }
        else m.add(new T.LineSegments(m.userData.edges || new T.WireframeGeometry(m.geometry), this.wireMat));
      });
      // centre on bounds
      const b = new T.Box3().setFromObject(a.group), c = b.getCenter(new T.Vector3()), s = b.getSize(new T.Vector3());
      a.group.position.sub(c);
      this.size = s; this.radius = s.length() / 2; this.minY = -s.y / 2;
      this.pivot.add(a.group);
      this.pool.position.set(0, this.minY - 0.02, 0); this.pool.scale.set(s.x * 1.4 + 1, s.z * 1.4 + 1, 1);
      this.frame();
      this.setPlume(this.plumeTarget > 0);
      return a;
    }
    frame() {
      if (!this.ok || !this.radius) return;
      const fov = this.cam.fov * Math.PI / 180, fit = this.opts.fit || 1.0;
      const hFit = this.radius / Math.sin(fov / 2);
      const wFit = this.radius / Math.sin(Math.atan(Math.tan(fov / 2) * this.cam.aspect));
      const dist = Math.max(hFit, wFit) * fit;
      const el = this.opts.elev ?? 0.18;
      this.cam.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist);
      this.cam.lookAt(0, 0, 0);
      this.cam.setViewOffset(this.W, this.H, -this.offset[0] * this.W, -this.offset[1] * this.H, this.W, this.H);
      this.cam.updateProjectionMatrix();
    }
    /* mode: 'solid' | 'wire' ; reveal sweeps a clipping plane bottom -> top */
    show(mode, animate = true, dur = 1100) {
      if (!this.ok || !this.asset) return;
      const top = this.size.y / 2 + 0.2, bot = -this.size.y / 2 - 0.2;
      this.mode = mode;
      if (!animate) { this.clipWire.constant = mode === 'solid' ? bot : top; this.clipSolid.constant = mode === 'solid' ? top : bot; this.wireMat.opacity = mode === 'solid' ? 0 : 0.75; return; }
      this.reveal = { t: performance.now(), mode, top, bot, dur };
      if (mode === 'wire') { this.wireMat.opacity = 0.75; this.clipWire.constant = bot; this.clipSolid.constant = bot; }
      if (mode === 'solid') { this.wireMat.opacity = 0.75; if (this.clipWire.constant < bot + 0.01) this.clipWire.constant = bot; }
      if (mode === 'unsolid') { this.clipWire.constant = top; }
      this.loop();
    }
    /* exploded view: each part moves along its own direction, k in 0..1 */
    explode(k) {
      this.exK = k; if (!this.asset) return;
      this.asset.group.traverse(o => { if (o.isMesh && o.userData.dir) o.position.copy(o.userData.dir).multiplyScalar(k); });
      if (this._last && this._last[0] === 'progress') this.progress.apply(this, this._last[1]);
      this.loop();
    }
    hasParts() { let n = 0; if (this.asset) this.asset.group.traverse(o => { if (o.isMesh && o.userData.dir) n++; }); return n > 1; }
    scan(on) { this.scanOn = on; if (!on) { this.clipWireLo.constant = 100; if (this._last && this._last[0] === 'progress') this.progress.apply(this, this._last[1]); } this.loop(); }
    /* direct control for scroll-scrubbed builds: w, s in 0..1 */
    progress(w, s) {
      if (!this.ok || !this.asset) return;
      const m = 0.2 + this.size.y * 0.32 * (this.exK || 0), top = this.size.y / 2 + m, bot = -this.size.y / 2 - m;
      this.reveal = null;
      this.clipWire.constant = bot + (top - bot) * w;
      this.clipSolid.constant = bot + (top - bot) * s;
      this.wireMat.opacity = 0.75 * (1 - Math.max(0, (s - 0.6) / 0.4));
      this.loop();
    }
    setPlume(on) { this.plumeTarget = on && this.asset && this.asset.exhaust ? 1 : 0; this.loop(); }
    setUsage(pct, due) {
      const m = this.asset && this.asset.meter; if (!m) return;
      const h = Math.max(0.001, m.h * pct); m.fill.scale.y = h; m.fill.position.y = m.base + h / 2;
      m.mat.color.set(due ? 0xffffff : 0xb9b9b9);
      this.asset.lamp.color.set(due ? 0xffffff : 0x2bd900).convertSRGBToLinear();
      this.loop();
    }
    loop() {
      if (this.raf || !this.ok) return;
      const step = (now) => {
        this.raf = null;
        if (!this.visible) return;
        const t = (now - this.t0) / 1000;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const dt = Math.min(0.05, Math.max(0, t - this.lastT)); this.lastT = t;
        this.tilt += (this.tiltTarget - this.tilt) * Math.min(1, dt * 1.6);
        this.spinAcc += dt * 0.38 * this.tilt;
        if (!reduce) {
          this.pivot.rotation.y = this.yaw + Math.sin(t * 0.25) * this.sway + this.spinAcc;
          this.pivot.rotation.x = Math.sin(t * 0.45) * 0.2 * this.tilt + this.rx;
          this.pivot.rotation.z = Math.sin(t * 0.33 + 1.2) * 0.09 * this.tilt + this.rz;
        }
        if (this.asset && this.asset.spin && !reduce) this.asset.spin.rotation.y = t * 2.2;
        if (this.reveal) {
          const R = this.reveal, k = Math.min(1, (now - R.t) / (R.dur || 1100)), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          if (R.mode === 'wire') this.clipWire.constant = R.bot + (R.top - R.bot) * Math.min(1, e * 1.35);
          if (R.mode === 'solid') { this.clipWire.constant = Math.max(this.clipWire.constant, R.bot + (R.top - R.bot) * Math.min(1, e * 1.35)); this.clipSolid.constant = R.bot + (R.top - R.bot) * e; this.wireMat.opacity = 0.75 * (1 - Math.max(0, (e - 0.55) / 0.45)); }
          if (R.mode === 'unsolid') { this.clipSolid.constant = R.top - (R.top - R.bot) * e; this.wireMat.opacity = 0.75 * Math.min(1, e * 1.6); }
          if (k >= 1) this.reveal = null;
        }
        if (this.scanOn && this.size) {
          const top = this.size.y / 2, bot = -this.size.y / 2, c = bot + (top - bot) * (0.5 + 0.5 * Math.sin(t * 0.9)), h = this.size.y * 0.06;
          this.clipWire.constant = c + h; this.clipWireLo.constant = -(c - h); this.wireMat.opacity = 0.95;
        }
        // plume
        this.plumeOn += (this.plumeTarget - this.plumeOn) * 0.08;
        const ex = this.asset && this.asset.exhaust;
        if (ex) {
          const src = ex.local || this.asset.group;
          const p0 = new T.Vector3(...ex.pos), dir = new T.Vector3(...ex.dir).normalize();
          src.updateMatrixWorld(true);
          const wp = p0.clone().applyMatrix4(src.matrixWorld);
          const wd = dir.clone().transformDirection(src.matrixWorld);
          this.plume.children.forEach((s, i) => {
            const f = i / (this.plume.children.length - 1);
            const flick = reduce ? 1 : 0.85 + Math.sin(t * 22 + i * 1.7) * 0.15;
            s.position.copy(wp).addScaledVector(wd, ex.len * f * 0.85);
            const sc = (0.5 + f * 1.6) * flick; s.scale.set(sc, sc, 1);
            s.material.opacity = this.plumeOn * (1 - f * 0.8) * 0.9;
          });
        } else this.plume.children.forEach(s => { s.material.opacity = 0; });
        this.wireMatD.opacity = this.wireMat.opacity * this.density;
        this.r.render(this.scene, this.cam);
        const busy = !reduce || this.reveal || this.scanOn || Math.abs(this.plumeTarget - this.plumeOn) > 0.01;
        if (busy) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }
  }

  /* Epsilon3 PM page: GLB swap for E3D (three.js r128).
     Set window.E3_GLB_BASE to the CORS-enabled folder URL holding the 7 .glb files; until then the procedural models stay.
     GLTFLoader + DRACOLoader load in <head> after three.min.js. Stage.set() uses the precomputed 28-degree EdgesGeometry when present.
     Full notes: GLB integration note + glb-material-spec. */
  (function installGLB() {
    if (!T.GLTFLoader) return;                       // loader missing → procedural models stay
    const BASE = window.E3_GLB_BASE || '';
    const AS_JS = window.E3_GLB_FORMAT === 'js';         // 'js' = files wrapped as .glb.js (hosts without CORS, e.g. GitLab Pages)             // ← folder URL holding the 7 .glb files (CORS-enabled host)
    if (!BASE) return;                               // not hosted yet → procedural models stay, no network requests
    const H = 4.8;                                    // normalised largest dimension (matches procedural rocket)
    /* rot: Euler XYZ (rad) applied before normalising, so the model sits upright with its front to +Z.
       exhaust.pos is in bbox-fraction space (-0.5…0.5 per axis, after rot); dir is a world unit vector. */
    const GLB = {
      hero:  { file: 'e3-hero-engine.glb',    rot: [0, 0, 0], parts: true,            exhaust: { pos: [0, -0.5, 0],  dir: [0, -1, 0], len: 3.4 } },
      space: { file: 'e3-space-launcher.glb',  rot: [0, 0, 0],            exhaust: { pos: [0, -0.5, 0],  dir: [0, -1, 0], len: 3.4 } },
      civil: { file: 'e3-civil-turbofan.glb', rot: [0, 0.9, 0],          exhaust: { pos: [0, 0, -0.5],  dir: [0, 0, -1], len: 3.4 } },
      air:   { file: 'e3-air-fighter.glb',    rot: [0, 0.9, 0],           exhaust: { pos: [0, 0, -0.5],  dir: [0, 0, -1], len: 2.8 } },
      sea:   { file: 'e3-sea-frigate.glb',    rot: [0, 0.9, 0],          exhaust: null },
      land:  { file: 'e3-land-8x8.glb',       rot: [0, 0.9, 0],           exhaust: null },
      orbit: { file: 'e3-orbit-satellite.glb',rot: [0, 0.4, 0],            exhaust: null },
      jet:   { file: 'e3-air-jetliner.glb',   rot: [0, 0.9, 0],          exhaust: null },
      sub:   { file: 'e3-sea-submarine.glb',  rot: [0, 0.9, 0],          exhaust: null },
      energy:{ file: 'e3-energy-smr.glb',     rot: [0, 0.4, 0],          exhaust: null },
      mfg:   { file: 'e3-mfg-robot-arm.glb',  rot: [0, 0.9, 0],          exhaust: null },
    };

    const loader = new T.GLTFLoader();
    if (T.DRACOLoader) { const d = new T.DRACOLoader(); d.setDecoderPath(window.E3_DRACO_PATH || 'https://www.gstatic.com/draco/versioned/decoders/1.4.1/'); if (window.E3_DRACO_TYPE) d.setDecoderConfig({ type: window.E3_DRACO_TYPE }); loader.setDRACOLoader(d); if (d.preload) d.preload(); }

    const ready = {};      // key → { geos: [{geo, edges}], size, exhaust }
    const pending = {};
    const PROC = Object.assign({}, BUILD);  // keep procedural builders as fallback

    /* split one merged mesh into subassemblies for the exploded BOM: weld → connected components → axial bands + side parts */
    function splitParts(g, S) {
      const pos = g.attributes.position, nor = g.attributes.normal, n = pos.count;
      const idx = g.index ? g.index.array : null, triN = (idx ? idx.length : n) / 3;
      const vid = new Int32Array(n), map = new Map(); let u = 0;
      for (let i = 0; i < n; i++) { const key = Math.round(pos.getX(i) * 1e4) + ',' + Math.round(pos.getY(i) * 1e4) + ',' + Math.round(pos.getZ(i) * 1e4); let v = map.get(key); if (v === undefined) { v = u++; map.set(key, v); } vid[i] = v; }
      const par = new Int32Array(u); for (let i = 0; i < u; i++) par[i] = i;
      const find = a => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
      const V = t => idx ? idx[t] : t;
      for (let t = 0; t < triN; t++) { const a = find(vid[V(t * 3)]), b = find(vid[V(t * 3 + 1)]), c = find(vid[V(t * 3 + 2)]); par[b] = a; par[find(c)] = a; }
      const comps = new Map();
      for (let t = 0; t < triN; t++) { const r = find(vid[V(t * 3)]); let c = comps.get(r); if (!c) { c = { tris: [], sx: 0, sy: 0, sz: 0, m: 0 }; comps.set(r, c); } c.tris.push(t); for (let j = 0; j < 3; j++) { const i = V(t * 3 + j); c.sx += pos.getX(i); c.sy += pos.getY(i); c.sz += pos.getZ(i); c.m++; } }
      const halfW = Math.max(S.x, S.z) / 2, CUT = [-0.1, 0.17, 0.35], B = CUT.length + 1, groups = {};
      const bandOf = fy => { let k = 0; while (k < CUT.length && fy > CUT[k]) k++; return k; };
      const put = (tris, x, y, z, m, axial) => {
        const r = Math.hypot(x, z), band = bandOf(y / S.y);
        const key = !axial && r > halfW * 0.42 ? 'side' + (Math.atan2(z, x) > 0 ? 'a' : 'b') : 'b' + band;
        const G = groups[key] = groups[key] || { tris: [], cx: 0, cz: 0, cy: 0, m: 0, band, side: key[0] === 's' };
        for (let q = 0; q < tris.length; q++) G.tris.push(tris[q]);
        G.cx += x * m; G.cy += y * m; G.cz += z * m; G.m += m;
      };
      comps.forEach(c => {
        let y0 = Infinity, y1 = -Infinity, x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
        c.tris.forEach(t => { for (let j = 0; j < 3; j++) { const i = V(t * 3 + j), xx = pos.getX(i), yy = pos.getY(i), zz = pos.getZ(i); if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (zz < z0) z0 = zz; if (zz > z1) z1 = zz; } });
        const wide = Math.max(x1 - x0, z1 - z0) > halfW * 0.9;   // shells that wrap the axis (nozzle, chamber, rings) explode along it
        if (y1 - y0 > S.y * 0.22) {   // one big welded shell: cut it into sections triangle by triangle
          c.tris.forEach(t => { let x = 0, y = 0, z = 0; for (let j = 0; j < 3; j++) { const i = V(t * 3 + j); x += pos.getX(i); y += pos.getY(i); z += pos.getZ(i); } put([t], x / 3, y / 3, z / 3, 1, true); });
        } else put(c.tris, c.sx / c.m, c.sy / c.m, c.sz / c.m, c.m, wide);
      });
      Object.values(groups).forEach(G => { if (G.side) G.band = bandOf(G.cy / G.m / S.y); });
      const out = [];
      Object.values(groups).forEach(G => {
        if (!G.tris.length) return;
        const P = new Float32Array(G.tris.length * 9), N = nor ? new Float32Array(G.tris.length * 9) : null; let o = 0;
        G.tris.forEach(t => { for (let j = 0; j < 3; j++) { const i = V(t * 3 + j); P[o] = pos.getX(i); P[o + 1] = pos.getY(i); P[o + 2] = pos.getZ(i); if (N) { N[o] = nor.getX(i); N[o + 1] = nor.getY(i); N[o + 2] = nor.getZ(i); } o += 3; } });
        const ng = new T.BufferGeometry(); ng.setAttribute('position', new T.BufferAttribute(P, 3)); if (N) ng.setAttribute('normal', new T.BufferAttribute(N, 3)); else ng.computeVertexNormals();
        const cx = G.cx / G.m, cz = G.cz / G.m, rr = Math.hypot(cx, cz) || 1;
        const dir = new T.Vector3(G.side ? cx / rr * S.x * 0.55 : 0, (G.band - (B - 1) / 2) * S.y * 0.17 + (G.side ? 0.12 * S.y : 0), G.side ? cz / rr * S.z * 0.55 : 0);
        const eg = new T.EdgesGeometry(ng, 40), ep = eg.attributes.position.array, keep = [];
        for (let q = 0; q < ep.length; q += 6) if ((q / 6) % 7 === 0) for (let j = 0; j < 6; j++) keep.push(ep[q + j]);   // a light first pass of the drawing
        const es = new T.BufferGeometry(); es.setAttribute('position', new T.Float32BufferAttribute(keep, 3));
        out.push({ geo: ng, edges: eg, edgesSparse: es, dir });
      });
      return out.length > 1 ? out : null;
    }

    function bake(gltf, def) {
      const root = gltf.scene; root.rotation.set(def.rot[0], def.rot[1], def.rot[2]); root.updateMatrixWorld(true);
      const geos = [];
      root.traverse(o => { if (o.isMesh) { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); ['uv', 'uv2', 'color', 'tangent'].forEach(a => g.deleteAttribute(a)); geos.push(g); } });
      const box = new T.Box3(); geos.forEach(g => { g.computeBoundingBox(); box.union(g.boundingBox); });
      const c = box.getCenter(new T.Vector3()), s = box.getSize(new T.Vector3()), k = H / Math.max(s.x, s.y, s.z);
      let out = geos.map(g => { g.translate(-c.x, -c.y, -c.z); g.scale(k, k, k); if (!g.attributes.normal) g.computeVertexNormals(); return { geo: g, edges: new T.EdgesGeometry(g, 40) }; });
      const S = s.multiplyScalar(k);
      if (def.parts && out.length === 1) { try { const p = splitParts(out[0].geo, S); if (p) out = p; } catch (e) { console.warn('[E3D] split failed', e); } }
      const ex = def.exhaust && { pos: [def.exhaust.pos[0] * S.x, def.exhaust.pos[1] * S.y, def.exhaust.pos[2] * S.z], dir: def.exhaust.dir, len: def.exhaust.len };
      return { geos: out, exhaust: ex };
    }

    function chromeFor(M) {
      if (M.glbChrome) return M.glbChrome;
      M.glbChrome = new T.MeshStandardMaterial({      // clay: matte, non-metallic, reads form from light, matches the film
        color: 0x7a7772, metalness: 0, roughness: 0.7,
        envMap: M.chrome.envMap, envMapIntensity: 0.1, side: T.DoubleSide,
        clippingPlanes: M.chrome.clippingPlanes,     // same array object as the stage's clipSolid → sweep keeps working
      });
      return M.glbChrome;
    }

    Object.keys(GLB).forEach(key => {
      BUILD[key] = function (M) {
        const r = ready[key];
        if (!r) { if (key === 'hero' || ready.hero) load(key); return (PROC[key] || (() => ({ group: new T.Group(), exhaust: null })))(M); }   // nothing competes with the hero download
        const g = new T.Group(), mat = chromeFor(M);
        r.geos.forEach(({ geo, edges, edgesSparse, dir }) => { const m = new T.Mesh(geo, mat); m.userData.edges = edges; if (edgesSparse) m.userData.edgesSparse = edgesSparse; if (dir) m.userData.dir = dir; g.add(m); });
        return { group: g, exhaust: r.exhaust };   // no spin / meter on GLB models
      };
    });

    /* track live stages + their last visual state so a late GLB swaps in seamlessly */
    const live = new Set(), P = Stage.prototype;
    const _set = P.set, _show = P.show, _prog = P.progress, _use = P.setUsage, _plume = P.setPlume;
    P.set = function (k) { live.add(this); return _set.call(this, k); };
    P.show = function (m, a, d) { this._last = ['show', [m, false]]; return _show.call(this, m, a, d); };
    P.progress = function (w, s) { this._last = ['progress', [w, s]]; return _prog.call(this, w, s); };
    P.setUsage = function (p, d) { this._usage = [p, d]; return _use.call(this, p, d); };
    P.setPlume = function (on) { this._plume = on; return _plume.call(this, on); };

    function swapIn(key) {
      live.forEach(st => {
        if (st.key !== key) return;
        st.set(key);
        if (st._last) st[st._last[0]].apply(st, st._last[1]);
        if (st._usage) st.setUsage.apply(st, st._usage);
        if (st._plume != null) st.setPlume(st._plume);
        if (st.exK) st.explode(st.exK);
      });
    }

    function load(key) {
      if (ready[key] || pending[key]) return pending[key];
      const mark = n => { const t = window.__E3T; if (t) t[key + '.' + n] = Math.round(performance.now()); };
      mark('start');
      const ok = gltf => { mark('parsed'); ready[key] = bake(gltf, GLB[key]); swapIn(key); mark('shown'); return true; };
      const fail = err => { console.warn('[E3D] GLB failed, keeping procedural', key, err); return false; };
      if (AS_JS) {
        pending[key] = new Promise((res, rej) => {
          const box = window.__E3GLB = window.__E3GLB || {};
          if (box[key]) return res(box[key]);
          let n = 0;
          const tryLoad = () => {   // GitLab Pages occasionally drops a large transfer: retry twice, cache-busted, before falling back
            const sc = document.createElement('script'); sc.async = true; sc.src = BASE + GLB[key].file + '.js' + (n ? '?r=' + n + '-' + Date.now() : '');
            sc.onload = () => box[key] ? res(box[key]) : again(new Error('empty'));
            sc.onerror = again; document.head.appendChild(sc);
          };
          const again = e => { if (box[key]) return res(box[key]); if (++n > 2) return rej(e); setTimeout(tryLoad, 700 * n); };
          tryLoad();
        }).then(b64 => new Promise((res, rej) => {
          const bin = atob(b64), u = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
          loader.parse(u.buffer, '', res, rej);
        })).then(ok, fail);
      } else {
        pending[key] = new Promise(res => loader.load(BASE + GLB[key].file, g => res(ok(g)), undefined, e => res(fail(e))));
      }
      return pending[key];
    }

    const heroP = load('hero');
    const industry = ['civil', 'space', 'air', 'sea', 'land', 'orbit'];
    const idle = window.requestIdleCallback ? (f => requestIdleCallback(f, { timeout: 1200 })) : (f => setTimeout(f, 60));
    let queued = false;
    const near = () => {           // one model at a time, active tab first, so decode/edge work never stacks into one long freeze
      if (queued) return; queued = true;
      const on = document.querySelector('#e3-pm button.tab[aria-selected="true"]');
      const order = industry.slice().sort((a, b) => (on && b === on.dataset.id) - (on && a === on.dataset.id));
      order.reduce((p, k) => p.then(() => new Promise(r => idle(() => Promise.resolve(load(k)).then(r, r)))), Promise.resolve(heroP));
    };
    if (document.querySelector('#ind3d, #lc3d')) Promise.resolve(heroP).then(() => setTimeout(() => idle(near), 1500));   // warm the rest after the hero, before the user scrolls there
    const targets = ['#ind3d', '#lc3d'].map(s => document.querySelector(s)).filter(Boolean);
    if ('IntersectionObserver' in window && targets.length) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { near(); io.disconnect(); } }, { rootMargin: '600px' });
      targets.forEach(t => io.observe(t));
    } else if (targets.length) near();   // home page: hero only

    /* public handle (THREE.__e3dGlb.load(key)) for preloading from GSAP timelines if desired */
    T.__e3dGlb = { load, ready, GLB };
  })();

  window.E3D = { Stage, BUILD };
})();

  // hero: one solution, all platforms. Each model draws in as wireframe, then chrome.
  const ROT = [
    { k: 'hero',  sec: 'Commercial space', asset: 'Engine SN-07', n: 46, lim: 50, unit: 'starts' },
    { k: 'civil', sec: 'Civil aviation & MRO', asset: 'ESN 894-217', n: 1388, lim: 1500, unit: 'cycles' },
    { k: 'jet',   sec: 'Commercial aviation', asset: 'Airframe MSN 1204', n: 41200, lim: 45000, unit: 'cycles' },
    { k: 'air',   sec: 'Defense · Air', asset: 'Tail 18-0347', n: 188, lim: 200, unit: 'flight hrs' },
    { k: 'sea',   sec: 'Defense · Sea', asset: 'Gas turbine GTM 1A', n: 920, lim: 1000, unit: 'running hrs' },
    { k: 'sub',   sec: 'Defense · Undersea', asset: 'Propulsor PJ-2', n: 4100, lim: 5000, unit: 'running hrs' },
    { k: 'land',  sec: 'Defense · Land', asset: 'Vehicle 3-12', n: 9420, lim: 10000, unit: 'rounds' },
    { k: 'space', sec: 'Launch', asset: 'Launch vehicle LV-4', n: 8, lim: 10, unit: 'flights' },
    { k: 'orbit', sec: 'Defense · Space', asset: 'SV-2 bus', n: 6, lim: 8, unit: 'thermal cycles' },
    { k: 'energy', sec: 'Nuclear & energy', asset: 'Reactor module RM-1', n: 14, lim: 18, unit: 'months to refuel' },
    { k: 'mfg', sec: 'Advanced manufacturing', asset: 'Robot cell R-4', n: 7600, lim: 8000, unit: 'hrs to service' }
  ];
  const $ = id => document.getElementById(id);
  const dots = $('hud-dots'); ROT.forEach(() => dots.appendChild(document.createElement('i')));
  const fades = Array.from(document.querySelectorAll('.hud-fade'));
  function caption(it, idx) {
    fades.forEach(f => f.classList.add('out'));
    setTimeout(() => {
      $('hud-sec').textContent = it.sec; $('hud-asset').textContent = it.asset;
      $('hud-n').textContent = it.n.toLocaleString('en-US'); $('hud-of').textContent = '/ ' + it.lim.toLocaleString('en-US') + ' ' + it.unit;
      $('hud-fill').style.width = '0%'; $('hud-lim').style.left = '0%';
      Array.from(dots.children).forEach((d, k) => d.classList.toggle('on', k === idx));
      fades.forEach(f => f.classList.remove('out'));
      setTimeout(() => { const pct = Math.min(100, it.n / it.lim * 100); $('hud-fill').style.width = pct + '%'; $('hud-lim').style.left = 'calc(' + pct + '% - 1px)'; }, 400);
    }, 300);
  }
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  const hs = new E3D.Stage($('hero3d'), { sway: 0.45, fit: narrow ? 1.15 : 1.12, offset: narrow ? [0, 0.02] : [0.02, 0.04], elev: 0.16 });
  const G = THREE.__e3dGlb;
  if (hs.ok && G) {
    let ri = 0;
    const show = (idx) => {
      const it = ROT[idx];
      Promise.resolve(G.load(it.k)).then(() => {
        hs.set(it.k); caption(it, idx);
        // technical drawing first and held, then a slow solid build with a gentle 3-axis tumble, then back to the drawing
        if (reduce) hs.show('solid', false);
        else {
          hs.tiltTarget = 0; hs.show('wire', true, 1300);
          setTimeout(() => { hs.show('solid', true, 2400); hs.tiltTarget = 1; }, 3000);
          setTimeout(() => { hs.show('unsolid', true, 1500); hs.tiltTarget = 0; }, 8000);
        }
        G.load(ROT[(idx + 1) % ROT.length].k);   // warm the next platform while this one holds
        if (!reduce) setTimeout(() => show((idx + 1) % ROT.length), 9800);
      });
    };
    show(0);
  }
/* Epsilon3 home hero controller: scroll position -> lifecycle stage -> engine state. */
(function () {
  const root = document.getElementById('e3h');
  if (!root) return;
  const $ = s => root.querySelector(s), $$ = s => Array.from(root.querySelectorAll(s));
  const cards = $$('.e3h-card'), huds = $$('.e3h-hud'), links = $$('.e3h-rail a');
  const num = $('#e3h-n'), prog = $('#e3h-prog'), bfill = $('#e3h-bfill'), bpct = $('#e3h-bpct'), bsub = $('#e3h-bsub');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => window.matchMedia('(max-width: 900px), (orientation: portrait)').matches;

  // header height: the custom site header when present, else the theme header
  const setHdr = () => { const h = document.getElementById('e3c-header') || document.getElementById('header'); if (h) root.style.setProperty('--hdr', Math.round(h.getBoundingClientRect().height) + 'px'); };
  setHdr(); window.addEventListener('resize', setHdr);

  let stage = null;
  if (window.THREE && window.E3D) {
    stage = new E3D.Stage($('#e3h-3d'), { sway: 0.3, fit: phone() ? 1.25 : 1.12, offset: phone() ? [0, 0.02] : [0, 0.04], elev: 0.14 });
    if (stage.ok) { stage.set('hero'); stage.show('wire', !reduce); } else stage = null;
  }

  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  let cur = -1, last = { w: -1, s: -1 }, scrolled = false;
  let lastK = -1; const baseFit = stage ? stage.opts.fit : 1, baseOff = stage ? stage.offset.slice() : [0, 0];

  function span() { const pin = $('.e3h-pin').offsetHeight; return Math.max(1, root.offsetHeight - pin); }
  function update() {
    const hdr = parseFloat(getComputedStyle(root).getPropertyValue('--hdr')) || 0;
    const p = Math.min(1, Math.max(0, (hdr - root.getBoundingClientRect().top) / span()));
    const f = p * 5, i = Math.min(4, Math.floor(f)), t = Math.min(1, f - i);
    if (i !== cur) {
      cur = i; num.textContent = '0' + (i + 1);
      cards.forEach((c, k) => c.classList.toggle('on', k === i));
      huds.forEach((c, k) => c.classList.toggle('on', k === i));
      links.forEach((c, k) => { c.classList.toggle('on', k === i); c.classList.toggle('done', k < i); });
      if (stage) { stage.setPlume(i === 3); stage.scan(i === 4); }
      root.dataset.stage = i;
    }
    prog.style.width = (p * 100).toFixed(2) + '%';
    const b = i < 1 ? 0 : i > 1 ? 1 : ease(t);
    bfill.style.width = (b * 100).toFixed(1) + '%'; bpct.textContent = Math.round(b * 100) + '%';
    if (!stage) return;
    if (p > 0.001) scrolled = true;
    // Build is an exploded BOM: parts split out as drawings, take solid form apart, then come together
    const parts = stage.hasParts();
    let ex = 0, s = i < 1 ? 0 : 1;
    if (i === 1) {
      if (parts) { ex = t < 0.18 ? ease(t / 0.18) : t < 0.62 ? 1 : t < 0.95 ? 1 - ease((t - 0.62) / 0.33) : 0; s = t < 0.32 ? 0 : t < 0.6 ? ease((t - 0.32) / 0.28) : 1; }
      else s = b;
      if (bsub) bsub.textContent = t < 0.32 ? 'Exploded BOM · subassemblies released' : t < 0.62 ? 'Subassemblies built and inspected' : 'Final assembly · TP-112 torque verified';
    }
    if (Math.abs(ex - (stage.exK || 0)) > 0.0005) stage.explode(ex);
    if (scrolled) {   // before the first scroll the load-time wireframe draw-in plays on its own
      const w = 1;
      if (w !== last.w || s !== last.s) { stage.progress(w, s); last = { w, s }; }
    }
    // Plan: the drawing densifies as you scroll (outline edges first, then every edge)
    stage.density = i === 0 ? 0.08 + 0.92 * ease(t) : 1;
    // Build: the exploded BOM turns on several axes so the parts read in depth; zero at both ends for continuity
    const arc = i === 1 ? Math.sin(Math.PI * t) : 0;
    stage.rx = 0.38 * arc; stage.rz = 0.14 * Math.sin(2 * Math.PI * t) * (i === 1 ? 1 : 0);
    stage.yaw = i === 0 ? 0 : i === 1 ? 1.5 * arc : i === 2 ? 0.7 * ease(t) : i === 3 ? 0.7 : 0.7 * (1 - ease(t)) - 0.5 * ease(t);
    // Operate: pull back and lift the engine so the whole plume is in frame
    const k = i === 3 ? ease(Math.min(1, t / 0.3)) : i === 4 ? 1 - ease(Math.min(1, t / 0.3)) : 0;
    const kk = k + ex * 10;
    if (Math.abs(kk - lastK) > 0.001) {
      lastK = kk; stage.opts.fit = baseFit * (1 + 0.55 * k + 0.42 * ex); stage.offset = [baseOff[0], baseOff[1] - 0.22 * k]; stage.frame();
    }
    stage.loop();
  }
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  links.forEach((a, k) => a.addEventListener('click', e => {
    e.preventDefault();
    const top = root.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(root).getPropertyValue('--hdr')) || 0);
    window.scrollTo({ top: top + span() * (k + 0.5) / 5, behavior: reduce ? 'auto' : 'smooth' });
  }));
  update();
})();

})();

;
/* Before / after motion graphic: cards drift, then fly into the rows of one record. */
(function () {
  const root = document.getElementById('ba'); if (!root) return;
  const stage = root.querySelector('.ba-stage'), svg = root.querySelector('#ba-lines'), rec = root.querySelector('#ba-rec');
  const cards = Array.from(root.querySelectorAll('.ba-card')), rows = Array.from(root.querySelectorAll('.ba-rows li'));
  const tabs = Array.from(root.querySelectorAll('.ba-tabs button'));
  const thumb = root.querySelector('.ba-thumb'), meter = thumb && thumb.querySelector('i'), sweep = root.querySelector('.ba-sweep');
  const DWELL = { before: 3200, after: 5600 };
  /* selected look = a copy of the labels on the fill, clipped to the thumb, so text and fill always move together */
  const tabsEl = root.querySelector('.ba-tabs'), on = document.createElement('span'); on.className = 'ba-on'; on.setAttribute('aria-hidden', 'true');
  on.innerHTML = tabs.map(b => '<b>' + b.textContent + '</b>').join(''); if (tabsEl && thumb) tabsEl.insertBefore(on, thumb.nextSibling);
  function placeThumb() { const t = tabs.find(b => b.dataset.s === root.dataset.state) || tabs[0]; if (!thumb) return; const W = tabsEl.clientWidth, l = t.offsetLeft, w = t.offsetWidth;
    thumb.style.setProperty('--tx', l + 'px'); thumb.style.setProperty('--tw', w + 'px'); on.style.clipPath = 'inset(0 ' + Math.max(0, W - l - w) + 'px 0 ' + l + 'px)'; }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeThumb); addEventListener('resize', placeThumb);
  function runMeter(ms) { if (!meter) return; meter.classList.remove('run'); void meter.offsetWidth; if (ms) { meter.style.setProperty('--dwell', ms + 'ms'); meter.classList.add('run'); } }
  function doSweep(state) { if (!sweep || reduce) return; sweep.className = 'ba-sweep'; void sweep.offsetWidth; sweep.querySelector('b').textContent = state === 'after' ? 'With Epsilon3 →' : '← Before'; sweep.classList.add(state === 'after' ? 'to-a' : 'to-b'); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICON = {
    sms: '<path d="M3 4h18v12H8l-5 4z"/>', mail: '<path d="M3 5h18v14H3z"/><path d="m3 6 9 7 9-7"/>', pdf: '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/>',
    xls: '<path d="M3 4h18v16H3z"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>', paper: '<path d="M5 3h14v18H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    binder: '<path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M5 7h3M5 12h3M5 17h3"/>', head: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    sup: '<path d="M12 20V5M6 11l6-6 6 6"/>', field: '<path d="M12 4v15M6 13l6 6 6-6"/>', chat: '<path d="M4 4h16v11H9l-5 4z"/><path d="M9 8h6M9 11h4"/>'
  };
  cards.forEach((c, i) => { c.style.setProperty('--d', (i * -0.7) + 's'); const ic = c.querySelector('.ic'); if (ic) ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">' + (ICON[c.dataset.k] || '') + '</svg>'; });
  rows.forEach(r => r.style.setProperty('--i', r.dataset.i));
  const LINKS = [['sms', 'chat'], ['sms', 'head'], ['mail', 'sup'], ['pdf', 'binder'], ['pdf', 'paper'], ['xls', 'mail'], ['head', 'field'], ['binder', 'paper'], ['chat', 'field'], ['xls', 'sup']];
  const byK = k => cards.find(c => c.dataset.k === k);
  function center(el) { const s = stage.getBoundingClientRect(), b = el.getBoundingClientRect(); return [b.left - s.left + b.width / 2, b.top - s.top + b.height / 2]; }
  function drawLines() {
    const s = stage.getBoundingClientRect(); svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
    svg.innerHTML = LINKS.map(([a, b]) => { const [x1, y1] = center(byK(a)), [x2, y2] = center(byK(b)); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + 30; return `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}"/>`; }).join('');
  }
  /* fly targets: each card heads for the row it becomes (or the record header) */
  function targets() {
    const s = stage.getBoundingClientRect(), prev = root.dataset.state;
    cards.forEach(c => { c.style.setProperty('--fx', '0px'); c.style.setProperty('--fy', '0px'); });
    const recB = rec.getBoundingClientRect();
    cards.forEach(c => {
      const ri = +c.dataset.row, tgt = ri >= 0 ? rows[ri] : rec.querySelector('.ba-rh');
      const tb = tgt.getBoundingClientRect(), cb = c.getBoundingClientRect();
      // rec is scaled during "before"; use its final (unscaled) centre geometry
      const tx = (tb.left + tb.width / 2) - (cb.left + cb.width / 2), ty = (tb.top + tb.height / 2) - (cb.top + cb.height / 2);
      c.dataset.tx = tx; c.dataset.ty = ty;
    });
    root.dataset.state = prev;
  }
  function set(state, user, first) {
    if (user) { stopLoop(); runMeter(0); }
    if (!first && root.dataset.state !== state) doSweep(state);
    root.dataset.state = state;
    placeThumb();
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.s === state));
    if (state === 'after') {
      root.classList.remove('float');
      cards.forEach(c => { c.style.setProperty('--fx', c.dataset.tx + 'px'); c.style.setProperty('--fy', c.dataset.ty + 'px'); });
      rows.forEach(r => { r.classList.add('hit'); setTimeout(() => r.classList.remove('hit'), 1800 + (+r.dataset.i) * 120); });
    } else {
      cards.forEach(c => { c.style.setProperty('--fx', '0px'); c.style.setProperty('--fy', '0px'); });
      if (!reduce) setTimeout(() => { if (root.dataset.state === 'before') root.classList.add('float'); }, 1200);
    }
  }
  let loop = null, inView = false;
  let stopped = false;
  function tick() { loop = setTimeout(() => { if (!inView) { loop = null; runMeter(0); return; } set(root.dataset.state === 'before' ? 'after' : 'before'); runMeter(DWELL[root.dataset.state]); tick(); }, DWELL[root.dataset.state]); }
  function startLoop() { if (reduce || loop || stopped) return; runMeter(DWELL[root.dataset.state]); tick(); }
  function stopLoop() { clearTimeout(loop); loop = null; stopped = true; }
  tabs.forEach(t => t.addEventListener('click', () => set(t.dataset.s, true)));
  tabs.forEach((t, i) => t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = tabs[1 - i]; n.focus(); set(n.dataset.s, true); } }));
  function layout() { const st = root.dataset.state; root.dataset.state = 'before'; cards.forEach(c => { c.style.transition = 'none'; c.style.setProperty('--fx', '0px'); c.style.setProperty('--fy', '0px'); });
    rec.style.transition = 'none'; rec.style.transform = 'translate(-50%,-50%) scale(1)'; drawLines(); targets(); rec.style.transform = ''; void stage.offsetWidth; rec.style.transition = ''; cards.forEach(c => c.style.transition = ''); set(st, false, true); }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout); addEventListener('load', layout); layout();
  if (!reduce) root.classList.add('float');
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; if (inView) startLoop(); }, { threshold: 0.45 }).observe(stage);
  if (reduce) set('after');
})();

;
/* 109 tools -> one record: chips start scattered as separate tools, then fly into the stages they belong to */
(function () {
  const root = document.getElementById('stk'); if (!root) return;
  const stage = root.querySelector('#stk-stage'), chips = Array.from(root.querySelectorAll('.chip'));
  const heads = Array.from(root.querySelectorAll('.sg-h')), btns = Array.from(root.querySelectorAll('.stk-modes button'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function scatter() {
    const s = stage.getBoundingClientRect();
    chips.forEach(c => { c.style.transition = 'none'; c.style.setProperty('--sx', '0px'); c.style.setProperty('--sy', '0px'); });
    root.dataset.phase = 'scatter'; void stage.offsetWidth;
    chips.forEach(c => {
      const b = c.getBoundingClientRect();
      const tx = 16 + rnd() * Math.max(10, s.width - b.width - 32), ty = 44 + rnd() * Math.max(10, s.height - b.height - 60);
      c.style.setProperty('--sx', (tx - (b.left - s.left)).toFixed(0) + 'px'); c.style.setProperty('--sy', (ty - (b.top - s.top)).toFixed(0) + 'px'); c.style.setProperty('--sr', ((rnd() - .5) * 10).toFixed(1) + 'deg');
    });
    void stage.offsetWidth; chips.forEach(c => { c.style.transition = ''; });
  }
  function assemble() {
    chips.forEach((c, i) => c.style.setProperty('--d', (i * 0.012 + rnd() * 0.25).toFixed(2) + 's'));
    heads.forEach((h, i) => h.style.setProperty('--hd', (0.6 + i * 0.08).toFixed(2) + 's'));
    root.dataset.phase = 'one';
  }
  function play() { scatter(); setTimeout(assemble, 1400); }
  btns.forEach(b => b.addEventListener('click', () => { root.dataset.mode = b.dataset.m; btns.forEach(x => x.setAttribute('aria-pressed', x === b)); if (root.dataset.phase !== 'one') assemble(); }));
  document.getElementById('stk-replay').addEventListener('click', () => { if (!reduce) play(); });
  if (reduce || !('IntersectionObserver' in window)) { root.dataset.phase = 'one'; return; }
  const ready = () => scatter();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready); else ready();
  let done = false;
  new IntersectionObserver((es, io) => { if (!done && es[0].isIntersecting) { done = true; io.disconnect(); setTimeout(assemble, 900); } }, { threshold: 0, rootMargin: '0px 0px -45% 0px' }).observe(stage);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (root.dataset.phase === 'scatter') scatter(); }, 200); });
})();

;
/* integrations: lines from each source into the record, and from the record out to each system */
(function () {
  const ig = document.getElementById('ig'); if (!ig) return;
  const svg = document.getElementById('ig-lines'), core = document.getElementById('ig-core');
  function draw() {
    if (getComputedStyle(svg).display === 'none') return;
    const s = ig.getBoundingClientRect(), c = core.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
    const cy = c.top - s.top + c.height / 2, cl = c.left - s.left, cr = c.right - s.left;
    let out = '';
    ig.querySelectorAll('[data-l]').forEach((li, i) => { const b = li.getBoundingClientRect(), x = b.right - s.left, y = b.top - s.top + b.height / 2, ty = cy + (i - 2.5) * 10, mx = (x + cl) / 2;
      const d = `M${x},${y} C${mx},${y} ${mx},${ty} ${cl},${ty}`; out += `<path d="${d}"/><path class="flow" style="--d:${(i * .37).toFixed(2)}s" d="${d}"/>`; });
    ig.querySelectorAll('[data-r]').forEach((li, i) => { const b = li.getBoundingClientRect(), x = b.left - s.left, y = b.top - s.top + b.height / 2, sy = cy + (i - 3.5) * 8, mx = (cr + x) / 2;
      const d = `M${cr},${sy} C${mx},${sy} ${mx},${y} ${x},${y}`; out += `<path d="${d}"/><path class="flow" style="--d:${(1.1 + i * .31).toFixed(2)}s" d="${d}"/>`; });
    svg.innerHTML = out;
  }
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); addEventListener('load', draw); draw();
})();
