'use strict';

// ═══════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════
var radius      = 240;
var autoRotate  = true;
var rotateSpeed = -60;
var imgWidth    = 120;
var imgHeight   = 170;

var bgMusicURL      = 'https://api.soundcloud.com/tracks/143041228/stream?client_id=587aa2d384f7333a886010d5f52f302a';
var bgMusicControls = true;


// ═══════════════════════════════════════════════
//  3D CAROUSEL
// ═══════════════════════════════════════════════
setTimeout(init3D, 1000);

var odrag = document.getElementById('drag-container');
var ospin = document.getElementById('spin-container');
var aImg  = ospin.getElementsByTagName('img');
var aVid  = ospin.getElementsByTagName('video');
var aEle  = [...aImg, ...aVid];

ospin.style.width  = imgWidth  + 'px';
ospin.style.height = imgHeight + 'px';

var ground = document.getElementById('ground');
ground.style.width  = radius * 3 + 'px';
ground.style.height = radius * 3 + 'px';

function init3D(delayTime) {
  for (var i = 0; i < aEle.length; i++) {
    aEle[i].style.transform       = 'rotateY(' + (i * (360 / aEle.length)) + 'deg) translateZ(' + radius + 'px)';
    aEle[i].style.transition      = 'transform 1s';
    aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + 's';
  }
}

function applyTransform(obj) {
  if (tY > 180) tY = 180;
  if (tY < 0)   tY = 0;
  obj.style.transform = 'rotateX(' + (-tY) + 'deg) rotateY(' + tX + 'deg)';
}

function playSpin(yes) {
  ospin.style.animationPlayState = yes ? 'running' : 'paused';
}

var desX = 0, desY = 0, tX = 0, tY = 10;

if (autoRotate) {
  var animationName = rotateSpeed > 0 ? 'spin' : 'spinRevert';
  ospin.style.animation = animationName + ' ' + Math.abs(rotateSpeed) + 's infinite linear';
}

if (bgMusicURL) {
  document.getElementById('music-container').innerHTML +=
    '<audio src="' + bgMusicURL + '" ' + (bgMusicControls ? 'controls' : '') + ' autoplay loop>' +
    '<p>Your browser does not support the audio element.</p></audio>';
}

document.onpointerdown = function (e) {
  clearInterval(odrag.timer);
  e = e || window.event;
  var sX = e.clientX, sY = e.clientY;

  this.onpointermove = function (e) {
    e = e || window.event;
    var nX = e.clientX, nY = e.clientY;
    desX = nX - sX;
    desY = nY - sY;
    tX += desX * 0.1;
    tY += desY * 0.1;
    applyTransform(odrag);
    sX = nX; sY = nY;
  };

  this.onpointerup = function () {
    odrag.timer = setInterval(function () {
      desX *= 0.95;
      desY *= 0.95;
      tX += desX * 0.1;
      tY += desY * 0.1;
      applyTransform(odrag);
      playSpin(false);
      if (Math.abs(desX) < 0.5 && Math.abs(desY) < 0.5) {
        clearInterval(odrag.timer);
        playSpin(true);
      }
    }, 17);
    this.onpointermove = this.onpointerup = null;
  };

  return false;
};

document.onmousewheel = function (e) {
  e = e || window.event;
  var d = e.wheelDelta / 20 || -e.detail;
  radius += d;
  init3D(1);
};


