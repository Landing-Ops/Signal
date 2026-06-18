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
    'https://docs.google.com/forms/u/0/d/e/1FAIpQLSfts65XB6bolNn_cvLVj2wLUOfGGLqipyyoZQCzeZHUeA5BWQ/formResponse';

  var THANKYOU_URL = 'https://landing-ops.github.io/Signal/result';

  // 휴대폰 인증 백엔드 (Apps Script 웹앱 /exec URL)
  var OTP_API_URL = 'https://script.google.com/macros/s/AKfycbxjLT9TmiNeZK1YUG7Otx071WRPRqu8Yx_D0If-oWvhI2DLS9zRXX76V8m5nHraJD3_/exec';

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
     // ★ 사용자가 휴대폰 인증 완료 여부
    var isPhoneVerified = false;


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
        entryName: 'entry.1197164677',       // Google Form entry
        type: 'text',                        // text / phone / textarea / select / checkbox
        minLength: 2,
        message: '이름을 입력해주세요.'
      },
      {
        key: 'phone',
        selector: '[data-field="phone"]',
        entryName: 'entry.889929332',
        type: 'phone',
        message: '핸드폰 번호를 입력해주세요.'
      },
      {
        key: 'goal',  
        selector: '[data-field="goal"]',
        entryName: 'entry.213300287',
        type: 'select',
        message: '촬영목적을 선택해주세요.'
      },
      {
        key: 'hope-date',  
        selector: '[data-field="hope-date"]',
        entryName: 'entry.2092989672',
        type: 'select',
        message: '촬영 희망시기를 선택해주세요.'
      },
      {
        key: 'family-schedule',  
        selector: '[data-field="family-schedule"]',
        entryName: 'entry.971754179',
        type: 'select',
        message: '가족 일정 상태를 선택해주세요.'
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
        entryName: 'entry.841900972',  // ← 구글 폼에서 실제 매체 필드 entry.* 값으로 맞춰줘야 함
        type: 'hidden',
        message: '유입 경로 정보가 없습니다.'
      },
      {
      key: 'uid',
      selector: '[data-field="uid"]',
      entryName: 'entry.1826381699',
      type: 'hidden',
      message: 'uid가 없습니다.'
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
    // 3-2. sessionStorage 기반 uid 생성 및 hidden 필드 세팅
    // - 같은 탭/같은 세션에서는 같은 uid 유지
    // - 전화번호 오입력 후 바로 재제출해도 같은 고객 흐름으로 묶기 위함
    // - 단, 너무 오래 지난 세션은 새 uid 발급
    // ─────────────────────────────
    var UID_STORAGE_KEY = 'signal_landing_uid';
    var UID_CREATED_AT_KEY = 'signal_landing_uid_created_at';
    var UID_TTL_MS = 5 * 60 * 1000; // 5분

    function createUid() {
      return Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    }

    function getSessionUid() {
      var now = Date.now();

      try {
        var savedUid = sessionStorage.getItem(UID_STORAGE_KEY);
        var savedAt = Number(sessionStorage.getItem(UID_CREATED_AT_KEY) || 0);

        // 기존 uid가 있고, [5]분 이내면 기존 uid 재사용
        if (savedUid && savedAt && now - savedAt < UID_TTL_MS) {
          return savedUid;
        }

        // 없거나 오래 지났으면 새 uid 발급
        var newUid = createUid();
        sessionStorage.setItem(UID_STORAGE_KEY, newUid);
        sessionStorage.setItem(UID_CREATED_AT_KEY, String(now));

        return newUid;
      } catch (error) {
        // sessionStorage 사용이 막힌 환경에서는 임시 uid 발급
        return createUid();
      }
    }

    var uidEl = fieldElements['uid'];
    if (uidEl) {
      uidEl.value = getSessionUid();
    }

    // ─────────────────────────────
    // 3-3. 촬영목적별 땡큐페이지 URL 분기
    // ─────────────────────────────
    function getThankyouInfoByGoal(goal) {
      if (goal === '리마인드 웨딩') {
        return {
          url: 'https://landing-ops.github.io/Signal/result-wedding.html',
          topic: 'wedding'
        };
      }

      if (goal === '환갑·칠순·팔순') {
        return {
          url: 'https://landing-ops.github.io/Signal/result-chilsun.html',
          topic: 'chilsun'
        };
      }

      if (goal === '가족사진 (8인이하)' || goal === '가족사진 (9인이상)') {
        return {
          url: 'https://landing-ops.github.io/Signal/result-family.html',
          topic: 'family'
        };
      }

      // 예외 상황용 기본값
      return {
        url: THANKYOU_URL,
        topic: 'unknown'
      };
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
    // 3-A2. 휴대폰 인증 (발송 / 검증)
    // ─────────────────────────────
    var otpSendBtn   = form.querySelector('[data-otp-send]');
    var otpVerifyRow = form.querySelector('[data-otp-verify-row]');
    var otpCodeEl    = form.querySelector('[data-otp-code]');
    var otpVerifyBtn = form.querySelector('[data-otp-verify]');
    var otpMsg       = form.querySelector('[data-otp-msg]');

    function setOtpMsg(text, color) {
      if (!otpMsg) return;
      otpMsg.textContent = text;
      otpMsg.style.color = color || '';
    }

    // CORS 프리플라이트 회피: text/plain + 단순요청
    function callOtpApi(payload) {
      return fetch(OTP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); });
    }

    function getValidPhoneDigits() {
      if (!phoneEl) return '';
      var d = (phoneEl.value || '').replace(/\D/g, '');
      return /^010\d{8}$/.test(d) ? d : '';
    }

    // 인증번호 받기
    if (otpSendBtn) {
      otpSendBtn.addEventListener('click', function () {
        var phone = getValidPhoneDigits();
        if (!phone) { setOtpMsg('휴대폰 번호를 정확히 입력해주세요.', '#d33'); return; }

        otpSendBtn.disabled = true;
        setOtpMsg('인증번호 발송 중...', '');

        callOtpApi({ action: 'send', phone: phone })
          .then(function (res) {
            if (res.ok) {
              if (otpVerifyRow) { otpVerifyRow.classList.remove('hidden'); otpVerifyRow.classList.add('flex'); }
              otpSendBtn.textContent = '인증번호 재발송';
              setOtpMsg('인증번호를 발송했습니다. (3분 이내 입력)', '#1a7f37');
            } else {
              setOtpMsg(res.message || '발송에 실패했습니다.', '#d33');
            }
          })
          .catch(function () { setOtpMsg('네트워크 오류로 발송에 실패했습니다.', '#d33'); })
          .then(function () { setTimeout(function () { otpSendBtn.disabled = false; }, 3000); });
      });
    }

    // 인증번호 확인
    if (otpVerifyBtn) {
      otpVerifyBtn.addEventListener('click', function () {
        var phone = getValidPhoneDigits();
        var code = ((otpCodeEl && otpCodeEl.value) || '').replace(/\D/g, '');
        if (!phone) { setOtpMsg('휴대폰 번호를 다시 확인해주세요.', '#d33'); return; }
        if (code.length !== 6) { setOtpMsg('인증번호 6자리를 입력해주세요.', '#d33'); return; }

        otpVerifyBtn.disabled = true;
        setOtpMsg('확인 중...', '');

        callOtpApi({ action: 'verify', phone: phone, code: code })
          .then(function (res) {
            if (res.ok) {
              isPhoneVerified = true;
              setOtpMsg('✓ 인증이 완료되었습니다.', '#1a7f37');
              if (otpCodeEl) otpCodeEl.disabled = true;
              if (otpSendBtn) otpSendBtn.disabled = true;
              if (!hasInteracted) hasInteracted = true;
              updateSubmitButtonState();
            } else {
              otpVerifyBtn.disabled = false;
              setOtpMsg(res.message || '인증에 실패했습니다.', '#d33');
            }
          })
          .catch(function () {
            otpVerifyBtn.disabled = false;
            setOtpMsg('네트워크 오류로 확인에 실패했습니다.', '#d33');
          });
      });
    }

    // 번호를 수정하면 인증 무효화 (번호 A 인증 후 B로 바꿔치기 방지)
    if (phoneEl) {
      phoneEl.addEventListener('input', function () {
        if (!isPhoneVerified) return;
        isPhoneVerified = false;
        if (otpCodeEl) { otpCodeEl.disabled = false; otpCodeEl.value = ''; }
        if (otpSendBtn) { otpSendBtn.disabled = false; otpSendBtn.textContent = '인증번호 받기'; }
        if (otpVerifyRow) { otpVerifyRow.classList.add('hidden'); otpVerifyRow.classList.remove('flex'); }
        setOtpMsg('번호가 변경되어 다시 인증이 필요합니다.', '#d33');
        updateSubmitButtonState();
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

        // ★ 휴대폰 번호인증 미완료면 통과 불가
        if (!isPhoneVerified) {
          return { ok: false, message: '휴대폰 인증을 완료해주세요.' };
        }

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

      // uid 값 확인
      // 같은 탭/같은 세션에서는 기존 uid 유지
      // 세션이 없거나 만료되었으면 새 uid 발급
      var uid = getSessionUid();

      // ★폼 제출 시점 기준으로 5분 창 리셋
      // 이전: 랜딩 첫 로드 시각부터 5분
      // 변경: 가장 최근 제출 시각부터 5분
      // → 오타 수정 후 재제출 시 같은 UID로 묶이는 시간이 더 정확해짐
      try {
        sessionStorage.setItem(UID_CREATED_AT_KEY, String(Date.now()));
      } catch (e) {}

      if (fieldElements['uid']) {
        fieldElements['uid'].value = uid;
      }

      // 촬영목적 값 확인
      var goal = fieldElements['goal'] ? fieldElements['goal'].value : '';

      // 폼 데이터를 FormData 형태로 수집
      var formData = new FormData(form);

      // AJAX 방식으로 Google Form에 전송
      fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      })
      //  <<<<< ★새롭게 추가된것★
      .then(function () {
        hoa(uid, goal);
      })
      .catch(function () {
        hoa(uid, goal);
      }); // <<<<<  ★새롭게 추가된것★
    });

    // ─────────────────────────────
    // 10. 전송 후 후처리 함수 (hoa)
    //     - 알림 → 상단 스크롤 → 땡큐페이지 이동
    // ─────────────────────────────
    // <<< ★hoa 함수 전체 새롭게 바뀐거임★
      function hoa(uid, goal) {
      alert('신청이 완료되었습니다.');

      // 상단으로 부드럽게 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });

      var thankyouInfo = getThankyouInfoByGoal(goal);
      var source = fieldElements['source'] ? fieldElements['source'].value : '';

      var params = new URLSearchParams();
      params.set('uid', uid);
      params.set('topic', thankyouInfo.topic);
      params.set('goal', goal);
      params.set('src', source);

      // 촬영목적별 땡큐페이지로 이동
      window.location.href = thankyouInfo.url + '?' + params.toString();
    } // <<< ★hoa 함수 전체 새롭게 바뀐거임★
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
