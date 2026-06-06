// IntersectionObserver と パララックス & ゴテゴテスクロールアニメーションの制御
document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. スクロール時の時間差フェードイン（Staggered Reveal）
  // ==========================================
  const revealSections = document.querySelectorAll(".reveal");

  revealSections.forEach((section) => {
    // セクション内のアニメーションさせたい主要子要素を抽出
    const targets = section.querySelectorAll("h2, p, .subtitle, .event-strip, .hero-actions, .button, .map-card, .trial, .info-table > div, ul.tools li, .belongings li, .stamp");
    
    targets.forEach((target, index) => {
      // 特殊な動きをするスタンプや地図カード、試練カード以外に、共通 of .reveal-item を適用
      if (!target.classList.contains("stamp") && !target.classList.contains("map-card") && !target.classList.contains("trial")) {
        target.classList.add("reveal-item");
      }
      
      // スタッガード（時間差）ディレイをミリ秒単位で動的設定
      target.style.transitionDelay = `${index * 80}ms`;
    });
  });

  // IntersectionObserver による表示タイミング制御
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            
            // セクション内の全アイテムをアクティブにする
            const items = entry.target.querySelectorAll(".reveal-item, .stamp, .map-card, .trial");
            items.forEach((item) => item.classList.add("is-visible"));

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealSections.forEach((section) => observer.observe(section));
  } else {
    // フォールバック
    revealSections.forEach((section) => {
      section.classList.add("is-visible");
      section.querySelectorAll(".reveal-item, .stamp, .map-card, .trial").forEach((item) => {
        item.classList.add("is-visible");
      });
    });
  }

  // ==========================================
  // 2. 木の葉パーティクルの動的生成
  // ==========================================
  const leavesContainer = document.getElementById("leavesContainer");
  if (leavesContainer) {
    const createLeaf = () => {
      const leaf = document.createElement("div");
      leaf.classList.add("leaf-particle");
      leaf.style.left = `${Math.random() * 100}vw`;
      
      // 降下時間とディレイをランダム化
      const duration = Math.random() * 5 + 6; // 6秒〜11秒
      leaf.style.animationDuration = `${duration}s`;
      leaf.style.animationDelay = `${Math.random() * 4}s`;
      
      // サイズをランダム化
      const scale = Math.random() * 0.6 + 0.4; // 0.4 〜 1.0
      leaf.style.transform = `scale(${scale})`;
      
      // 葉の色をランダム化 (エメラルドとゴールドの比率)
      if (Math.random() > 0.65) {
        leaf.style.backgroundColor = "var(--yellow)";
      }
      
      leavesContainer.appendChild(leaf);
      
      // アニメーション終了後に削除して再生成
      setTimeout(() => {
        leaf.remove();
        createLeaf();
      }, (duration + 4) * 1000);
    };

    // 初期化時に15枚生成
    for (let i = 0; i < 15; i++) {
      createLeaf();
    }
  }

  // ==========================================
  // 3. スクロール連動：パララックス & 進捗バー & コンパス回転
  // ==========================================
  let ticked = false;
  const scrollProgress = document.getElementById("scrollProgress");
  const compassWidget = document.getElementById("compassWidget");
  const compassDial = compassWidget ? compassWidget.querySelector(".compass-dial") : null;
  const compassNeedle = compassWidget ? compassWidget.querySelector(".compass-needle") : null;

  const updateScrollAnimations = () => {
    const scrolled = window.pageYOffset;
    const viewHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    // スクロール比率の算出 (0 〜 1)
    const scrollPercent = scrolled / (docHeight - clientHeight);

    // A. スクロール進捗バーの更新
    if (scrollProgress) {
      scrollProgress.style.width = `${scrollPercent * 100}%`;
    }

    // B. コンパスウィジェットの出現および回転制御
    if (compassWidget) {
      if (scrolled > 50) {
        compassWidget.classList.add("is-active");
      } else {
        compassWidget.classList.remove("is-active");
      }
      
      // 文字盤と針の回転
      if (compassNeedle && compassDial) {
        const needleAngle = scrolled * 0.85; // スクロール量に比例
        const dialAngle = -scrolled * 0.15;
        compassNeedle.style.transform = `rotate(${needleAngle}deg)`;
        compassDial.style.transform = `rotate(${dialAngle}deg)`;
      }
    }

    // C. ヒーロー画像のパララックス (上に移動させて遅れを表現。隙間を防ぐために-12%移動)
    const heroImg = document.querySelector(".hero-image");
    if (heroImg && scrolled < viewHeight) {
      heroImg.style.transform = `translateY(${-scrolled * 0.12}px)`;
    }

    // D. 地図画像のパララックス (拡大＋スライド)
    const mapCard = document.querySelector(".map-card");
    if (mapCard) {
      const rect = mapCard.getBoundingClientRect();
      if (rect.top < viewHeight && rect.bottom > 0) {
        const relativeScroll = (rect.top - viewHeight) / (viewHeight + rect.height);
        const mapImg = mapCard.querySelector(".map-image");
        if (mapImg) {
          mapImg.style.transform = `scale(1.15) translateY(${relativeScroll * 28}px)`;
        }
      }
    }

    ticked = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticked) {
      window.requestAnimationFrame(updateScrollAnimations);
      ticked = true;
    }
  }, { passive: true });

  // ==========================================
  // 4. 持ち物チェックリスト機能の永続化
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

  checkboxes.forEach((cb) => {
    if (state[cb.id] !== undefined) {
      cb.checked = state[cb.id];
    }

    cb.addEventListener("change", (e) => {
      const currentState = loadState();
      currentState[e.target.id] = e.target.checked;
      saveState(currentState);
    });
  });
});
