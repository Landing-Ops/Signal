
/*===============================================================================================
Brand Palette + Semantic Token Auto Generator
사용법: node 이파일.js > brand.css
primaryHex 값만 바꾸면 전체 팔레트/의미토큰 자동 생성
===============================================================================================
(생성+검토방법)
0. 아래에서 표에서 Primary 색을 고른다. 
1. JS파일 맨하단 console.log(makePalette("★색상헥스값★"));에 선택한 색상값 넣기
2. VS CODE상다메뉴에서 "터미널->새터미널" 열기
3. 터미널 창에  [ node "brand-auto-palette tool.js" ] 괄호속 문장 그대로 복사붙여넣기
4. 터미널에 출력된 결과물 GPT에 복붙하고 + 아래 프롬프트 복붙

[프롬프트]
위 css들 HTML의 <head>에 부여해서 모두 구현된 예시를 보여줘 하나의 html코드로 코드펜에서 쉽게 구현할수 있게
=====================================================================================================
'브랜드 팔레트 자동 생성기' 역할

Primary 하나만 입력하면
→ 1. 브랜드 팔레트 전체(색 토큰)
→ 2. 의미 토큰 전체(UI 역할)
위 2가지를 자동으로 만들어주는 엔진이다
=====================================================================================================
🎨 Primary 마스터 팔레트 v3 — 계열별 14개 확장 (총 140개)
밝기55이하, 채도15~70사이 여러 색상군에서 primary 대표군 뽑음

1️⃣ Red 계열 (H=0)
1	hsl(0, 55%, 45%)	#b23434
2	hsl(0, 50%, 40%)	#993131
3	hsl(0, 65%, 50%)	#d63d3d
4	hsl(0, 45%, 35%)	#7f2c2c
5	hsl(0, 60%, 48%)	#c23a3a
6	hsl(0, 40%, 30%)	#662727
7	hsl(0, 70%, 52%)	#e64545
8	hsl(0, 35%, 38%)	#6b3333
9	hsl(0, 58%, 42%)	#a83a3a
10	hsl(0, 48%, 52%)	#bf4d4d

2️⃣ Orange 계열 (H=30)
1	hsl(30, 55%, 45%)	#b27334
2	hsl(30, 50%, 40%)	#996131
3	hsl(30, 60%, 50%)	#d68a3d
4	hsl(30, 45%, 35%)	#7f522c
5	hsl(30, 65%, 48%)	#c27d3a
6	hsl(30, 40%, 30%)	#664427
7	hsl(30, 70%, 52%)	#e69a45
8	hsl(30, 35%, 38%)	#6b4a33
9	hsl(30, 58%, 42%)	#a8743a
10	hsl(30, 48%, 52%)	#bf874d

11	hsl(30, 48%, 52%)	#ffbb00  임시

3️⃣ Yellow 계열 (H=60)
1	hsl(60, 55%, 45%)	#b2b234
2	hsl(60, 50%, 40%)	#999931
3	hsl(60, 60%, 50%)	#d6d63d
4	hsl(60, 45%, 35%)	#7f7f2c
5	hsl(60, 65%, 48%)	#c2c23a
6	hsl(60, 40%, 30%)	#666627
7	hsl(60, 70%, 52%)	#e6e645
8	hsl(60, 35%, 38%)	#6b6b33
9	hsl(60, 58%, 42%)	#a8a83a
10	hsl(60, 48%, 52%)	#bfbf4d

4️⃣ Green 계열 (H=120)

1	hsl(120, 55%, 45%)	#34b234
2	hsl(120, 50%, 40%)	#319931
3	hsl(120, 60%, 50%)	#3dd63d
4	hsl(120, 45%, 35%)	#2c7f2c
5	hsl(120, 65%, 48%)	#3ac23a
6	hsl(120, 40%, 30%)	#276627
7	hsl(120, 70%, 52%)	#45e645
8	hsl(120, 35%, 38%)	#336b33
9	hsl(120, 58%, 42%)	#3aa83a
10 hsl(120, 48%, 52%)	#4dbf4d

5️⃣ 청색 계열 (H=150)
1	hsl(150, 55%, 45%)	#34b273
2	hsl(150, 50%, 40%)	#319964
3	hsl(150, 60%, 50%)	#3dd697
4	hsl(150, 45%, 35%)	#2c7f5a
5	hsl(150, 65%, 48%)	#3ac28b
6	hsl(150, 40%, 30%)	#27664d
7	hsl(150, 70%, 52%)	#45e6ad
8	hsl(150, 35%, 38%)	#336b5c
9	hsl(150, 58%, 42%)	#3aa87e
10hsl(150, 48%, 52%)	#4dbf94

6️⃣ Mint / Teal / Cyan 계열 (H=180)
1	hsl(180, 55%, 45%)	#34b2b2
2	hsl(180, 50%, 40%)	#319999
3	hsl(180, 60%, 50%)	#3dd6d6
4	hsl(180, 45%, 35%)	#2c7f7f
5	hsl(180, 65%, 48%)	#3ac2c2
6	hsl(180, 40%, 30%)	#276666
7	hsl(180, 70%, 52%)	#45e6e6
8	hsl(180, 35%, 38%)	#336b6b
9	hsl(180, 58%, 42%)	#3aa8a8
10hsl(180, 48%, 52%)	#4dbfbf

7️⃣ Blue 계열 (H=210)
1	hsl(210, 55%, 45%)	#3473b2
2	hsl(210, 50%, 40%)	#316199
3	hsl(210, 60%, 50%)	#3d8bd6
4	hsl(210, 45%, 35%)	#2c527f
5	hsl(210, 65%, 48%)	#3a7cc2
6	hsl(210, 40%, 30%)	#274466
7	hsl(210, 70%, 52%)	#4594e6
8	hsl(210, 35%, 38%)	#33506b
9	hsl(210, 58%, 42%)	#3a6fa8
10hsl(210, 48%, 52%)	#4d7fbf

8️⃣ Indigo / Navy 계열 (H=240)
1	hsl(240, 55%, 45%)	#3434b2
2	hsl(240, 50%, 40%)	#313199
3	hsl(240, 60%, 50%)	#3d3dd6
4	hsl(240, 45%, 35%)	#2c2c7f
5	hsl(240, 65%, 48%)	#3a3ac2
6	hsl(240, 40%, 30%)	#272766
7	hsl(240, 70%, 52%)	#4545e6
8	hsl(240, 35%, 38%)	#33336b
9	hsl(240, 58%, 42%)	#3a3aa8
10	hsl(240, 48%, 52%)	#4d4dbf

9️⃣ Purple 계열 (H=280)
1	hsl(280, 55%, 45%)	#8834b2
2	hsl(280, 50%, 40%)	#773199
3	hsl(280, 60%, 50%)	#9c3dd6
4	hsl(280, 45%, 35%)	#6a2c7f
5	hsl(280, 65%, 48%)	#913ac2
6	hsl(280, 40%, 30%)	#592766
7	hsl(280, 70%, 52%)	#b145e6
8	hsl(280, 35%, 38%)	#6a336b
9	hsl(280, 58%, 42%)	#843aa8
10	hsl(280, 48%, 52%)	#9e4dbf

🔟 Magenta / Pink 계열 (H=320)
1	hsl(320, 55%, 45%)	#b23488
2	hsl(320, 50%, 40%)	#993176
3	hsl(320, 60%, 50%)	#d63da4
4	hsl(320, 45%, 35%)	#7f2c64
5	hsl(320, 65%, 48%)	#c23a93
6	hsl(320, 40%, 30%)	#66274d
7	hsl(320, 70%, 52%)	#e645b6
8	hsl(320, 35%, 38%)	#6b335c
9	hsl(320, 58%, 42%)	#a83a87
10	hsl(320, 48%, 52%)	#bf4d9e

🥇 골드 계열 
hsl(45, 60%, 42%) → #a18430
hsl(45, 65%, 46%) → #b39139
hsl(48, 60%, 44%) → #a98a32
hsl(50, 55%, 40%) → #978134
hsl(42, 55%, 38%) → #8c7631
hsl(50, 65%, 48%) → #b6973a
hsl(46, 50%, 50%) → #b89b3e
hsl(52, 60%, 45%) → #a58b35
hsl(44, 55%, 47%) → #a58a38
hsl(48, 65%, 52%) → #c0a341

🔵 파란색 계열 
hsl(210, 60%, 40%) → #275684
hsl(210, 65%, 45%) → #2d649a
hsl(212, 60%, 42%) → #295583
hsl(215, 55%, 38%) → #274a72
hsl(220, 60%, 44%) → #2c598a
hsl(205, 55%, 46%) → #3a6c94
hsl(215, 65%, 48%) → #306091
hsl(208, 60%, 50%) → #3572a5
hsl(218, 55%, 52%) → #3a74a6
hsl(210, 50%, 36%) → #234a70

🤎 갈색 계열 
hsl(25, 45%, 32%) → #60462c
hsl(25, 50%, 28%) → #543721
hsl(28, 45%, 35%) → #6a4b2b
hsl(30, 50%, 30%) → #5a3b1f
hsl(22, 40%, 26%) → #4a3520
hsl(30, 55%, 34%) → #684420
hsl(26, 50%, 36%) → #6a4a2a
hsl(32, 45%, 38%) → #6f4a24
hsl(28, 40%, 30%) → #533922
hsl(26, 45%, 28%) → #4e3520

⬛ 거의-블랙(딥 네이비/차콜) 
(실무에서 “블랙 느낌”으로 쓰기 좋은 애들)
hsl(210, 15%, 8%) → #111417
hsl(210, 12%, 10%) → #16191d
hsl(210, 10%, 12%) → #1c1f22
hsl(210, 15%, 14%) → #1e2429
hsl(210, 8%, 16%) → #26292c
hsl(210, 12%, 18%) → #282e33
hsl(210, 10%, 20%) → #2e3338
hsl(210, 7%, 22%) → #34383c
hsl(210, 6%, 24%) → #3a3d41
hsl(210, 5%, 26%) → #3f4246

========================================================================================================= */