// ═══════════════════════════════════════════════
//  WEBGL HEART  (needs <canvas id="canvas">)
// ═══════════════════════════════════════════════
var heartCanvas = document.getElementById('canvas');
if (heartCanvas) {
  try {
    heartCanvas.width  = window.innerWidth;
    heartCanvas.height = window.innerHeight;

    var gl = heartCanvas.getContext('webgl');
    if (!gl) throw new Error('WebGL not supported');

    var glTime = 0.0;

    var vertexSource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

    var fragmentSource = `
precision highp float;
uniform float width;
uniform float height;
vec2 resolution = vec2(width, height);
uniform float time;
#define POINT_COUNT 8
vec2 points[POINT_COUNT];
const float speed = -0.5;
const float len = 0.25;
float intensity = 1.3;
float radius = 0.008;

float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C){
  vec2 a = B - A;
  vec2 b = A - 2.0*B + C;
  vec2 c = a * 2.0;
  vec2 d = A - pos;
  float kk = 1.0 / dot(b,b);
  float kx = kk * dot(a,b);
  float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
  float kz = kk * dot(d,a);
  float res = 0.0;
  float p = ky - kx*kx;
  float p3 = p*p*p;
  float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
  float h = q*q + 4.0*p3;
  if(h >= 0.0){
    h = sqrt(h);
    vec2 x = (vec2(h, -h) - q) / 2.0;
    vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
    float t = uv.x + uv.y - kx;
    t = clamp(t, 0.0, 1.0);
    vec2 qos = d + (c + b*t)*t;
    res = length(qos);
  } else {
    float z = sqrt(-p);
    float v = acos(q/(p*z*2.0)) / 3.0;
    float m = cos(v);
    float n = sin(v)*1.732050808;
    vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
    t = clamp(t, 0.0, 1.0);
    vec2 qos = d + (c + b*t.x)*t.x;
    float dis = dot(qos,qos);
    res = dis;
    qos = d + (c + b*t.y)*t.y;
    dis = dot(qos,qos);
    res = min(res,dis);
    qos = d + (c + b*t.z)*t.z;
    dis = dot(qos,qos);
    res = min(res,dis);
    res = sqrt(res);
  }
  return res;
}

vec2 getHeartPosition(float t){
  return vec2(16.0 * sin(t) * sin(t) * sin(t),
    -(13.0 * cos(t) - 5.0 * cos(2.0*t) - 2.0 * cos(3.0*t) - cos(4.0*t)));
}

float getGlow(float dist, float radius, float intensity){
  return pow(radius/dist, intensity);
}

float getSegment(float t, vec2 pos, float offset, float scale){
  for(int i = 0; i < POINT_COUNT; i++){
    points[i] = getHeartPosition(offset + float(i)*len + fract(speed * t) * 6.28);
  }
  vec2 c = (points[0] + points[1]) / 2.0;
  vec2 c_prev;
  float dist = 10000.0;
  for(int i = 0; i < POINT_COUNT-1; i++){
    c_prev = c;
    c = (points[i] + points[i+1]) / 2.0;
    dist = min(dist, sdBezier(pos, scale * c_prev, scale * points[i], scale * c));
  }
  return max(0.0, dist);
}

void main(){
  vec2 uv = gl_FragCoord.xy/resolution.xy;
  float widthHeightRatio = resolution.x/resolution.y;
  vec2 centre = vec2(0.5, 0.5);
  vec2 pos = centre - uv;
  pos.y /= widthHeightRatio;
  pos.y += 0.02;
  float scale = 0.000015 * height;
  float t = time;
  float dist = getSegment(t, pos, 0.0, scale);
  float glow = getGlow(dist, radius, intensity);
  vec3 col = vec3(0.0);
  col += 10.0*vec3(smoothstep(0.003, 0.001, dist));
  col += glow * vec3(1.0,0.05,0.3);
  dist = getSegment(t, pos, 3.4, scale);
  glow = getGlow(dist, radius, intensity);
  col += 10.0*vec3(smoothstep(0.003, 0.001, dist));
  col += glow * vec3(0.1,0.4,1.0);
  col = 1.0 - exp(-col);
  col = pow(col, vec3(0.4545));
  gl_FragColor = vec4(col,1.0);
}`;

    function compileShader(src, type) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw 'Shader compile failed: ' + gl.getShaderInfoLog(shader);
      return shader;
    }

    function getUniformLoc(prog, name) {
      var loc = gl.getUniformLocation(prog, name);
      if (loc === null) throw 'Cannot find uniform ' + name;
      return loc;
    }

    var vShader = compileShader(vertexSource,   gl.VERTEX_SHADER);
    var fShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
    var prog    = gl.createProgram();
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var vData = new Float32Array([-1,1, -1,-1, 1,1, 1,-1]);
    var vBuf  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
    gl.bufferData(gl.ARRAY_BUFFER, vData, gl.STATIC_DRAW);

    var posHandle = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posHandle);
    gl.vertexAttribPointer(posHandle, 2, gl.FLOAT, false, 8, 0);

    var timeHandle   = getUniformLoc(prog, 'time');
    var widthHandle  = getUniformLoc(prog, 'width');
    var heightHandle = getUniformLoc(prog, 'height');
    gl.uniform1f(widthHandle,  window.innerWidth);
    gl.uniform1f(heightHandle, window.innerHeight);

    var lastGLFrame = Date.now();

    function drawGL() {
      var now = Date.now();
      glTime += (now - lastGLFrame) / 1000;
      lastGLFrame = now;
      gl.uniform1f(timeHandle, glTime);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(drawGL);
    }
    drawGL();

    window.addEventListener('resize', function () {
      heartCanvas.width  = window.innerWidth;
      heartCanvas.height = window.innerHeight;
      gl.viewport(0, 0, heartCanvas.width, heartCanvas.height);
      gl.uniform1f(widthHandle,  window.innerWidth);
      gl.uniform1f(heightHandle, window.innerHeight);
    });

  } catch(e) {
    console.warn('WebGL heart skipped:', e);
  }
}


