// ================================
// form-core.js — 리코 랜딩 전용 폼 모듈 (Vanilla JS)
// - data-form / data-field 기반
// - Google Forms entry.* name 매핑 (HTML 수정 없이 JS에서 처리)
// - 실시간 폼 검증 + 버튼 활성/비활성 + 버튼 색상 제어
// - 구글폼 "제출 완료" 화면 안 보이게 하고 바로 땡큐페이지로 이동
// ================================
(function () {
  // ─────────────────────────────
  // 1. 기본 설정 (Google Form / Thank-you URL)
  // ─────────────────────────────
  var GOOGLE_FORM_ACTION =
    'https://docs.google.com/forms/u/0/d/e/1FAIpQLSfYx_yfBolWOxvX90JyjRZov7PLPlaDMB2Q8tpYkJnLva7C8g/formResponse?pli=1';

  var THANKYOU_URL = 'http://signalstudio-event.shop/result';

// 버튼 컬러(활성/비활성)
  var BTN_ACTIVE_BG   = '';
  var BTN_ACTIVE_TEXT = '';
  var BTN_DISABLED_BG = '';
  var BTN_DISABLED_TX = '';

  // ─────────────────────────────
  // 2. DOM 로드 후 초기화
  // ─────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    // (1) 폼과 버튼 찾기
    var form = document.querySelector('[data-form]');
    if (!form) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    // 버튼 기본 문구 (초기 텍스트를 그대로 가져옴)
    var CTA_DEFAULT_TEXT = submitBtn.textContent || '1:1 무료상담 신청하기';

    // 사용자가 한 번이라도 입력/선택을 했는지 여부
    var hasInteracted = false;

    // ─────────────────────────────
    // brand.css 토큰에서 버튼 색상 읽기
    // 패턴/primary 변경 시 자동 반영됨
    // ─────────────────────────────
    function getCssVar(name) {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    }

    // 활성 버튼 (브랜드 기반)
    BTN_ACTIVE_BG   = getCssVar('--color-cta-main') 
                    || getCssVar('--primary') 
                    || '#1f5fae';

    BTN_ACTIVE_TEXT = getCssVar('--color-cta-main-text') 
                    || '#ffffff';

    // 비활성 버튼 (무채색 토큰 기반)
    BTN_DISABLED_BG = getCssVar('--neutral-600') 
                    || '#7b8a97';

    BTN_DISABLED_TX = getCssVar('--neutral-50') 
                    || '#ffffff';


    // (2) 필드 설정
    // 광고주/폼 항목이 바뀌면 "여기 FIELD_CONFIG만" 수정하면 됨
    var FIELD_CONFIG = [
      // 
      {
        key: 'name',
        selector: '[data-field="name"]',
        entryName: 'entry.1655319127',       // Google Form entry
        type: 'text',                        // text / phone / textarea / select / checkbox
        minLength: 2,
        message: '이름을 입력해주세요.'
      },
      {
        key: 'phone',
        selector: '[data-field="phone"]',
        entryName: 'entry.553056041',
        type: 'phone',
        message: '핸드폰 번호를 입력해주세요.'
      },
      {
        key: 'parents age',
        selector: '[data-field="parents age"]',
        entryName: 'entry.1402237268',
        type: 'select',
        message: '부모님의 연령을 선택해주세요.'
      },
      {
        key: 'Reason',
        selector: '[data-field="Reason"]',
        entryName: 'entry.682389931',
        type: 'text',
        minLength: 2,
        message: '신청사유를 입력해주세요.'
      },
      {
        key: 'notice',
        selector: '[data-field="notice"]',
        entryName: 'entry.605380627',
        type: 'textarea',
        minLength: 2,
        message: '확인사항을 읽고 답변해주세요.'
      },
      {
        key: 'agree_privacy',
        selector: '[data-field="agree_privacy"]',
        type: 'checkbox',
        message: '개인정보 수집 및 이용에 동의해주세요.'
      },
      {
        key: 'source',
        selector: '[data-field="source"]',  //  유입매체&타겟정보
        entryName: 'entry.1223015096',  // ← 구글 폼에서 실제 매체 필드 entry.* 값으로 맞춰줘야 함
        type: 'hidden',
        message: '유입 경로 정보가 없습니다.'
      }
    ];

    // (3) DOM 요소 캐시 + Google entry 매핑
    var fieldElements = {};

    FIELD_CONFIG.forEach(function (cfg) {
      var el = form.querySelector(cfg.selector);
      fieldElements[cfg.key] = el || null;

      // Google Forms entry.* 값으로 name 치환 (HTML은 건드리지 않음)
      if (el && cfg.entryName) {
        el.setAttribute('name', cfg.entryName);
      }
    });

    // ─────────────────────────────
    // 3-1. 유입매체/타겟 hidden 필드 자동 세팅
    //      우선순위:
    //      1) window.LANDING_SOURCE
    //      2) <body data-source="...">
    //      3) URL ?src= 또는 ?ch=
    //      4) 기본값: '인덱스'
    // ─────────────────────────────
    var sourceEl = fieldElements['source'];
    if (sourceEl) {
      var srcLabel = (function () {
        // 1) 전역 변수 (가장 우선)
        if (typeof window.LANDING_SOURCE === 'string' && window.LANDING_SOURCE.trim()) {
          return window.LANDING_SOURCE.trim();
        }

        // 2) body data-source
        var bodySource = document.body.getAttribute('data-source');
        if (bodySource && bodySource.trim()) {
          return bodySource.trim();
        }

        // 3) URL 파라미터 (?src= / ?ch=)
        var params = new URLSearchParams(window.location.search);
        if (params.get('src')) return params.get('src');
        if (params.get('ch')) return params.get('ch');

        // 4) 기본값
        return '인덱스';
      })();

      // 실제 hidden input 값에 저장
      sourceEl.value = srcLabel;
    }

    // ─────────────────────────────
    // 3-A. 전화번호 입력 마스킹 (숫자만 + 최대 11자리)
    //      - HTML에 maxlength 없어도 JS에서 강제 제한
    // ─────────────────────────────
    var phoneEl = fieldElements['phone'];
    if (phoneEl) {
      phoneEl.addEventListener('input', function () {
        var digits = phoneEl.value.replace(/\D/g, ''); // 숫자만 남기기
        if (digits.length > 11) {
          digits = digits.slice(0, 11);               // 최대 11자리로 잘라냄
        }
        phoneEl.value = digits;
      });
    }

    // ─────────────────────────────
    // 3-B. 에러 스타일 초기화
    // ─────────────────────────────
    function clearErrors() {
      FIELD_CONFIG.forEach(function (cfg) {
        var el = fieldElements[cfg.key];
        if (el) el.classList.remove('is-error');
      });
    }

    // ─────────────────────────────
    // 4. 단일 필드 검증
    //    - 모든 필드는 "입력 필수"
    //    - 타입별 추가 검증(phone, select, checkbox 등)
    // ─────────────────────────────
    function validateField(cfg) {
      var el = fieldElements[cfg.key];
      if (!el) {
        return { ok: false, message: '필드 설정 오류입니다.' };
      }

      // 체크박스
      if (cfg.type === 'checkbox') {
        if (!el.checked) {
          el.classList.add('is-error');
          return { ok: false, message: cfg.message };
        }
        return { ok: true };
      }

      var value = (el.value || '').trim();

      // 공백이나 미입력 → 무조건 실패
      if (!value) {
        el.classList.add('is-error');
        return { ok: false, message: cfg.message };
      }

      // ----------------------------------------
      // 🔥 1) "이름" 강화 검증
      // ----------------------------------------
      if (cfg.key === 'name') {
        var nameRegex = /^[가-힣]+$/;       // 한글만 허용
        if (!nameRegex.test(value) || value.length < 2) {
          el.classList.add('is-error');
          return { ok: false, message: '이름을 정확히 확인해주세요.' };
        }
      }

      // ----------------------------------------
      // 🔥 2) "핸드폰" 강화 검증
      // ----------------------------------------
      if (cfg.key === 'phone') {
        // 숫자만 추출
        var digits = value.replace(/\D/g, '');
        var phoneRegex = /^[0-9]+$/;

        // 010으로 시작 + 11자리 + 숫자만
        if (!(digits.startsWith('010') && digits.length === 11 && phoneRegex.test(digits))) {
          el.classList.add('is-error');
          return { ok: false, message: '핸드폰 번호를 정확히 입력해주세요.' };
        }

        // 실제 제출 값은 숫자만 저장
        el.value = digits;
      }

    // ----------------------------------------
    // 🔥 3) "이메일" 필수 + 형식 강화 검증
    // ----------------------------------------
    if (cfg.key === 'email') {

      // [1] 입력값에서 공백 제거
      // 예: " test @naver.com " → "test@naver.com"
      var email = value.replace(/\s+/g, '');

      // [2] 기본 이메일 형식 정규식
      // - 공백이 없어야 함
      // - @ 앞에 최소 1글자 존재
      // - @ 뒤에 최소 1글자 존재
      // - 도메인에 점(.)이 반드시 포함
      // - 최상위 도메인은 최소 2글자 (com, kr, net 등)
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      // [3] 실패 조건들 (가독성을 위해 개별 변수로 분리)

      // 3-1. 연속된 점(..) 사용 금지
      // 예: test..name@naver.com
      var hasDoubleDot = email.indexOf('..') !== -1;

      // 3-2. 이메일이 점(.)으로 끝나는 경우 금지
      // 예: test@naver.
      var endsWithDot = email.endsWith('.');

      // [4] 위 조건 중 하나라도 걸리면 실패
      if (
        !emailRegex.test(email) || // 기본 이메일 형식 불일치
        hasDoubleDot ||             // 연속 점 존재
        endsWithDot                // 끝이 점(.)으로 끝남
      ) {
        el.classList.add('is-error');
        return {
          ok: false,
          message: '이메일을 정확히 입력해주세요.'
        };
      }

      // [5] 최종 통과 시
      // - 공백 제거된 이메일 값으로 실제 제출 값을 덮어씀
      el.value = email;
    }

      // ----------------------------------------
      // 기존 기본 검증(텍스트 / 텍스트에어리어 minLength)
      // ----------------------------------------
      if ((cfg.type === 'text' || cfg.type === 'textarea') && cfg.minLength) {
        if (value.length < cfg.minLength) {
          el.classList.add('is-error');
          return { ok: false, message: cfg.message };
        }
      }

      // select 검증
      if (cfg.type === 'select') {
        if (!value) {
          el.classList.add('is-error');
          return { ok: false, message: cfg.message };
        }
      }

      return { ok: true };
    }

    // ─────────────────────────────
    // 5. 전체 폼 검증
    //    - FIELD_CONFIG에 등록된 항목 전부 검증
    //    - 하나라도 실패하면 그 메시지를 그대로 반환
    // ─────────────────────────────
    function validateForm() {
      clearErrors();

      for (var i = 0; i < FIELD_CONFIG.length; i++) {
        var cfg = FIELD_CONFIG[i];
        var result = validateField(cfg);

        if (!result.ok) {
          return result; // 첫 번째 에러를 그대로 사용
        }
      }

      return { ok: true, message: '' };
    }

    // ─────────────────────────────
    // 6. 버튼 활성/비활성 상태 + 색상 업데이트
    // ─────────────────────────────
    function updateSubmitButtonState() {
      // 아직 사용자가 아무 입력도 안 했으면 버튼 상태를 건드리지 않음
      if (!hasInteracted) return;

      var result = validateForm();

      if (result.ok) {
        submitBtn.disabled = false;
        submitBtn.textContent = CTA_DEFAULT_TEXT;
        submitBtn.style.backgroundColor = BTN_ACTIVE_BG;
        submitBtn.style.color = BTN_ACTIVE_TEXT;
      } else {
        submitBtn.disabled = true;
        submitBtn.textContent = result.message;
        submitBtn.style.backgroundColor = BTN_DISABLED_BG;
        submitBtn.style.color = BTN_DISABLED_TX;
      }
    }

    // ─────────────────────────────
    // 7. 필드 변화 감지 → 버튼 상태 실시간 업데이트
    // ─────────────────────────────
    FIELD_CONFIG.forEach(function (cfg) {
      var el = fieldElements[cfg.key];
      if (!el) return;

      // 입력 중이면 input, 선택/체크이면 change로 감시
      var mainEvent = (cfg.type === 'checkbox' || cfg.type === 'select') ? 'change' : 'input';

      var handler = function () {
        if (!hasInteracted) hasInteracted = true;
        updateSubmitButtonState();
      };

      el.addEventListener(mainEvent, handler);

      // select/checkbox도 input 이벤트에서 예외가 있을 수 있으니 change를 한 번 더 걸어둠
      if (mainEvent !== 'change') {
        el.addEventListener('change', handler);
      }
    });

    // ─────────────────────────────
    // 8. 초기 상태 설정
    //    - 아직 입력 전: 기본 CTA + 버튼 브랜드색 + 활성화
    //    - hasInteracted=false 이므로 updateSubmitButtonState는 버튼을 건드리지 않음
    // ─────────────────────────────
    submitBtn.disabled = false;
    submitBtn.textContent = CTA_DEFAULT_TEXT;
    submitBtn.style.backgroundColor = BTN_ACTIVE_BG;
    submitBtn.style.color = BTN_ACTIVE_TEXT;

    // ─────────────────────────────
    // 9. 최종 submit 처리 (AJAX 방식)
    //    - Google Form에 백그라운드로 전송
    //    - 화면 전환은 JS로 통제 → Google 화면 절대 안 보임
    // ─────────────────────────────
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var result = validateForm();
      if (!result.ok) {
        alert(result.message);
        return;
      }

      // 버튼 상태 → 비활성 + 메시지 변경
      submitBtn.disabled = true;
      submitBtn.textContent = '전송 중입니다';
      submitBtn.setAttribute('data-state', 'submitting');
      submitBtn.style.backgroundColor = BTN_DISABLED_BG;
      submitBtn.style.color = BTN_DISABLED_TX;

      // 폼 데이터를 FormData 형태로 수집
      var formData = new FormData(form);

      // AJAX 방식으로 Google Form에 전송
      fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      })
        .then(function () {
          // 실제 Google 응답은 확인할 수 없으므로 바로 땡큐페이지 이동 처리
          hoa();
        })
        .catch(function () {
          // 혹시 실패해도 사용자 경험은 동일하게 유지
          hoa();
        });
    });

    // ─────────────────────────────
    // 10. 전송 후 후처리 함수 (hoa)
    //     - 알림 → 상단 스크롤 → 땡큐페이지 이동
    // ─────────────────────────────
    function hoa() {
      alert('신청이 완료되었습니다.');

      // 상단으로 부드럽게 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 랜덤 토큰 생성 (단순 추적용)
      var tx = Math.random().toString(36).substr(2) + Date.now().toString(36);

      // 땡큐페이지로 이동
      window.location.href = THANKYOU_URL + '?tx=' + tx;
    }
  });
})();