/* ====================================================================
   BRAND COLOR PALETTE GENERATOR (Refactored)
   - Input: Primary HEX (e.g. "#1f5fae")
   - Output: CSS string for brand.css
   - 구조:
     1) PRIMARY / SECONDARY / ACCENT 3색 * 5토큰
     2) NEUTRAL SCALE
     3) SURFACE / OVERLAY
     4) GRADIENT
     5) SEMANTIC SURFACES / BORDERS
   ==================================================================== */

/* HEX → HSL 변환 */
function hexToHSL(hex) {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h, s, l;
  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = h * 60;
  }

  return {
    h,
    s: s * 100,
    l: l * 100,
  };
}

/* 값 범위 고정 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/* HSL 객체 → CSS용 hsl() 문자열 */
function hslToCSS(h, s, l) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

/* HSL 객체 → CSS용 hsla() 문자열 (opacity 포함) */
function hslaToCSS(h, s, l, a) {
  return `hsla(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}% / ${a})`;
}

/* =====================================================================
   SECONDARY 색 생성 규칙
   - Primary와 친한 형제색 (인접색조)
   - 구조/리듬/서브 CTA에 어울리는 안정적인 색
   ===================================================================== */
function makeSecondary(base) {
  const isWarm = base.h < 60 || base.h > 200;

  let hueShift = isWarm ? 18 : 24;
  let h = (base.h + hueShift + 360) % 360;
  let s = clamp(base.s - 5, 25, 85);
  let l = clamp(base.l + 6, 25, 78);

  return { h, s, l };
}