// ═══════════════════════════════════════════════
//  MUSIC CONTROL
// ═══════════════════════════════════════════════
var music     = document.getElementById('bgMusic');
var musicBtn  = document.getElementById('musicControl');
var isPlaying = false;

function fadeInAudio() {
  if (!music) return;
  music.volume = 0;
  music.play().catch(function () {});
  var vol  = 0;
  var fade = setInterval(function () {
    if (vol < 0.3) { vol += 0.02; music.volume = vol; }
    else clearInterval(fade);
  }, 200);
}

document.addEventListener('click', function () {
  if (!isPlaying) {
    fadeInAudio();
    isPlaying = true;
    if (musicBtn) musicBtn.classList.remove('paused');
  }
}, { once: true });

if (musicBtn) {
  musicBtn.addEventListener('click', function () {
    if (music.paused) {
      music.play();
      musicBtn.classList.remove('paused');
    } else {
      music.pause();
      musicBtn.classList.add('paused');
    }
  });
}


// ═══════════════════════════════════════════════
//  FIREWORKS  — shells fly up and burst
// ═══════════════════════════════════════════════
var tc = document.getElementById('t');
var mc = document.getElementById('c');
var tx = tc.getContext('2d');
var mx = mc.getContext('2d');

var W = window.innerWidth;
var H = window.innerHeight;
tc.width = mc.width = W;
tc.height = mc.height = H;

var GRAVITY_FW = 0.12;
var FW_COLORS  = ['#ff0043','#14fc56','#1e7fff','#e60aff','#ffbf36','#ffffff','#ff6600','#00ffcc'];