// ====================================================
// 개인정보 처리방침 모달 제어 (data-* 기반)
// ====================================================
(function () {
  // 모달 엘리먼트 찾기
  var modal = document.querySelector('[data-modal="privacy"]');
  if (!modal) return; // 이 페이지에 모달 없으면 바로 종료

  var openBtn  = document.querySelector('[data-evt="open_privacy"]');
  var closeEls = modal.querySelectorAll('[data-evt="close_privacy"]');

  // 바디 스크롤 잠그기/풀기
  function lockBodyScroll() {
    document.body.classList.add('is-modal-open');
  }
  function unlockBodyScroll() {
    document.body.classList.remove('is-modal-open');
  }

  // 모달 열기
function openModal() {
  modal.classList.add('is-open');      
  modal.setAttribute('aria-hidden', 'false');
  lockBodyScroll();
}

  // 모달 닫기
function closeModal() {
  modal.classList.remove('is-open');  
  modal.setAttribute('aria-hidden', 'true');
  unlockBodyScroll();
}

  // “보기” 버튼 클릭 → 열기
  if (openBtn) {
    openBtn.addEventListener('click', function () {
      openModal();
    });
  }

  // X 버튼 + 배경 클릭 → 닫기
  closeEls.forEach(function (el) {
    el.addEventListener('click', function () {
      closeModal();
    });
  });

  // ESC 키로 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