/* =====================================================================
   ACCENT 색 생성 규칙
   - Primary와 충분히 다른 대비 (보색에 가까운 쪽)
   - CTA / 혜택 / 하이라이트에서 확실히 튀도록
   ===================================================================== */
function makeAccent(base) {
  let h = (base.h + 190) % 360; // 보색보다 약간 더 이동해서 과한 충돌 방지
  let s = clamp(base.s + 12, 30, 95);
  let l;

  if (base.l >= 50) {
    // Primary가 밝으면 Accent는 살짝 어둡게
    l = clamp(base.l - 8, 30, 65);
  } else {
    // Primary가 어두우면 Accent는 살짝 밝게
    l = clamp(base.l + 10, 35, 70);
  }

  return { h, s, l };
}

/* =====================================================================
   Neutral / Gray Scale 생성기
   → 항상 cool gray 고정 (브랜드색과 독립)
   ===================================================================== */
function makeNeutralSet() {
  const h = 220;

  return {
    900: hslToCSS(h, 13, 12),
    800: hslToCSS(h, 13, 18),
    700: hslToCSS(h, 11, 30),
    600: hslToCSS(h, 10, 40),
    400: hslToCSS(h, 9, 55),
    300: hslToCSS(h, 9, 70),
    200: hslToCSS(h, 10, 82),
    100: hslToCSS(h, 13, 92),
    50:  hslToCSS(h, 14, 97),
  };
}