function rand(a, b)  { return Math.random() * (b - a) + a; }
function randInt(a, b){ return Math.floor(rand(a, b + 1)); }
function pick(arr)   { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Particle ──
function Particle(x, y, color, angle, speed, life) {
  this.x  = this.px = x;
  this.y  = this.py = y;
  this.color   = color;
  this.vx      = Math.cos(angle) * speed;
  this.vy      = Math.sin(angle) * speed;
  this.life    = life;
  this.maxLife = life;
  this.dead    = false;
}
Particle.prototype.update = function (dt) {
  this.life -= dt;
  if (this.life <= 0) { this.dead = true; return; }
  this.px  = this.x;  this.py  = this.y;
  this.x  += this.vx * dt * 0.06;
  this.y  += this.vy * dt * 0.06;
  this.vy += GRAVITY_FW * dt * 0.06;
  this.vx *= 0.98;
  this.vy *= 0.98;
};

// ── Shell (flies up, then bursts) ──
function FWShell() {
  this.x  = rand(W * 0.15, W * 0.85);
  this.y  = H;
  this.tx = rand(W * 0.10, W * 0.90);
  this.ty = rand(H * 0.10, H * 0.55);
  var dx   = this.tx - this.x;
  var dy   = this.ty - this.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  var spd  = rand(6, 9);
  this.vx    = (dx / dist) * spd;
  this.vy    = (dy / dist) * spd;
  this.color = pick(FW_COLORS);
  this.trail = [];
  this.dead  = false;
}
FWShell.prototype.update = function (dt) {
  this.trail.push({ x: this.x, y: this.y });
  if (this.trail.length > 14) this.trail.shift();
  this.x  += this.vx * dt * 0.06;
  this.y  += this.vy * dt * 0.06;
  this.vy += GRAVITY_FW * dt * 0.06 * 0.5;
  if (this.vy >= 0 ||
      (Math.abs(this.x - this.tx) < 15 && Math.abs(this.y - this.ty) < 15)) {
    this.dead = true;
    return { x: this.x, y: this.y, color: this.color };
  }
  return null;
};

var fwParticles = [];
var fwShells    = [];
var fwLastTime  = 0;
var fwNext      = 0;

function burst(x, y, color) {
  var type = Math.random();

  if (type < 0.2) {
    var count = randInt(60, 100);
    var r     = rand(60, 110);
    for (var i = 0; i < count; i++) {
      var a = (i / count) * Math.PI * 2 + rand(-0.1, 0.1);
      fwParticles.push(new Particle(x, y, color, a, rand(r*0.9, r*1.1)/18, rand(1200,1800)));
    }
  } else if (type < 0.45) {
    var count = randInt(120, 200);
    for (var i = 0; i < count; i++) {
      var c = Math.random() < 0.5 ? color : pick(FW_COLORS);
      fwParticles.push(new Particle(x, y, c, rand(0, Math.PI*2), rand(1,7), rand(1000,1600)));
    }
    for (var i = 0; i < 40; i++)
      fwParticles.push(new Particle(x, y, '#ffbf36', rand(0, Math.PI*2), rand(0.5,2.5), rand(2000,3000)));
  } else if (type < 0.65) {
    var count = randInt(80, 140);
    var c2    = pick(FW_COLORS.filter(function(c){ return c !== color; }));
    for (var i = 0; i < count; i++)
      fwParticles.push(new Particle(x, y, i < count/2 ? color : c2, rand(0, Math.PI*2), rand(2,6), rand(900,1400)));
  } else {
    var count = randInt(100, 160);
    for (var i = 0; i < count; i++) {
      fwParticles.push(new Particle(x, y, color, rand(0, Math.PI*2), rand(1.5,6.5), rand(1000,1500)));
      if (Math.random() < 0.3) {
        (function(px, py) {
          setTimeout(function() {
            fwParticles.push(new Particle(
              px + rand(-20,20), py + rand(-20,20),
              '#ffbf36', rand(0, Math.PI*2), rand(1.5,4), rand(300,600)
            ));
          }, rand(200, 600));
        })(x, y);
      }
    }
  }

  for (var i = 0; i < 8; i++)
    fwParticles.push(new Particle(x, y, '#ffffff', rand(0, Math.PI*2), rand(0.3,1.5), rand(600,1000)));
}

function drawFW(ts) {
  var dt = Math.min(ts - fwLastTime, 50);
  fwLastTime = ts;

  tx.globalCompositeOperation = 'source-over';
  tx.fillStyle = 'rgba(0,0,0,0.18)';
  tx.fillRect(0, 0, W, H);
  mx.clearRect(0, 0, W, H);

  tx.globalCompositeOperation = 'lighten';

  for (var i = fwShells.length - 1; i >= 0; i--) {
    var s   = fwShells[i];
    var res = s.update(dt);
    if (res) {
      burst(res.x, res.y, res.color);
      fwShells.splice(i, 1);
    } else if (s.dead) {
      fwShells.splice(i, 1);
    } else {
      tx.strokeStyle = s.color;
      tx.lineWidth   = 2;
      tx.lineCap     = 'round';
      tx.beginPath();
      s.trail.forEach(function(p, idx) {
        if (idx === 0) tx.moveTo(p.x, p.y);
        else           tx.lineTo(p.x, p.y);
      });
      tx.lineTo(s.x, s.y);
      tx.globalAlpha = 0.7;
      tx.stroke();
      tx.globalAlpha = 1;
    }
  }

  tx.lineWidth = 2;
  tx.lineCap   = 'round';
  for (var i = fwParticles.length - 1; i >= 0; i--) {
    var p = fwParticles[i];
    p.update(dt);
    if (p.dead) { fwParticles.splice(i, 1); continue; }
    tx.globalAlpha = Math.max(0, p.life / p.maxLife) * 0.9;
    tx.strokeStyle  = p.color;
    tx.beginPath();
    tx.moveTo(p.px, p.py);
    tx.lineTo(p.x,  p.y);
    tx.stroke();
  }
  tx.globalAlpha = 1;

  fwNext -= dt;
  if (fwNext <= 0) {
    var count = Math.random() < 0.25 ? 2 : 1;
    for (var i = 0; i < count; i++) {
      (function(delay) {
        setTimeout(function() { fwShells.push(new FWShell()); }, delay);
      })(i * rand(100, 400));
    }
    fwNext = rand(800, 1800);
  }

  requestAnimationFrame(drawFW);
}

// Click anywhere to burst
document.addEventListener('click', function(e) {
  burst(e.clientX, e.clientY, pick(FW_COLORS));
});

// Resize
window.addEventListener('resize', function() {
  W = window.innerWidth;
  H = window.innerHeight;
  tc.width = mc.width = W;
  tc.height = mc.height = H;
});

// Kick off fireworks loop
requestAnimationFrame(function(t) {
  fwLastTime = t;
  requestAnimationFrame(drawFW);
});
