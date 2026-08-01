(() => {
  const container = document.querySelector(".now-assist-grainient, .project-grainient, .site-grainient");
  const canvas = container?.querySelector("canvas");
  if (!container || !canvas) return;

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    powerPreference: "high-performance"
  });
  if (!gl) return;

  const vertexSource = `#version 300 es
    in vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `#version 300 es
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform float uSiteVariant;
    out vec4 fragColor;

    #define S(a,b,t) smoothstep(a,b,t)

    mat2 Rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
      return fract(sin(p) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
      float n = mix(
        mix(
          dot(-1.0 + 2.0 * hash(i), f),
          dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)),
          u.x
        ),
        mix(
          dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(-1.0 + 2.0 * hash(i + vec2(1.0)), f - vec2(1.0)),
          u.x
        ),
        u.y
      );
      return 0.5 + 0.5 * n;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / iResolution.xy;
      float ratio = iResolution.x / iResolution.y;

      if (uSiteVariant > 0.5) {
        float siteTime = iTime * 0.75;
        vec2 siteTuv = (uv - 0.5) / 0.9;

        float siteDegree = noise(vec2(siteTime * 0.1, siteTuv.x * siteTuv.y) * 2.0);
        siteTuv.y /= ratio;
        siteTuv *= Rot(radians((siteDegree - 0.5) * 500.0 + 180.0));
        siteTuv.y *= ratio;

        float siteWarpTime = siteTime * 2.0;
        siteTuv.x += sin(siteTuv.y * 4.9 + siteWarpTime) / 50.0;
        siteTuv.y += sin(siteTuv.x * 7.35 + siteWarpTime) / 25.0;

        vec3 siteColor1 = vec3(1.0, 0.623529, 0.988235);
        vec3 siteColor2 = vec3(0.0);
        vec3 siteColor3 = vec3(0.705882, 0.592157, 0.811765);
        float siteBalance = -0.47;
        float siteSoftness = 0.12;
        float siteBlendX = siteTuv.x;
        float siteEdge0 = -0.3 - siteBalance - siteSoftness;
        float siteEdge1 = 0.2 - siteBalance + siteSoftness;
        float siteV0 = 0.5 - siteBalance + siteSoftness;
        float siteV1 = -0.3 - siteBalance - siteSoftness;
        vec3 siteLayer1 = mix(siteColor3, siteColor2, S(siteEdge0, siteEdge1, siteBlendX));
        vec3 siteLayer2 = mix(siteColor2, siteColor1, S(siteEdge0, siteEdge1, siteBlendX));
        vec3 siteCol = mix(siteLayer1, siteLayer2, 1.0 - S(siteV1, siteV0, siteTuv.y));

        vec2 siteGrainUv = uv * 2.0;
        float siteGrain = fract(sin(dot(siteGrainUv, vec2(12.9898, 78.233))) * 43758.5453);
        siteCol += (siteGrain - 0.5) * 0.1;
        siteCol = (siteCol - 0.5) * 1.5 + 0.5;
        float siteLuma = dot(siteCol, vec3(0.2126, 0.7152, 0.0722));
        siteCol = mix(vec3(siteLuma), siteCol, 1.0);
        siteCol = pow(max(siteCol, 0.0), vec3(1.0));
        fragColor = vec4(clamp(siteCol, 0.0, 1.0), 1.0);
        return;
      }

      float t = iTime * 1.1;
      vec2 tuv = (uv - 0.5) / 0.9;

      float degree = noise(vec2(t * 0.1, tuv.x * tuv.y) * 1.9);
      tuv.y /= ratio;
      tuv *= Rot(radians((degree - 0.5) * 500.0 + 180.0));
      tuv.y *= ratio;

      float warpTime = t * 2.2;
      tuv.x += sin(tuv.y * 4.3 + warpTime) / 53.0;
      tuv.y += sin(tuv.x * 6.45 + warpTime) / 26.5;

      vec3 color1 = vec3(0.7490, 0.5961, 0.9490);
      vec3 color2 = vec3(0.8000, 0.8784, 0.9412);
      vec3 color3 = vec3(0.3804, 0.6549, 0.6745);
      float blendX = (tuv * Rot(radians(-10.0))).x;
      vec3 layer1 = mix(color3, color2, S(-0.5, 0.4, blendX));
      vec3 layer2 = mix(color2, color1, S(-0.5, 0.4, blendX));
      vec3 col = mix(layer1, layer2, 1.0 - S(-0.5, 0.7, tuv.y));

      vec2 grainUv = uv * 2.0;
      float grain = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453);
      col += (grain - 0.5) * 0.1;
      col = (col - 0.5) * 1.5 + 0.5;
      col = clamp(col, 0.0, 1.0);
      fragColor = vec4(col, 1.0);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("Grainient shader compilation failed:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("Grainient program link failed:", gl.getProgramInfoLog(program));
    return;
  }

  const position = gl.getAttribLocation(program, "position");
  const resolution = gl.getUniformLocation(program, "iResolution");
  const time = gl.getUniformLocation(program, "iTime");
  const siteVariant = gl.getUniformLocation(program, "uSiteVariant");
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  gl.useProgram(program);
  gl.uniform1f(siteVariant, container.classList.contains("site-grainient") ? 1 : 0);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const startedAt = performance.now();
  let frame = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(window.innerWidth * dpr));
    const height = Math.max(1, Math.floor(window.innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const render = now => {
    resize();
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform1f(time, reduceMotion.matches ? 0 : (now - startedAt) * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = now => {
    render(now);
    frame = requestAnimationFrame(loop);
  };

  const start = () => {
    if (frame || document.hidden) return;
    if (reduceMotion.matches) {
      render(performance.now());
      return;
    }
    frame = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const onVisibilityChange = () => {
    if (document.hidden) stop();
    else start();
  };

  window.addEventListener("resize", () => render(performance.now()), { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  reduceMotion.addEventListener?.("change", () => {
    stop();
    start();
  });
  start();
})();