/* =====================================================================
   3색 각각을 5개의 토큰 세트로 확장
   - main: 본체 컬러
   - soft: same HSL + opacity 0.12 (overlay / highlight)
   - bg: 카드/섹션 배경용 밝은 톤
   - border: 테두리/구분선용 중간 톤
   - text: 링크/강조 텍스트용 살짝 어두운 톤
   ===================================================================== */
function makeColorSystem(color) {
  const main = hslToCSS(color.h, color.s, color.l);
  const soft = hslaToCSS(color.h, color.s, color.l, 0.12);

  const bgL = clamp(color.l + 42, 88, 98);
  const bgS = clamp(color.s * 0.25, 10, 35);
  const bg = hslToCSS(color.h, bgS, bgL);

  const borderL = clamp(color.l + 18, 45, 82);
  const borderS = clamp(color.s * 0.5, 15, 55);
  const border = hslToCSS(color.h, borderS, borderL);

  const textL = clamp(color.l - 10, 28, 55);
  const textS = clamp(color.s * 0.9, 30, 90);
  const text = hslToCSS(color.h, textS, textL);

  return { main, soft, bg, border, text };
}

/* =====================================================================
   MAIN FUNCTION — Primary HEX 하나만 넣으면 전체 brand.css 텍스트 생성
   ===================================================================== */
