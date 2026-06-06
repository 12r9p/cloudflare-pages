// GSAP plugins registration
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. オープニング・プレローダー ＆ ヒーロー・イントロ・アニメーション
  // ==========================================
  const preloader = document.getElementById("preloader");
  const percentText = document.getElementById("preloaderPercent");
  const preloaderNeedle = document.getElementById("preloaderNeedle");

  // オーラをゆっくり鼓動させる
  gsap.to(".preloader-compass-glow", {
    scale: 1.18,
    opacity: 0.85,
    duration: 0.9,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
  });

  // ロードパーセントのダミーカウントアップ ＆ 針の磁気暴風回転
  const loadProgress = { value: 0 };
  
  // 針をロード中にランダムな揺らぎを伴いながら激しく回転させる
  const needleRotationTween = gsap.to(preloaderNeedle, {
    rotation: 3600, // 大きく回す
    duration: 2.1,
    ease: "power1.inOut",
    transformOrigin: "50% 50%"
  });

  // プレローダー専用のスパークル生成関数
  const triggerPreloaderSparkles = () => {
    const wrapper = document.querySelector(".preloader-compass-wrapper");
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2 - 38; // コンパスの中心から見て北（真上）の針の先端位置に完璧に合わせる
    
    const colors = ["#d97706", "#f43f5e", "#fff", "#10b981"];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      p.classList.add("cb-particle");
      p.style.width = `${Math.random() * 6 + 4}px`;
      p.style.height = `${Math.random() * 6 + 4}px`;
      p.style.borderRadius = "50%";
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.position = "fixed";
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      p.style.zIndex = "999999";
      document.body.appendChild(p);
      
      const angle = -Math.PI / 2 + (Math.random() * Math.PI * 0.6 - Math.PI * 0.3); // 上方向へ放射
      const speed = Math.random() * 90 + 40;
      gsap.to(p, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        scale: 0.1,
        opacity: 0,
        duration: Math.random() * 0.6 + 0.4,
        ease: "power2.out",
        onComplete: () => p.remove()
      });
    }
  };

  // プレローダーの退場アニメーション（北ロック ＆ 3Dズームスルー）
  const triggerPreloaderOut = () => {
    const outTl = gsap.timeline({
      onComplete: () => {
        if (preloader) preloader.style.display = "none";
        // プレローダー完全退場後にヒーロー登場を実行
        playHeroIntro();
      }
    });

    // A. 針を「北（0度）」にピタッとロック（3600度の位置＝真上）
    // カチッと止まる質感のために、弾性バウンドを加える
    outTl.to(preloaderNeedle, {
      rotation: 3600,
      duration: 0.5,
      ease: "back.out(2.4)", // 強めのバウンドでロックされる質感
      transformOrigin: "50% 50%",
      onComplete: () => {
        // ロックの瞬間にスパークルバースト
        triggerPreloaderSparkles();
        // コンパス自体を一瞬鋭くシェイク（打撃）
        gsap.fromTo(".preloader-compass", 
          { y: -6 }, 
          { y: 0, duration: 0.3, ease: "elastic.out(2, 0.3)" }
        );
      }
    });

    // B. カメラがコンパスの中心に突進（超高速3Dズームスルー）
    // scaleを廃止し、純粋な z-axis（3D空間の奥行き）の移動のみにすることで
    // ベクターSVGの解像度を維持したままドット化・ボケ無しで滑らかに突き抜けます
    outTl.to(".preloader-content", {
      z: 2200,
      opacity: 0,
      duration: 1.15,
      ease: "power4.in",
      transformOrigin: "center center"
    }, "+=0.35");

    outTl.to(preloader, {
      opacity: 0,
      duration: 0.9,
      ease: "power3.in"
    }, "-=0.6");
  };

  gsap.to(loadProgress, {
    value: 100,
    duration: 2.1,
    ease: "power2.out",
    onUpdate: () => {
      if (percentText) {
        percentText.textContent = Math.floor(loadProgress.value);
      }
      // カウントアップ中はコンパス全体も細かくブルブルさせる
      if (Math.random() > 0.4) {
        gsap.set(".preloader-compass", {
          x: (Math.random() - 0.5) * 2.2,
          y: (Math.random() - 0.5) * 2.2
        });
      }
    },
    onComplete: () => {
      // プレローダー退場処理を呼び出す
      triggerPreloaderOut();
    }
  });

  // ヒーロー登場の超ダイナミックタイムライン（3Dカメラ同期）
  const playHeroIntro = () => {
    const tl = gsap.timeline();
    const mainEl = document.querySelector("main");

    // 突き抜けの余韻：ページ全体（main）を一瞬手前に引き出してから定位置に収める
    if (mainEl) {
      tl.fromTo(mainEl,
        { z: 120, rotationX: 8 },
        { z: 0, rotationX: 0, duration: 1.5, ease: "power3.out" },
        0
      );
    }

    // A. タイトル H1 が手前への超巨大ズームから、3Dで揺れながら定位置に収まる
    tl.fromTo(".hero-content h1",
      { opacity: 0, scale: 1.8, rotationX: 25, z: 150, transformPerspective: 1000 },
      { opacity: 1, scale: 1, rotationX: 0, z: 0, duration: 1.3, ease: "back.out(1.4)" },
      0.1
    );

    // B. キッカーとサブタイトルがそれぞれ左右からスライドイン
    tl.fromTo(".hero-content .kicker",
      { opacity: 0, x: -60, rotationY: -30 },
      { opacity: 1, x: 0, rotationY: 0, duration: 0.7, ease: "power3.out" },
      "-=0.9"
    );
    tl.fromTo(".hero-content .subtitle",
      { opacity: 0, x: 60, rotationY: 30 },
      { opacity: 1, x: 0, rotationY: 0, duration: 0.7, ease: "power3.out" },
      "-=0.8"
    );

    // C. ヒーローシーン画像が、最初は超巨大（はみ出し）から、額縁にキュッと吸い込まれるように収まる
    tl.fromTo(".forest-scene",
      { opacity: 0, scale: 1.5, rotationY: -10, transformOrigin: "center center" },
      { opacity: 1, scale: 1, rotationY: 0, duration: 1.3, ease: "power4.out" },
      "-=1.0"
    );

    // D. 開催情報のチップ（イベントストリップリンク）が左から順々に浮き上がる
    tl.fromTo(".event-strip-link",
      { opacity: 0, y: 30, rotationX: -45, transformPerspective: 500 },
      { opacity: 1, y: 0, rotationX: 0, stagger: 0.08, duration: 0.7, ease: "back.out(1.7)" },
      "-=0.8"
    );

    // E. リード文章がすっきりとフェードアップ
    tl.fromTo(".hero-content .lead",
      { opacity: 0, y: 30, rotationX: 15 },
      { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out" },
      "-=0.7"
    );

    // F. 任務チケットが下からポコポコとバウンドして飛び出す
    tl.fromTo(".mission-ticket strong, .mission-ticket span",
      { opacity: 0, y: 60, scale: 0.8, rotationZ: -5 },
      { opacity: 1, y: 0, scale: 1, rotationZ: 0, stagger: 0.08, duration: 0.9, ease: "back.out(2.0)" },
      "-=0.7"
    );

    // G. アクションボタンが時間差で跳ねるように出現
    tl.fromTo(".hero-actions .button",
      { opacity: 0, scale: 0.8, y: 15 },
      { opacity: 1, scale: 1, y: 0, stagger: 0.12, duration: 0.6, ease: "back.out(1.8)" },
      "-=0.6"
    );
  };

  // ==========================================
  // 2. Lenis スムーススクロールの初期化 ＆ Velocity（速度）補間監視
  // ==========================================
  const lenis = new Lenis({
    duration: 1.3,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  const scrollSpeed = { target: 0, current: 0 };
  lenis.on('scroll', (e) => {
    scrollSpeed.target = e.velocity;
  });

  // ==========================================
  // 3. スクロール速度連動ゴム弾性（Squish & Stretch）
  // ==========================================
  const squishTargets = document.querySelectorAll(".hero-image, .map-card, .info-table");

  // ==========================================
  // 4. 木の葉の物理演算・風速・マウス斥力シミュレーター
  // ==========================================
  const leavesContainer = document.getElementById("leavesContainer");
  let updateLeavesPhysics = () => {};

  if (leavesContainer) {
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    leavesContainer.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const mouse = { x: -1000, y: -1000, radius: 150 };
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });
    window.addEventListener("touchend", () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    class Leaf {
      constructor() {
        this.reset();
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -30;
        this.size = Math.random() * 14 + 10;
        this.vx = Math.random() * 1.5 - 0.75;
        this.vy = Math.random() * 1.0 + 0.8;
        this.angle = Math.random() * 360;
        this.vAngle = Math.random() * 2 - 1;
        this.color = Math.random() > 0.65 ? "#d97706" : "#10b981";
        this.opacity = Math.random() * 0.16 + 0.12;
      }

      update(windX, windY) {
        this.vx += Math.sin(this.y * 0.015) * 0.06;
        this.vx += windX * 0.12;
        this.vy += windY * 0.12;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 5;
          this.vy += Math.sin(angle) * force * 5;
        }

        this.vx *= 0.94;
        this.vy = Math.max(0.6, this.vy * 0.97);

        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.vAngle + this.vx * 0.4;

        if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.quadraticCurveTo(this.size / 2, -this.size / 2, this.size / 2, 0);
        ctx.quadraticCurveTo(this.size / 2, this.size / 2, 0, this.size / 2);
        ctx.quadraticCurveTo(-this.size / 2, this.size / 2, -this.size / 2, 0);
        ctx.quadraticCurveTo(-this.size / 2, -this.size / 2, 0, -this.size / 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    const leaves = Array.from({ length: 30 }, () => new Leaf());

    updateLeavesPhysics = (windX, windY) => {
      ctx.clearRect(0, 0, width, height);
      leaves.forEach(leaf => {
        leaf.update(windX, windY);
        leaf.draw();
      });
    };
  }

  // ゴム弾性の quickSetter キャッシュ定義
  const squishSetters = Array.from(squishTargets).map(target => ({
    target,
    setX: gsap.quickSetter(target, "scaleX"),
    setY: gsap.quickSetter(target, "scaleY")
  }));

  // ページ全体の3Dカメラワーク（傾斜＆沈み込み）用 quickSetter キャッシュ定義
  const mainEl = document.querySelector("main");
  if (mainEl) {
    gsap.set(mainEl, { transformPerspective: 1600, transformStyle: "preserve-3d" });
  }
  const setMainRotateX = mainEl ? gsap.quickSetter(mainEl, "rotationX") : () => {};
  const setMainZ = mainEl ? gsap.quickSetter(mainEl, "z") : () => {};

  let isSquishing = false;
  let isCameraTilted = false;

  gsap.ticker.add(() => {
    scrollSpeed.current += (scrollSpeed.target - scrollSpeed.current) * 0.085;
    const windX = scrollSpeed.current * 0.8;
    const windY = Math.abs(scrollSpeed.current) * 0.4;
    updateLeavesPhysics(windX, windY);

    const absVel = Math.abs(scrollSpeed.current);
    
    // スクロール速度に応じたページ全体の3Dカメラワーク（傾斜＆沈み込み）
    if (mainEl && absVel > 0.05) {
      isCameraTilted = true;
      const pageTilt = Math.min(Math.max(scrollSpeed.current * -0.015, -4.5), 4.5); // 緩やかかつ体感できる傾き
      const pageZ = Math.min(Math.max(absVel * -0.06, -25), 0); // スクロール時に奥へ沈み込む
      setMainRotateX(pageTilt);
      setMainZ(pageZ);
    } else if (mainEl && isCameraTilted) {
      isCameraTilted = false;
      // 停止時にカメラを弾性バウンスで元の位置に戻す
      gsap.to(mainEl, {
        rotationX: 0,
        z: 0,
        duration: 0.85,
        overwrite: "auto",
        ease: "elastic.out(1.1, 0.45)"
      });
    }

    if (absVel > 0.08) {
      isSquishing = true;
      const stretch = Math.min(absVel * 0.005, 0.06);
      const squish = Math.min(absVel * 0.003, 0.04);
      // quickSetterでTweenインスタンスを生成せずに直接値を更新
      squishSetters.forEach(s => {
        s.setX(1 - squish);
        s.setY(1 + stretch);
      });
    } else if (isSquishing) {
      // 停止した瞬間に一度だけ、弾性バウンスで元のスケールに戻すTweenを走らせる
      isSquishing = false;
      squishTargets.forEach(target => {
        gsap.to(target, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.65,
          overwrite: "auto",
          ease: "elastic.out(1.2, 0.48)"
        });
      });
    }
  });

  // ==========================================
  // 5. 文字分割（Split Text）3Dアニメーションの設定
  // ==========================================
  const splitTitle = (element) => {
    if (!element) return;
    const text = element.textContent.trim();
    element.innerHTML = "";
    [...text].forEach((char) => {
      const span = document.createElement("span");
      span.classList.add("char");
      span.textContent = char === " " ? "\u00A0" : char;
      element.appendChild(span);
    });
  };

  const splitTextElements = document.querySelectorAll(".split-txt, .section-copy h2, .section-heading h2, .classified h2, .final-cta h2");
  splitTextElements.forEach(splitTitle);

  splitTextElements.forEach((title) => {
    const chars = title.querySelectorAll(".char");
    if (chars.length > 0) {
      gsap.fromTo(chars,
        { opacity: 0, y: 35, rotateX: -95, scale: 0.7, transformPerspective: 800 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.3)",
          stagger: 0.035,
          scrollTrigger: {
            trigger: title,
            start: "top 86%",
            toggleActions: "play none none none"
          }
        }
      );
    }
  });

  // ==========================================
  // 6. 背景の「冒険の道」SVGルート自動描画 ＆ 発光ピン追従
  // ==========================================
  const activePath = document.getElementById("adventurePathActive");
  const pathTracker = document.getElementById("pathTracker");

  if (activePath && pathTracker) {
    const pathLength = activePath.getTotalLength();
    gsap.set(activePath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
    gsap.set(pathTracker, { opacity: 0, scale: 0 });

    // 1. パスの描画進捗
    gsap.to(activePath, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6
      }
    });

    // 2. ピンのMotionPath追従
    gsap.to(pathTracker, {
      motionPath: {
        path: "#adventurePathActive",
        autoRotate: true,
        align: "#adventurePathActive",
        alignOrigin: [0.5, 0.5]
      },
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(pathTracker, {
            opacity: progress > 0.005 && progress < 0.995 ? 1 : 0,
            scale: progress > 0.005 && progress < 0.995 ? 1 : 0
          });

          // 速度が速い場合、ピンの後方に火花を生成
          const speed = Math.abs(self.getVelocity());
          if (speed > 220 && Math.random() > 0.45) {
            const trackerRect = pathTracker.getBoundingClientRect();
            const bgRect = document.querySelector(".adventure-path-bg").getBoundingClientRect();
            const x = trackerRect.left - bgRect.left + trackerRect.width / 2;
            const y = trackerRect.top - bgRect.top + trackerRect.height / 2;
            createSparkle(x, y);
          }
        }
      }
    });

    const createSparkle = (x, y) => {
      const p = document.createElement("div");
      p.classList.add("sparkle-particle");
      const bg = document.querySelector(".adventure-path-bg");
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      bg.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40 + 15;
      gsap.to(p, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: 0.1,
        opacity: 0,
        duration: Math.random() * 0.4 + 0.25,
        ease: "power2.out",
        onComplete: () => p.remove()
      });
    };
  }

  // ==========================================
  // 7. GSAP ScrollTrigger レイアウト・演出
  // ==========================================
  const mm = gsap.matchMedia();
  gsap.to(".scroll-progress", {
    width: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: true
    }
  });

  gsap.to(".compass-widget", {
    opacity: 1,
    scale: 1,
    duration: 0.35,
    scrollTrigger: {
      trigger: "body",
      start: "top+=100 top",
      toggleActions: "play reverse play reverse"
    }
  });

  let compassNeedleRotation = 0;

  // コンパス用スパークル生成関数
  const createCompassSparkle = (x, y) => {
    const p = document.createElement("div");
    p.classList.add("cb-particle");
    p.style.width = "4px";
    p.style.height = "4px";
    p.style.borderRadius = "50%";
    p.style.backgroundColor = Math.random() > 0.5 ? "var(--red)" : "var(--yellow)";
    p.style.position = "fixed";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.zIndex = "99999";
    document.body.appendChild(p);
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 25 + 10;
    gsap.to(p, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      scale: 0.1,
      opacity: 0,
      duration: Math.random() * 0.4 + 0.2,
      ease: "power2.out",
      onComplete: () => p.remove()
    });
  };

  gsap.ticker.add(() => {
    compassNeedleRotation += scrollSpeed.current * 0.9;
    
    // スクロール速度が速い時のジッター（小刻みな震え）
    const speed = Math.abs(scrollSpeed.current);
    let jitter = 0;
    if (speed > 1.2) {
      jitter = (Math.random() - 0.5) * speed * 3.5;
      
      // ジッター時に、コンパスの周囲に小さな火花を自動放出
      if (Math.random() > 0.72) {
        const compassWidget = document.getElementById("compassWidget");
        if (compassWidget) {
          const rect = compassWidget.getBoundingClientRect();
          createCompassSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }
    }
    
    gsap.set(".compass-needle", { 
      rotation: compassNeedleRotation + (window.scrollY * 0.1) + jitter,
      transformOrigin: "50% 50%"
    });
    gsap.set(".compass-dial", { rotation: -compassNeedleRotation - (window.scrollY * 0.03) + (jitter * 0.4) });
  });

  gsap.to(".hero-image", { yPercent: -14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".map-image", { yPercent: -22, ease: "none", scrollTrigger: { trigger: ".map-card", start: "top bottom", end: "bottom top", scrub: true } });

  document.querySelectorAll(".reveal").forEach((section) => {
    const targets = section.querySelectorAll("p, .subtitle, .event-strip, .hero-actions, .button, .info-table > div, ul.tools li, .belongings li");
    targets.forEach((target) => {
      if (!target.classList.contains("stamp") && !target.classList.contains("map-card") && !target.classList.contains("trial")) target.classList.add("reveal-item");
    });
    const revealItems = section.querySelectorAll(".reveal-item");
    if (revealItems.length > 0) {
      gsap.fromTo(revealItems,
        { opacity: 0, y: 30, rotationX: 10, transformPerspective: 800 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: section, start: "top 83%", toggleActions: "play none none none" } }
      );
    }
  });

  mm.add("(min-width: 981px)", () => {
    // 5つの試練セクションでの縦並び登場アニメーション
    // 画面にセクションが入った際、3Dフリップ＆浮き上がりのスタッガー（時差）フェードインでプレミアム感を演出
    gsap.fromTo(".trial",
      { 
        opacity: 0, 
        scale: 0.85, 
        y: 60, 
        rotationX: -22, 
        rotationY: 12,
        transformPerspective: 1000 
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        duration: 0.95,
        ease: "back.out(1.3)",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".trial-grid",
          start: "top 82%", // カードグリッドの上がビューポートの82%に達したときに再生開始
          toggleActions: "play none none none"
        }
      }
    );
  });

  mm.add("(max-width: 980px)", () => {
    gsap.fromTo(".trial",
      { opacity: 0, rotationX: -35, z: -100, y: 50, transformPerspective: 800 },
      {
        opacity: 1,
        rotationX: 0,
        z: 0,
        y: 0,
        duration: 0.9,
        ease: "back.out(1.2)",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".trial-grid",
          start: "top 83%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // G. 地図カードの3Dフェードイン
  gsap.fromTo(".map-card",
    { opacity: 0, scale: 0.92, rotationX: -15, z: -100, transformPerspective: 1000 },
    {
      opacity: 1,
      scale: 1,
      rotationX: 0,
      z: 0,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".story",
        start: "top 78%",
        toggleActions: "play none none none"
      }
    }
  );

  // H. 極秘ミッションスタンプ（封筒から指令書を引き抜き、ハンコを打刻する一連のストーリータイムライン）
  const classifiedSection = document.getElementById("mission");
  const envelopeContainer = document.getElementById("envelopeContainer");
  const missionLetter = document.getElementById("missionLetter");
  const stampWrapper = document.getElementById("stampWrapper");
  
  if (classifiedSection && envelopeContainer && missionLetter && stampWrapper) {
    const shakeScreen = () => {
      const main = document.querySelector("main");
      const header = document.querySelector(".site-header");
      const compass = document.getElementById("compassWidget");
      const shakeElements = [main, header, compass];

      const shakeTl = gsap.timeline();
      
      // 高周波の減衰3D揺れ（衝撃をリアルに画面全体へ伝える）
      for (let i = 0; i < 7; i++) {
        const factor = (7 - i) * 2.2;
        const rx = (Math.random() - 0.5) * factor * 0.9;
        const ry = (Math.random() - 0.5) * factor * 0.9;
        const tx = (Math.random() - 0.5) * factor * 2.8;
        const ty = (Math.random() - 0.5) * factor * 2.8;

        shakeTl.to(shakeElements, {
          x: tx,
          y: ty,
          rotationX: rx,
          rotationY: ry,
          duration: 0.035,
          ease: "none"
        });
      }
      
      // 定位置に戻す
      shakeTl.to(shakeElements, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    // 朱肉インクスプラッシュ ＆ 衝撃波リングを生成するエフェクト
    const triggerStampEffects = () => {
      // 1. 衝撃波リングの生成
      const ripple = document.createElement("div");
      ripple.classList.add("stamp-ripple");
      ripple.style.left = "80%";
      ripple.style.top = "80%";
      missionLetter.appendChild(ripple);
      
      gsap.fromTo(ripple,
        { scale: 0.1, opacity: 1, borderWidth: "5px" },
        { 
          scale: 3.2, 
          opacity: 0, 
          borderWidth: "0.2px", 
          duration: 0.8, 
          ease: "power2.out",
          onComplete: () => ripple.remove()
        }
      );
      
      // 2. 朱肉インクスプラッシュ（パーティクル）の生成
      const colors = ["#c83c28", "#e15b47", "#a62d1c", "#f27968"];
      
      for (let i = 0; i < 18; i++) {
        const p = document.createElement("div");
        p.classList.add("cb-particle");
        
        const size = Math.random() * 5 + 3;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.borderRadius = "50%";
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.position = "absolute";
        p.style.left = "80%";
        p.style.top = "80%";
        p.style.zIndex = "10";
        missionLetter.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 90 + 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        gsap.to(p, {
          x: tx,
          y: ty,
          scale: 0.1,
          opacity: 0,
          duration: Math.random() * 0.75 + 0.4,
          ease: "power3.out",
          onComplete: () => p.remove()
        });
      }
    };

    const missionTl = gsap.timeline({
      scrollTrigger: {
        trigger: classifiedSection,
        start: "top 52%", // 画面の中央付近にセクションが来たタイミングで開始し、確実に見せる
        toggleActions: "play none none none" // 一度表示したらそのまま状態を維持する
      }
    });

    // 1. 封筒全体が画面奥(3D空間)からダイナミックに回転フリップしながら飛び込んでくる
    missionTl.fromTo(envelopeContainer,
      { 
        opacity: 0, 
        y: 80, 
        scale: 0.4, 
        rotateX: 160, 
        rotateY: -90, 
        rotateZ: 45, 
        z: -600,
        transformPerspective: 1200 
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        rotateX: 0, 
        rotateY: 0, 
        rotateZ: 0, 
        z: 0,
        duration: 1.15, 
        ease: "back.out(1.2)" 
      }
    );

    // 2. 封筒のフラップ（蓋）が3Dでパカッと上に開く
    missionTl.to(".envelope-back::before", 
      { 
        rotateX: 0, 
        duration: 0.45, 
        ease: "back.out(1.5)" 
      },
      "-=0.35"
    );

    // 3. 指令書が封筒の奥から3Dスパイラル回転しながら完全に引き抜かれる（y: -310まで引き抜いて封筒から完全に脱出）
    missionTl.fromTo(missionLetter,
      { 
        y: 60, 
        scale: 0.88, 
        opacity: 0, 
        z: -20, 
        rotationY: 0,
        zIndex: 2 // 引き抜いている間は封筒の前後の中間
      },
      { 
        y: -310, 
        scale: 1.05, 
        opacity: 1, 
        z: 120, 
        rotationY: -360, // 3Dスパイラル回転
        rotation: -8, 
        duration: 1.1, 
        ease: "power2.out"
      },
      "-=0.1"
    );

    // 3.5. 完全に引き抜かれた後、封筒の手前（zIndex: 4）に重ねる
    missionTl.to(missionLetter, {
      zIndex: 4, // 封筒の前面（z-index: 3）より手前に重ねる
      y: -75,    // 封筒の上に重ねて置く
      z: 140,    // 手前に浮かせる
      rotation: -3,
      duration: 0.65,
      ease: "back.out(1.2)"
    });

    // 4. 封筒の上に置かれた指令書へ、ハンコが超巨大（手前）＆ぼかしの状態から急降下して叩きつけられる
    missionTl.fromTo(stampWrapper,
      { 
        opacity: 0, 
        scale: 4.2, 
        rotation: -45, 
        filter: "blur(12px)" 
      },
      { 
        opacity: 1, 
        scale: 1, 
        rotation: -18, 
        filter: "blur(0px)", 
        duration: 0.35, 
        ease: "power3.in", // 叩きつけの加速
        onComplete: () => {
          // 打刻衝撃のスクリーンシェイクを実行
          shakeScreen();
          // 朱肉スプラッシュ ＆ 衝撃波リングを発動
          triggerStampEffects();
        }
      },
      "+=0.1" // 封筒の上に置かれた後に少し間を置いて打刻
    );

    // 5. ハンコが押し付けられて離れた反動のバウンド（2D軽量変形）
    missionTl.fromTo(stampWrapper,
      { scale: 0.88 },
      { scale: 1, duration: 0.22, ease: "elastic.out(1.25, 0.45)" }
    );
  }

  // ==========================================
  // 8. 持ち物チェックリスト機能の永続化 ＆ 紙吹雪バースト
  // ==========================================
  const checkboxes = document.querySelectorAll(".belonging-checkbox");
  const STORAGE_KEY = "camp_belongings_state";

  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load belongings state:", e);
      return {};
    }
  };

  const saveState = (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save belongings state:", e);
    }
  };

  const state = loadState();

  // チェック時に周囲に弾け飛ぶ紙吹雪（バースト）
  const createCheckboxBurst = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const colors = ["#10b981", "#d97706", "#f43f5e", "#0ea5e9", "#fff"];

    for (let i = 0; i < 12; i++) {
      const p = document.createElement("div");
      p.classList.add("cb-particle");
      
      const size = Math.random() * 8 + 4;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.opacity = "1";
      
      document.body.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 40;
      const tx = Math.cos(angle) * speed;
      const ty = Math.sin(angle) * speed;

      gsap.to(p, {
        x: tx,
        y: ty,
        scale: 0.1,
        opacity: 0,
        duration: Math.random() * 0.5 + 0.4,
        ease: "power3.out",
        onComplete: () => p.remove()
      });
    }
  };

  checkboxes.forEach((cb) => {
    if (state[cb.id] !== undefined) {
      cb.checked = state[cb.id];
    }

    cb.addEventListener("change", (e) => {
      const currentState = loadState();
      currentState[e.target.id] = e.target.checked;
      saveState(currentState);

      if (e.target.checked) {
        createCheckboxBurst(e);
      }
    });
  });

  // ==========================================
  // 9. 主要セクション境界でのコンパスバースト演出
  // ==========================================
  const triggerCompassBurst = () => {
    // 針をぐるっと急回転
    gsap.to(".compass-needle", {
      rotation: "+=360",
      duration: 0.75,
      ease: "back.out(1.6)",
      transformOrigin: "50% 50%",
      overwrite: "auto"
    });
    
    const compassWidget = document.getElementById("compassWidget");
    if (compassWidget && compassWidget.classList.contains("is-active")) {
      const rect = compassWidget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      const colors = ["#10b981", "#d97706", "#f43f5e", "#fff"];
      for (let i = 0; i < 12; i++) {
        const p = document.createElement("div");
        p.classList.add("cb-particle");
        p.style.width = `${Math.random() * 5 + 3}px`;
        p.style.height = `${Math.random() * 5 + 3}px`;
        p.style.borderRadius = "50%";
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.position = "fixed";
        p.style.left = `${cx}px`;
        p.style.top = `${cy}px`;
        p.style.zIndex = "99999";
        document.body.appendChild(p);
        
        const angle = (i / 12) * Math.PI * 2 + (Math.random() * 0.3 - 0.15);
        const distance = Math.random() * 40 + 25;
        gsap.to(p, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          scale: 0.1,
          opacity: 0,
          duration: Math.random() * 0.6 + 0.35,
          ease: "power2.out",
          onComplete: () => p.remove()
        });
      }
    }
  };

  const sectionsToWatch = ["#story", "#trials", "#mission", "#info", "#entry"];
  sectionsToWatch.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 40%",
        onEnter: () => triggerCompassBurst(),
        onEnterBack: () => triggerCompassBurst()
      });
    }
  });

  // ==========================================
  // 10. マウス連動3Dティルト ＆ 反射光グラデーション位置制御
  // ==========================================
  const tiltTargets = document.querySelectorAll(".forest-scene, .map-card, .trial, .mission-envelope-container");
  
  tiltTargets.forEach(target => {
    // 3Dティルト用の光沢オーバーレイを動的に追加
    if (!target.querySelector(".shine-overlay")) {
      const shine = document.createElement("div");
      shine.classList.add("shine-overlay");
      target.appendChild(shine);
    }

    target.addEventListener("mousemove", (e) => {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const percentX = x / rect.width;
      const percentY = y / rect.height;
      
      // 傾き角度の計算（最大12度程度に調整）
      const tiltX = (percentY - 0.5) * -12; 
      const tiltY = (percentX - 0.5) * 12;  
      
      // GSAPで滑らかに傾きを適用
      gsap.to(target, {
        rotateX: tiltX,
        rotateY: tiltY,
        z: 18,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto"
      });
      
      // 光沢の位置をCSSカスタムプロパティで更新
      target.style.setProperty("--shine-x", `${percentX * 100}%`);
      target.style.setProperty("--shine-y", `${percentY * 100}%`);
    });
    
    target.addEventListener("mouseleave", () => {
      // 緩やかに元に戻す
      gsap.to(target, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  });
});