function makePalette(primaryHex) {
  const baseRaw = hexToHSL(primaryHex);

  // 안전 범위 보정 (너무 채도 낮거나 / 너무 밝거나 한 색 방어)
  const base = {
    h: (baseRaw.h + 360) % 360,
    s: clamp(baseRaw.s, 20, 85),
    l: clamp(baseRaw.l, 22, 55),
  };

  const secondary = makeSecondary(base);
  const accent = makeAccent(base);

  const neutral = makeNeutralSet();

  // 3색 → 5토큰 세트로 확장
  const primarySet = makeColorSystem(base);
  const secondarySet = makeColorSystem(secondary);
  const accentSet = makeColorSystem(accent);

  // Gradient는 Primary ↔ Accent 기준
  const gradientPrimary = `linear-gradient(60deg, ${primarySet.main} 0%, ${accentSet.main} 100%)`;
  const gradientDiagonal = `linear-gradient(135deg, ${primarySet.main} 0%, ${accentSet.main} 100%)`;
  const gradientHorizontal = `linear-gradient(90deg, ${primarySet.main} 0%, ${accentSet.main} 100%)`;

  const surface = neutral[50];
  const surfaceAlt = neutral[100];
  const overlaySoft = `hsla(0 0% 0% / 0.03)`;
  const overlayMedium = `hsla(0 0% 0% / 0.06)`;
  const overlayStrong = `hsla(0 0% 0% / 0.12)`;

  /* ==========================================================
     최종 CSS 문자열
     1) :root → 팔레트 + 뉴트럴 + 서피스 + 그라디언트
     2) :root → 의미 토큰(Surfaces/Borders)
     ========================================================== */
  const css = `/* ====================================================================
   BRAND COLOR SYSTEM (auto-generated from ${primaryHex})
   ==================================================================== */

/* ------------------------------------------------
   [1] PALETTE — 브랜드 기본 색상 (원재료)
-------------------------------------------------*/
:root {

/* =========================================================================
   PRIMARY COLOR SYSTEM (5 tokens)
   =========================================================================*/
  --primary: ${primarySet.main};                /* 메인 포인트 컬러: 버튼 배경, 강한 아이콘, 핵심 강조 텍스트 */
  --primary-soft: ${primarySet.soft};           /* 하이라이트, 모달 오버레이, 얇은 강조줄(형광펜 느낌) */
  --primary-bg: ${primarySet.bg};               /* 카드/박스/섹션 라이트 배경용 */
  --primary-border: ${primarySet.border};       /* 테두리, 구분선(라인 전용 컬러) */
  --primary-text: ${primarySet.text};           /* 텍스트 전용 포인트 컬러: 링크, 상태 배지, 작은 강조 문장 */

/* =========================================================================
   SECONDARY COLOR SYSTEM (5 tokens)
   =========================================================================*/
  --secondary: ${secondarySet.main};              /* 메인 포인트 컬러: 버튼 배경, 강한 아이콘, 핵심 강조 텍스트 */
  --secondary-soft: ${secondarySet.soft};         /* 하이라이트, 모달 오버레이, 얇은 강조줄(형광펜 느낌) */
  --secondary-bg: ${secondarySet.bg};             /* 카드/박스/섹션 라이트 배경용 */
  --secondary-border: ${secondarySet.border};     /* 테두리, 구분선(라인 전용 컬러) */
  --secondary-text: ${secondarySet.text};         /* 텍스트 전용 포인트 컬러: 링크, 상태 배지, 작은 강조 문장 */

/* =========================================================================
   ACCENT COLOR SYSTEM (5 tokens)
   =========================================================================*/
  --accent: ${accentSet.main};                    /* 메인 포인트 컬러: 버튼 배경, 강한 아이콘, 핵심 강조 텍스트 */
  --accent-soft: ${accentSet.soft};               /* 하이라이트, 모달 오버레이, 얇은 강조줄(형광펜 느낌) */
  --accent-bg: ${accentSet.bg};                   /* 카드/박스/섹션 라이트 배경용 */
  --accent-border: ${accentSet.border};           /* 테두리, 구분선(라인 전용 컬러) */
  --accent-text: ${accentSet.text};               /* 텍스트 전용 포인트 컬러: 링크, 상태 배지, 작은 강조 문장 */


/* =========================================================================
   NEUTRAL SCALE (항상 cool gray) - 무채색 계열
   =========================================================================*/
  --neutral-900: ${neutral[900]};
  --neutral-800: ${neutral[800]};
  --neutral-700: ${neutral[700]};
  --neutral-600: ${neutral[600]};
  --neutral-400: ${neutral[400]};
  --neutral-300: ${neutral[300]};
  --neutral-200: ${neutral[200]};
  --neutral-100: ${neutral[100]};
  --neutral-50:  ${neutral[50]};

/* =========================================================================
   SURFACES / OVERLAYS - 무채색 계열
   =========================================================================*/
  --surface: ${surface};
  --surface-alt: ${surfaceAlt};
  --overlay-soft: ${overlaySoft};
  --overlay-medium: ${overlayMedium};
  --overlay-strong: ${overlayStrong};

/* =========================================================================
   GRADIENT 토큰 (3종)
   =========================================================================*/
  --gradient-primary: ${gradientPrimary};
  --gradient-primary-diagonal: ${gradientDiagonal};
  --gradient-primary-horizontal: ${gradientHorizontal};

}

/* ------------------------------------------------
  [2-1] SEMANTIC SURFACES — 의미토큰 (페이지/섹션/카드/모달) 
  → 무채색 계열, 브랜드 무관 기본 UI 구성요소.
-------------------------------------------------*/
:root {

  --page-bg: var(--neutral-50);          /* 전체 페이지 배경: 거의 흰색 */
  --section-bg: var(--neutral-50);       /* 기본 섹션 배경   */
  --section-alt-bg: var(--neutral-100);  /* 교대 섹션 배경   */

  --card-bg: var(--surface);             /* 기본 카드 배경   */
  --card-elevated-bg: var(--surface-alt);/* 떠 있는 카드     */
  --modal-bg: var(--surface-alt);        /* 모달/패널 배경   */

  /* ------------------------------------------------ 
  [2-2] SEMANTIC BORDERS — 보더 계층
  → 무채색 계열
  -------------------------------------------------*/

  --border-subtle: var(--neutral-100);  /* 아주 연한 보더 (그리드, 구분선) */
  --soft-border: var(--border-subtle);  /* 가장 부드러운 보더 의미 토큰 */
  --border-default: var(--neutral-200); /* 일반 보더 (폼, 카드)          */
  --border-strong: var(--neutral-300);  /* 강조 보더 (알림, 강조박스) */

}
`;

  return css;
}

/* ============================================================
   실제 실행부 — 여기 Primary HEX만 바꾸면 된다.
   예) "#1f5fae", "#0051ff", "#d11111" 등
============================================================ */

// 예시
console.log(makePalette("#924204"));
