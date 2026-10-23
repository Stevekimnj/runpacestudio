/* =====================================================================
 * RunPaceStudio — app.js (v2 통합 업그레이드)
 * ---------------------------------------------------------------------
 * 이 파일은 크게 3부분으로 나뉩니다.
 *   [1부] Engine   : 화면(DOM)과 독립된 순수 스포츠 과학 계산 엔진
 *                    - MILE(MPH, min/mi) ↔ KM(km/h, min/km) 양방향 변환
 *                    - 트레드밀 경사도(0% ~ 15%) ↔ 야외 평지 환산 속도·페이스(GAP)
 *                    - ACSM VO2 대사 방정식 & 실시간 칼로리 소모량 계산
 *                    - Jack Daniels VDOT & 4대 트레드밀 워크아웃 큐시트 생성기
 *                    - 속도별 엘리트 러너(Dauwalter, Kipchoge, Ingebrigtsen, Bekele) 주법 매칭
 *                    - 기온·이슬점(습도)·풍속 야외 페이스 보정기 & MAF 180 심박수 계산기
 *                    - 5K / 10K / 하프 / 풀 마라톤 구간별 페이스 밴드 생성기
 *   [2부] QRCode   : 외부 서버나 외부 라이브러리 없이 100% 브라우저 내부에서
 *                    실제 스캔 가능한 표준 QR 코드(SVG)를 그리는 보안 내장 모듈
 *   [3부] UI       : 4대 메인 탭, 원터치 MILE↔KM 변환, 큐시트 미세 수정,
 *                    인터랙티브 트레드밀 콘솔 타이머, 인쇄·저장·공유 화면 로직
 * ===================================================================== */

'use strict';

/* =====================================================================
 * [1부] Engine — 순수 스포츠 과학 계산 함수 모음
 * ===================================================================== */
const Engine = (() => {
  // ---- 1) 기본 물리·단위 상수 ---------------------------------------
  const METERS_PER_MILE = 1609.344; // 1마일 = 1609.344 미터 (국제 육상 표준)
  const METERS_PER_KM = 1000;       // 1킬로미터 = 1000 미터
  const LBS_PER_KG = 2.20462262;    // 1 kg = 2.20462 파운드(lbs)

  // 속도(MPH, km/h) ↔ 초속(m/s) 변환 함수
  const mphToMps = (mph) => (mph * METERS_PER_MILE) / 3600;
  const mpsToMph = (mps) => (mps * 3600) / METERS_PER_MILE;
  const kmhToMps = (kmh) => (kmh * METERS_PER_KM) / 3600;
  const mpsToKmh = (mps) => (mps * 3600) / METERS_PER_KM;

  // 페이스(1마일 또는 1km당 걸리는 시간 '초') ↔ 초속(m/s) 변환 함수
  const secPerMileToMps = (sec) => METERS_PER_MILE / sec;
  const mpsToSecPerMile = (mps) => METERS_PER_MILE / mps;
  const secPerKmToMps = (sec) => METERS_PER_KM / sec;
  const mpsToSecPerKm = (mps) => METERS_PER_KM / mps;

  // 체중 변환 (파운드 ↔ 킬로그램)
  const lbsToKg = (lbs) => lbs / LBS_PER_KG;
  const kgToLbs = (kg) => kg * LBS_PER_KG;

  // 소수점 첫째 자리 반올림 (트레드밀 콘솔 표시용)
  const round1 = (x) => Math.round(x * 10) / 10;

  // ---- 2) 시간 문자열 포맷 & 파싱 ------------------------------------
  /**
   * 초(숫자)를 "m:ss" 또는 "h:mm:ss" 문자열로 바꿉니다.
   * 예) 480 → "8:00", 12600 → "3:30:00"
   */
  function formatTime(totalSec) {
    if (!Number.isFinite(totalSec) || totalSec <= 0) return '--:--';
    let s = Math.round(totalSec);
    const h = Math.floor(s / 3600);
    s -= h * 3600;
    const m = Math.floor(s / 60);
    const sec = s - m * 60;
    const ss = String(sec).padStart(2, '0');
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`;
    return `${m}:${ss}`;
  }

  /**
   * 사용자가 입력한 시간 글자를 '초(sec)' 단위로 해석합니다.
   * 콜론(:)이 없어도 스마트폰 숫자 키패드로 쉽게 입력할 수 있도록 지원합니다.
   *   "8:00" 또는 "800"   → 480초 (8분 00초)
   *   "3:30:00" 또는 "33000" → 12600초 (3시간 30분 00초)
   */
  function parseTime(text) {
    if (typeof text !== 'string') return NaN;
    const t = text.trim();
    if (t === '') return NaN;

    let parts;
    if (t.includes(':')) {
      parts = t.split(':').map((p) => p.trim());
      if (parts.some((p) => p === '' || !/^\d+$/.test(p))) return NaN;
    } else {
      if (!/^\d+$/.test(t)) return NaN;
      if (t.length <= 2) return Number(t) * 60; // 1~2자리 숫자는 '분'으로 해석 (예: "8" → 8:00)
      if (t.length <= 4) parts = [t.slice(0, -2), t.slice(-2)];
      else parts = [t.slice(0, -4), t.slice(-4, -2), t.slice(-2)];
    }

    const nums = parts.map(Number);
    if (nums.length === 2) {
      const [m, s] = nums;
      if (s >= 60) return NaN;
      return m * 60 + s;
    }
    if (nums.length === 3) {
      const [h, m, s] = nums;
      if (m >= 60 || s >= 60) return NaN;
      return h * 3600 + m * 60 + s;
    }
    return NaN;
  }

  // ---- 3) 경사도(0~15%) ↔ 야외 평지 환산(GAP) 및 대사/칼로리 ----------
  /**
   * ACSM 러닝 산소 섭취량 방정식 (VO2, 단위: ml/kg/min)
   *   VO2 = 0.2 × v + 0.9 × v × grade + 3.5
   *   - v     : 분속 (m/min) = 초속(m/s) × 60
   *   - grade : 경사도 소수 (예: 5% → 0.05, 최대 15% → 0.15)
   *   - 3.5   : 안정 시 기본 산소 소비량 (1 MET)
   */
  function acsmRunningVO2(mps, gradePct) {
    const v = Math.max(0, mps) * 60;
    const g = Math.max(0, gradePct) / 100;
    return 0.2 * v + 0.9 * v * g + 3.5;
  }

  /**
   * VO2(ml/kg/min)와 체중(kg)으로 소모 칼로리를 계산합니다.
   * 스포츠 생리학 표준: 산소 1리터(1,000ml) 소비당 약 5 kcal 에너지 소모
   */
  function caloriesFromVO2(vo2, weightKg) {
    const w = Number.isFinite(weightKg) && weightKg > 20 ? weightKg : 70;
    const kcalPerMin = (vo2 * w) / 1000 * 5;
    return {
      kcalPerMin,
      kcalPerHour: kcalPerMin * 60,
      mets: vo2 / 3.5,
    };
  }

  /**
   * 트레드밀 속도(treadmillMps)와 경사도(gradePct, 0~15%)로 달릴 때,
   * "야외 평지(0% 지형 + 공기저항 존재)"에서 얼마의 속도로 달리는 것과
   * 동일한 대사 부하(에너지 소비)인지 계산합니다. (GAP: Grade Adjusted Pace)
   *
   * 과학적 근거:
   *  1) Jones & Doust (1996, J Sports Sci): 트레드밀 1% 경사는 야외 평지 달리기의
   *     공기저항 에너지 비용과 가장 잘 일치함 (즉, 트레드밀 1% = 야외 평지).
   *  2) ACSM 경사 대사 공식: 순수 주행 산소 비용(Net VO2) = v × (0.2 + 0.9 × G)
   *     따라서 야외 평지 환산 속도 v_outdoor = v_tm × (0.2 + 0.9 × G) / (0.2 + 0.9 × 0.01)
   */
  const OUTDOOR_EQUIV_GRADE = 1.0; // 야외 공기저항 보정 기준 경사(1%)

  function outdoorEquivalentMps(treadmillMps, gradePct) {
    const refFactor = 0.2 + 0.9 * (OUTDOOR_EQUIV_GRADE / 100); // 0.209
    const gradeFactor = 0.2 + 0.9 * (Math.max(0, gradePct) / 100);
    return (treadmillMps * gradeFactor) / refFactor;
  }

  /**
   * 트레드밀 0% 무풍 평지 대비 환산 속도 (보조 지표용)
   * 트레드밀 0%에서 같은 에너지를 쓰려면 몇 MPH로 뛰어야 하는지 계산합니다.
   */
  function flatZeroTreadmillMps(treadmillMps, gradePct) {
    const gradeFactor = 0.2 + 0.9 * (Math.max(0, gradePct) / 100);
    return (treadmillMps * gradeFactor) / 0.2;
  }

  /**
   * 반대로, "목표 야외 평지 속도(outdoorMps)"와 같은 훈련 효과를 내려면
   * 경사도 gradePct(0~15%)인 트레드밀에서 벨트 속도를 얼마로 줄여야(또는 높여야) 하는지 계산합니다.
   */
  function treadmillSpeedForOutdoor(outdoorMps, gradePct) {
    const refFactor = 0.2 + 0.9 * (OUTDOOR_EQUIV_GRADE / 100); // 0.209
    const gradeFactor = 0.2 + 0.9 * (Math.max(0, gradePct) / 100);
    return (outdoorMps * refFactor) / gradeFactor;
  }

  // ---- 4) Jack Daniels VDOT & 훈련 존 계산 --------------------------
  // 속도(m/min) → 산소 요구량 (Daniels & Gilbert, 1979)
  const danielsVO2 = (vMpm) => -4.6 + 0.182258 * vMpm + 0.000104 * vMpm * vMpm;

  // 지속 시간(분) → 유지 가능한 %VO2max 비율
  const danielsPctMax = (tMin) =>
    0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin);

  /** 레이스 거리(m)와 완주 시간(초)으로 VDOT 계산 */
  function vdotFromRace(distanceM, timeSec) {
    if (!(distanceM > 0) || !(timeSec > 0)) return NaN;
    const tMin = timeSec / 60;
    const vMpm = distanceM / tMin;
    return danielsVO2(vMpm) / danielsPctMax(tMin);
  }

  /**
   * 평소 Easy 조깅 속도(m/s)로부터 VDOT를 역산합니다.
   * Daniels Easy Zone의 대표 강도(약 67% VO2max)를 기준으로 계산합니다.
   */
  function vdotFromEasyMps(easyMps) {
    if (!(easyMps > 0)) return NaN;
    const vMpm = easyMps * 60;
    return danielsVO2(vMpm) / 0.67;
  }

  /** 목표 산소량(VO2)을 내는 달리기 속도(m/s) 역산 (2차방정식 근의 공식) */
  function mpsForVO2(vo2) {
    const a = 0.000104;
    const b = 0.182258;
    const c = -(4.6 + vo2);
    const vMpm = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    return vMpm / 60;
  }

  /** VDOT로 특정 레이스 거리(m)의 예상 완주 시간(초) 계산 (이분 탐색법) */
  function predictRaceSec(vdot, distanceM) {
    let lo = distanceM / 7.5;
    let hi = distanceM / 0.8;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (vdotFromRace(distanceM, mid) > vdot) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /** Jack Daniels 5대 핵심 훈련 존 정의 */
  const ZONES = [
    { key: 'E', name: 'Easy / Recovery', lo: 0.59, hi: 0.74, hrZone: 'Zone 2 (65–78% HRmax)', purpose: 'Aerobic base & capillary density' },
    { key: 'M', name: 'Marathon Pace', lo: null, hi: null, hrZone: 'Zone 3 (80–85% HRmax)', purpose: 'Race-specific glycogen efficiency' },
    { key: 'T', name: 'Threshold (Cruise)', lo: 0.88, hi: 0.88, hrZone: 'Zone 4 (88–92% HRmax)', purpose: 'Lactate clearance stamina' },
    { key: 'I', name: 'Interval (VO₂max)', lo: 0.975, hi: 0.975, hrZone: 'Zone 5 (95–100% HRmax)', purpose: 'Maximal aerobic power' },
    { key: 'R', name: 'Repetition (Speed)', lo: 1.07, hi: 1.07, hrZone: 'Anaerobic (N/A)', purpose: 'Neuromuscular economy & form' },
  ];

  function trainingZones(vdot) {
    return ZONES.map((z) => {
      if (z.key === 'M') {
        const mps = 42195 / predictRaceSec(vdot, 42195);
        return { ...z, slowMps: mps, fastMps: mps, midMps: mps };
      }
      const slowMps = mpsForVO2(vdot * z.lo);
      const fastMps = mpsForVO2(vdot * z.hi);
      const midMps = mpsForVO2(vdot * ((z.lo + z.hi) / 2));
      return { ...z, slowMps, fastMps, midMps };
    });
  }

  // ---- 5) Tab 2: 4대 트레드밀 워크아웃 큐시트 자동 생성기 ------------
  /**
   * 사용자의 VDOT와 총 운동 시간(30, 45, 60분) 및 선택한 훈련 종류에 맞춰
   * 트레드밀에서 바로 따라 할 수 있는 단계별 큐시트(시간표)를 생성합니다.
   *
   * 반환 배열의 각 원소:
   *   { id, stage, minutes, mps, incline, hrZone, cue }
   */
  function generateWorkout(type, totalMinutes, vdot) {
    const dur = [30, 45, 60].includes(Number(totalMinutes)) ? Number(totalMinutes) : 45;
    const zones = trainingZones(Number.isFinite(vdot) ? vdot : 45);
    const zMap = Object.fromEntries(zones.map((z) => [z.key, z]));

    const easyLow = zMap.E.slowMps;
    const easyMid = zMap.E.midMps;
    const easyHigh = zMap.E.fastMps;
    const mPace = zMap.M.midMps;
    const tPace = zMap.T.midMps;
    const iPace = zMap.I.midMps;

    const steps = [];
    const add = (stage, minutes, mps, incline, hrZone, cue) => {
      steps.push({
        id: steps.length + 1,
        stage,
        minutes: Number(minutes),
        // 트레드밀 1% 경사 기준 벨트 속도로 맞춰줍니다 (0.1 MPH 단위로 깔끔하게 정리)
        mps: mphToMps(round1(mpsToMph(treadmillSpeedForOutdoor(mps, incline)))),
        incline: Number(incline),
        hrZone,
        cue,
      });
    };

    if (type === 'interval') {
      // ① Interval Training (VO2max 고강도 인터벌 & 회복 조깅)
      // 30분: 워밍업 6분 + 4×(3분 I + 2분 회복) + 쿨다운 4분 = 30분
      // 45분: 워밍업 10분 + 5×(3분 I + 2분 회복) + 쿨다운 10분 = 45분
      // 60분: 워밍업 10분 + 8×(3분 I + 2분 회복) + 쿨다운 10분 = 60분
      const wu = dur === 30 ? 6 : 10;
      const reps = dur === 30 ? 4 : dur === 45 ? 5 : 8;
      const cd = dur === 30 ? 4 : 10;

      add('Warm-up Jog', wu, easyLow, 1.0, 'Zone 2 (65–75%)', 'Start easy. Let synovial fluid warm the joints; relax shoulders.');
      for (let r = 1; r <= reps; r++) {
        add(
          `VO₂max Work #${r}/${reps}`,
          3,
          iPace,
          1.0,
          'Zone 5 (95–100%)',
          'Drive knees, 190+ spm turnover, gaze straight ahead—do not look down at feet.'
        );
        add(
          `Recovery Jog #${r}/${reps}`,
          2,
          easyLow * 0.92,
          0.5,
          'Zone 1–2 (<72%)',
          'Deep belly breaths. Shake out arms and hands before the next rep.'
        );
      }
      add('Cool-down Jog', cd, easyLow, 0.5, 'Zone 1–2 (60–70%)', 'Gradually bring heart rate down; keep cadence light.');
    } else if (type === 'cruise') {
      // ② Cruise Running (Jack Daniels T-Pace 젖산 역치 크루즈 인터벌)
      // 30분: 워밍업 5분 + 3×(6분 T + 1분 회복) + 쿨다운 4분 = 30분
      // 45분: 워밍업 8분 + 4×(7분 T + 1분 회복) + 쿨다운 5분 = 45분
      // 60분: 워밍업 10분 + 5×(8분 T + 1분 회복) + 쿨다운 5분 = 60분
      const config =
        dur === 30
          ? { wu: 5, reps: 3, work: 6, rest: 1, cd: 4 }
          : dur === 45
          ? { wu: 8, reps: 4, work: 7, rest: 1, cd: 5 }
          : { wu: 10, reps: 5, work: 8, rest: 1, cd: 5 };

      add('Warm-up Aerobic', config.wu, easyMid, 1.0, 'Zone 2 (68–75%)', 'Find your rhythm; mid-foot contact directly under hips.');
      for (let r = 1; r <= config.reps; r++) {
        add(
          `Cruise T-Pace #${r}/${config.reps}`,
          config.work,
          tPace,
          1.0,
          'Zone 4 (88–92%)',
          'Comfortably hard! Smooth Norwegian-style threshold rhythm—zero upper-body tension.'
        );
        add(
          `Float Recovery #${r}/${config.reps}`,
          config.rest,
          easyLow,
          1.0,
          'Zone 2 (70–75%)',
          'Short 60-sec float jog to clear lactate while keeping aerobic enzymes active.'
        );
      }
      add('Cool-down Easy', config.cd, easyLow, 0.5, 'Zone 1–2 (<70%)', 'Easy spin-down; hydrate immediately after stepping off.');
    } else if (type === 'buildup') {
      // ③ Build-up Run (워밍업부터 마라톤/역치 속도까지 4단계 점진 가속 + 쿨다운)
      // 30분: 6 + 6 + 6 + 6 + 4 + 2(쿨다운) → 5블록 구성
      // 45분: 8(WU/Easy) + 10(Aerobic) + 10(Marathon) + 10(Threshold) + 7(Cool-down) = 45분
      // 60분: 10(WU/Easy) + 14(Aerobic) + 14(Marathon) + 12(Threshold) + 10(Cool-down) = 60분
      const blocks =
        dur === 30
          ? [5, 7, 7, 6, 5]
          : dur === 45
          ? [8, 10, 10, 10, 7]
          : [10, 14, 14, 12, 10];

      add('Stage 1 · Easy Warm-up', blocks[0], easyLow, 1.0, 'Zone 2 (65–72%)', 'Patient start. Let muscles warm up naturally without forcing stride length.');
      add('Stage 2 · Steady Aerobic', blocks[1], easyHigh, 1.0, 'Zone 2–3 (74–80%)', 'Settle into a 180 spm rhythm; 3–5° forward lean from the ankles.');
      add('Stage 3 · Marathon Pace', blocks[2], mPace, 1.0, 'Zone 3 (80–85%)', 'Kipchoge-style race rhythm—compact 90° arm swing, quiet head.');
      add('Stage 4 · Threshold Finish', blocks[3], tPace, 1.5, 'Zone 4 (88–92%)', 'Strong finish! Slight 1.5% grade recruits glutes while protecting hamstrings.');
      add('Cool-down Jog', blocks[4], easyLow, 0.5, 'Zone 1–2 (<70%)', 'Gentle flush-out jog. Celebrate a textbook negative-split progression!');
    } else {
      // ④ Recovery & MAF Run (부상 방지 및 피로 회복용 저심박 에어로빅 세팅)
      // 30분: 5 + 10 + 10 + 5 = 30분
      // 45분: 5 + 18 + 15 + 7 = 45분
      // 60분: 6 + 24 + 22 + 8 = 60분
      const blocks =
        dur === 30
          ? [5, 10, 10, 5]
          : dur === 45
          ? [5, 18, 15, 7]
          : [6, 24, 22, 8];

      add('Gentle Warm-up', blocks[0], easyLow * 0.9, 0.5, 'Zone 1 (60–65%)', 'Ultra-easy transition from rest to movement. Nose-breathing check.');
      add('MAF Aerobic Block 1', blocks[1], easyLow, 1.0, 'MAF Zone (68–73%)', 'Strict low heart rate. If HR drifts up, drop speed by 0.2 mph immediately.');
      add('MAF Incline Posture Block 2', blocks[2], easyLow * 0.98, 1.5, 'MAF Zone (70–75%)', 'Slight 1.5% grade reduces impact shock on knees while keeping aerobic load steady.');
      add('Recovery Cool-down', blocks[3], easyLow * 0.88, 0.0, 'Zone 1 (<65%)', 'Finish feeling fresher than when you started.');
    }

    return steps;
  }

  // ---- 6) Tab 2: 속도별 엘리트 러너 주법 매칭 데이터 -----------------
  const ELITE_RUNNERS = [
    {
      key: 'dauwalter',
      name: 'Courtney Dauwalter',
      title: 'Ultra & Incline Efficiency Master',
      speedRangeMph: '4.5 – 7.4 MPH (or Incline ≥ 6%)',
      minMph: 0,
      maxMph: 7.45,
      cadence: '168–176 spm (short, rhythmic steps)',
      footStrike: 'Soft midfoot landing directly under hips; zero braking force',
      upperBody: '6–10° ankle lean on grades; ultra-relaxed low shoulders & loose hands',
      biomechanics:
        'At recovery speeds or steep treadmill grades (6–15%), long strides waste hip-flexor energy. Dauwalter keeps ground contact smooth with short, piston-like steps and transitions seamlessly to power-hiking on extreme inclines.',
      coachCue: 'Shorten your stride as incline rises—keep effort conversational and arms swinging low.',
      ytUrl: 'https://www.youtube.com/results?search_query=Courtney+Dauwalter+running+form+slow+motion+analysis',
    },
    {
      key: 'kipchoge',
      name: 'Eliud Kipchoge',
      title: 'Marathon GOAT (1:59:40 Rhythm)',
      speedRangeMph: '7.5 – 9.2 MPH (Marathon & Build-up Zone)',
      minMph: 7.45,
      maxMph: 9.25,
      cadence: '180–185 spm (metronomic consistency)',
      footStrike: 'Balanced midfoot strike 2–3 cm ahead of center of mass',
      upperBody: '3–5° whole-body forward lean from ankles; level chin, 90° elbow angle',
      biomechanics:
        'Kipchoge maximizes elastic recoil from the Achilles tendon while minimizing vertical oscillation (~6.5 cm). His wrists graze the ribcage without crossing the chest midline, saving up to 3% metabolic energy over 26.2 miles.',
      coachCue: 'Run tall with a slight ankle lean, relax your facial muscles, and let the belt roll behind you.',
      ytUrl: 'https://www.youtube.com/results?search_query=Eliud+Kipchoge+running+form+biomechanics+slow+motion',
    },
    {
      key: 'ingebrigtsen',
      name: 'Jakob Ingebrigtsen',
      title: 'Norwegian Threshold & Cruise Specialist',
      speedRangeMph: '9.3 – 10.8 MPH (Threshold / Cruise Zone)',
      minMph: 9.25,
      maxMph: 10.85,
      cadence: '184–192 spm (high leg stiffness)',
      footStrike: 'Crisp midfoot-to-forefoot strike with sub-180ms ground contact',
      upperBody: '4–6° forward lean; locked neutral pelvis & rock-solid core',
      biomechanics:
        'Built on Norwegian double-threshold training, Ingebrigtsen maintains exceptional running economy at lactate threshold by keeping pelvic tilt neutral and using stiff ankle springs rather than over-pushing with the quads.',
      coachCue: 'Stabilize your pelvis, pop off the belt quickly, and match your breathing to a 2-in / 2-out cadence.',
      ytUrl: 'https://www.youtube.com/results?search_query=Jakob+Ingebrigtsen+running+form+threshold+slow+motion',
    },
    {
      key: 'bekele',
      name: 'Kenenisa Bekele',
      title: 'VO₂max Interval & Track Legend',
      speedRangeMph: '10.9+ MPH (VO₂max Interval & Speed Zone)',
      minMph: 10.85,
      maxMph: 99,
      cadence: '190–204 spm (explosive turnover)',
      footStrike: 'Active forefoot/midfoot paw-back with powerful triple extension',
      upperBody: '5–7° dynamic forward lean; high heel recovery & strong backward elbow drive',
      biomechanics:
        'At high treadmill speeds (10.9+ MPH), speed comes from hip-extensor power and rapid hamstring folding (heel close to glutes during swing phase), shortening the leg lever so it swings forward effortlessly.',
      coachCue: 'Drive knees forward, snap heels high toward glutes, and punch elbows straight back.',
      ytUrl: 'https://www.youtube.com/results?search_query=Kenenisa+Bekele+running+form+slow+motion+biomechanics',
    },
  ];

  /** 현재 트레드밀 속도(MPH)와 경사도(%)에 가장 잘 맞는 엘리트 러너 key를 반환합니다. */
  function matchEliteRunner(mph, gradePct = 1) {
    if (gradePct >= 6 && mph < 8.5) return 'dauwalter';
    const found = ELITE_RUNNERS.find((r) => mph >= r.minMph && mph < r.maxMph);
    return found ? found.key : 'kipchoge';
  }

  // ---- 7) Tab 3: 날씨(기온·이슬점·습도·풍속) & MAF 180 계산 ------------
  const fToC = (f) => ((f - 32) * 5) / 9;
  const cToF = (c) => (c * 9) / 5 + 32;

  /**
   * 기온(°C)과 상대습도(RH, 1~100%)로 이슬점(°C)을 계산합니다 (Magnus 공식).
   * 기상청 이슬점 정보를 모를 때 습도(%)만으로도 정확히 계산할 수 있게 해줍니다.
   */
  function dewPointFromTempRhC(tempC, rhPct) {
    const rh = Math.min(100, Math.max(1, rhPct));
    const a = 17.625;
    const b = 243.04;
    const alpha = Math.log(rh / 100) + (a * tempC) / (b + tempC);
    return (b * alpha) / (a - alpha);
  }

  const DEW_TABLE = [
    { max: 100, lo: 0, hi: 0, note: 'Ideal — 100% normal pace' },
    { max: 110, lo: 0, hi: 0.5, note: 'Prime conditions' },
    { max: 120, lo: 0.5, hi: 1.0, note: 'Slight warmth' },
    { max: 130, lo: 1.0, hi: 2.0, note: 'Noticeable humidity' },
    { max: 140, lo: 2.0, hi: 3.0, note: 'Moderate heat load' },
    { max: 150, lo: 3.0, hi: 4.5, note: 'Hard — hydrate & electrolytes' },
    { max: 160, lo: 4.5, hi: 6.0, note: 'Very hard — shorten intervals' },
    { max: 170, lo: 6.0, hi: 8.0, note: 'Severe heat stress — move indoors' },
    { max: 180, lo: 8.0, hi: 10.0, note: 'Dangerous — easy jog or treadmill only' },
  ];

  function dewPointAdjustment(tempF, dewF) {
    const sum = Math.round(tempF + dewF);
    const row = DEW_TABLE.find((r) => sum <= r.max);
    if (!row) {
      return { sum, lo: 10, hi: 12, mid: 11, note: 'Extreme heat — move workout to treadmill!', notRecommended: true };
    }
    return { sum, lo: row.lo, hi: row.hi, mid: (row.lo + row.hi) / 2, note: row.note, notRecommended: false };
  }

  /**
   * 풍속(Wind Speed)에 따른 야외 페이스 보정률(%) 계산
   * 과학적 근거:
   *  - Pugh (1971, J Physiol) & Davies (1980, J Appl Physiol):
   *    공기저항 힘은 상대 풍속의 제곱 (v_runner ± v_wind)² 에 비례.
   *    뒷바람(Tailwind)이 주는 이득은 맞바람(Headwind) 손실의 약 50% 수준.
   *  - direction: 'head' (맞바람), 'tail' (뒷바람), 'cross' (측풍: 약 25% 손실)
   */
  function windAdjustmentPct(runnerMps, windMps, direction = 'head') {
    if (!(runnerMps > 0) || !(windMps > 0)) return 0;
    // 공기저항에 따른 추가 산소 비용 (근사 물리 모델: ΔVO2 ≈ 0.0035 × v_rel² × 60 / runnerMps)
    const baseVO2 = acsmRunningVO2(runnerMps, 1.0) - 3.5;
    const dragDrag = 0.015 * windMps * windMps + 0.018 * runnerMps * windMps;
    const rawPct = (dragDrag / Math.max(10, baseVO2)) * 100;
    if (direction === 'head') return Math.min(25, rawPct);
    if (direction === 'tail') return -Math.min(12, rawPct * 0.5); // 음수 = 페이스가 빨라짐
    return Math.min(10, rawPct * 0.25); // 측풍(Crosswind)
  }

  /**
   * Dr. Phil Maffetone 의 MAF 180 심박수 공식
   *   MAF HR = 180 − 나이 + 건강/훈련 보정치(−10, −5, 0, +5)
   */
  function calculateMaf(age, modifier = 0) {
    const a = Math.min(95, Math.max(14, Number(age) || 35));
    const mod = [-10, -5, 0, 5].includes(Number(modifier)) ? Number(modifier) : 0;
    const mafMax = 180 - a + mod;
    return {
      age: a,
      modifier: mod,
      mafMax,
      mafMin: mafMax - 10,
      rangeText: `${mafMax - 10} – ${mafMax} bpm`,
    };
  }

  // ---- 8) Tab 4: 마라톤 페이스 밴드 스플릿 생성기 --------------------
  const RACES = [
    { key: '5k', label: '5K', meters: 5000 },
    { key: '10k', label: '10K', meters: 10000 },
    { key: 'half', label: 'Half Marathon', meters: 21097.5 },
    { key: 'full', label: 'Full Marathon', meters: 42195 },
  ];

  /**
   * 종목 거리(distanceM), 목표 완주 시간(targetSec), 단위('mi' 또는 'km'),
   * 레이스 전략('even' | 'negative' | 'conservative')을 받아 구간별 스플릿 배열을 생성합니다.
   * 어떤 전략을 선택하든 마지막 피니시 누적 시간은 정확히 targetSec 과 일치하도록 정규화합니다!
   */
  function generatePaceBand(distanceM, targetSec, unit = 'mi', strategy = 'even') {
    if (!(distanceM > 0) || !(targetSec > 0)) return [];
    const unitMeters = unit === 'km' ? METERS_PER_KM : METERS_PER_MILE;
    const totalUnits = distanceM / unitMeters;
    const fullCount = Math.floor(totalUnits);
    const remainder = totalUnits - fullCount;

    // 각 구간(조각)의 길이 비율 배열 만들기
    const segments = [];
    for (let i = 1; i <= fullCount; i++) {
      segments.push({ index: i, label: `${i} ${unit}`, distFrac: 1, cumUnits: i });
    }
    if (remainder > 0.01) {
      segments.push({
        index: fullCount + 1,
        label: `Finish (${totalUnits.toFixed(2)} ${unit})`,
        distFrac: remainder,
        cumUnits: totalUnits,
      });
    }

    // 전략별 구간 상대 시간 가중치(1.0보다 크면 느리게, 작으면 빠르게)
    const n = segments.length;
    const rawWeights = segments.map((seg, idx) => {
      const progress = idx / Math.max(1, n - 1); // 0.0 (출발) ~ 1.0 (결승)
      let paceFactor = 1.0;
      if (strategy === 'negative') {
        // 전반부는 +1.8% 여유 있게 시작해 후반부 -1.8%까지 점진 가속
        paceFactor = 1.018 - 0.036 * progress;
      } else if (strategy === 'conservative') {
        // 첫 20% 구간만 +2.2% 여유 있게 출발하고 이후 정속 주행
        paceFactor = progress < 0.2 ? 1.022 : 0.995;
      }
      return seg.distFrac * paceFactor;
    });

    const weightSum = rawWeights.reduce((a, b) => a + b, 0);
    let elapsedSec = 0;

    return segments.map((seg, idx) => {
      const segSec = (rawWeights[idx] / weightSum) * targetSec;
      elapsedSec += segSec;
      const pacePerUnitSec = segSec / seg.distFrac;
      const segMps = unitMeters / pacePerUnitSec;
      return {
        label: seg.label,
        splitPace: formatTime(pacePerUnitSec),
        segmentTime: formatTime(segSec),
        elapsedTime: formatTime(elapsedSec),
        mph: mpsToMph(segMps).toFixed(1),
        kmh: mpsToKmh(segMps).toFixed(1),
      };
    });
  }

  return {
    METERS_PER_MILE, METERS_PER_KM, LBS_PER_KG,
    mphToMps, mpsToMph, kmhToMps, mpsToKmh,
    secPerMileToMps, mpsToSecPerMile, secPerKmToMps, mpsToSecPerKm,
    lbsToKg, kgToLbs, round1,
    formatTime, parseTime,
    acsmRunningVO2, caloriesFromVO2,
    outdoorEquivalentMps, flatZeroTreadmillMps, treadmillSpeedForOutdoor,
    danielsVO2, danielsPctMax, vdotFromRace, vdotFromEasyMps,
    mpsForVO2, predictRaceSec, trainingZones, ZONES,
    generateWorkout, ELITE_RUNNERS, matchEliteRunner,
    fToC, cToF, dewPointFromTempRhC, dewPointAdjustment, DEW_TABLE,
    windAdjustmentPct, calculateMaf,
    RACES, generatePaceBand,
  };
})();

/* =====================================================================
 * [2부] QRCode — 외부 서버/스크립트 없이 작동하는 순수 내장 QR 생성기
 * ---------------------------------------------------------------------
 * 대표님 보안 원칙(외부 추적 스크립트 0개, CSP 'self' 준수)을 지키기 위해
 * ISO/IEC 18004 표준 QR Code (Byte mode, Error Correction Level L,
 * Version 1~6 자동 선택, 크기 21×21 ~ 41×41)를 순수 자바스크립트로 그려냅니다.
 * 스마트폰 기본 카메라로 화면의 QR을 비추면 공유 URL이 즉시 열립니다.
 * ===================================================================== */
const QRCode = (() => {
  // 버전 1~6 (Level L) 파라미터: [총 코드워드 수, ECC 코드워드 수, 최대 바이트 길이]
  const VERSIONS = [
    null,
    { ver: 1, size: 21, total: 26, ecc: 7, maxBytes: 17, align: [] },
    { ver: 2, size: 25, total: 44, ecc: 10, maxBytes: 32, align: [6, 18] },
    { ver: 3, size: 29, total: 70, ecc: 15, maxBytes: 53, align: [6, 22] },
    { ver: 4, size: 33, total: 100, ecc: 20, maxBytes: 78, align: [6, 26] },
    { ver: 5, size: 37, total: 134, ecc: 26, maxBytes: 106, align: [6, 30] },
    { ver: 6, size: 41, total: 172, ecc: 36, maxBytes: 134, align: [6, 34] }, // 2블록 대신 단일 URL용 여유
  ];

  // 갈루아 필드 GF(256) 지수/로그 테이블 생성 (리드-솔로몬 오류 정정용)
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (() => {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();

  function gfMul(a, b) {
    return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
  }

  function rsCompute(data, eccLen) {
    let gen = [1];
    for (let i = 0; i < eccLen; i++) {
      const next = new Array(gen.length + 1).fill(0);
      for (let j = 0; j < gen.length; j++) {
        next[j] ^= gen[j];
        next[j + 1] ^= gfMul(gen[j], EXP[i]);
      }
      gen = next;
    }
    const res = new Uint8Array(eccLen);
    for (const byte of data) {
      const factor = byte ^ res[0];
      res.copyWithin(0, 1);
      res[eccLen - 1] = 0;
      for (let j = 0; j < eccLen; j++) {
        res[j] ^= gfMul(gen[j + 1], factor);
      }
    }
    return res;
  }

  /** 문자열(URL)을 받아 스캔 가능한 SVG 문자열로 반환합니다. */
  function toSvg(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    // Version 1~5 중 데이터 길이에 맞는 버전 선택 (넘치면 길이 자름)
    const vInfo = VERSIONS.slice(1, 6).find((v) => bytes.length <= v.maxBytes) || VERSIONS[5];
    const payload = bytes.slice(0, vInfo.maxBytes);
    const dataLen = vInfo.total - vInfo.ecc;

    // 비트 스트림 구성: Mode(0100 = Byte) + 길이(8비트) + 데이터 + 종료(0000)
    const bits = [];
    const pushBits = (val, len) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    };
    pushBits(0b0100, 4);
    pushBits(payload.length, 8);
    payload.forEach((b) => pushBits(b, 8));
    for (let i = 0; i < 4 && bits.length < dataLen * 8; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    const dataBytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      dataBytes.push(b);
    }
    let padToggle = true;
    while (dataBytes.length < dataLen) {
      dataBytes.push(padToggle ? 0xec : 0x11);
      padToggle = !padToggle;
    }

    const eccBytes = rsCompute(dataBytes, vInfo.ecc);
    const allCodewords = [...dataBytes, ...eccBytes];

    // 행렬 초기화
    const N = vInfo.size;
    const grid = Array.from({ length: N }, () => new Uint8Array(N));
    const reserved = Array.from({ length: N }, () => new Uint8Array(N));

    const setModule = (r, c, val, isFunc = true) => {
      if (r < 0 || r >= N || c < 0 || c >= N) return;
      grid[r][c] = val ? 1 : 0;
      if (isFunc) reserved[r][c] = 1;
    };

    // 파인더 패턴 (세 모서리 7×7)
    const drawFinder = (r0, c0) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const on =
            dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6 &&
            (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
          setModule(r0 + dr, c0 + dc, on, true);
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, N - 7);
    drawFinder(N - 7, 0);

    // 얼라인먼트 패턴 (Version 2 이상)
    if (vInfo.align.length) {
      const [a0, a1] = vInfo.align;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const on = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setModule(a1 + dr, a1 + dc, on, true);
        }
      }
    }

    // 타이밍 패턴 (6행, 6열)
    for (let i = 8; i < N - 8; i++) {
      setModule(6, i, i % 2 === 0, true);
      setModule(i, 6, i % 2 === 0, true);
    }

    // 다크 모듈 & 포맷 영역 예약
    setModule(N - 8, 8, 1, true);
    for (let i = 0; i < 9; i++) {
      if (i !== 6) {
        reserved[8][i] = 1;
        reserved[i][8] = 1;
      }
    }
    for (let i = 0; i < 8; i++) {
      reserved[8][N - 1 - i] = 1;
      reserved[N - 1 - i][8] = 1;
    }

    // 데이터 비트 지그재그 배치 (Mask 0: (r + c) % 2 === 0 적용)
    let bitIdx = 0;
    const totalBits = allCodewords.length * 8;
    let upward = true;
    for (let right = N - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < N; vert++) {
        const r = upward ? N - 1 - vert : vert;
        for (let j = 0; j < 2; j++) {
          const c = right - j;
          if (!reserved[r][c]) {
            let bit = 0;
            if (bitIdx < totalBits) {
              bit = (allCodewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
              bitIdx++;
            }
            if ((r + c) % 2 === 0) bit ^= 1; // Mask 0
            grid[r][c] = bit;
          }
        }
      }
      upward = !upward;
    }

    // Format Information (Level L = 01, Mask 0 = 000 → BCH 코드 0x77c4)
    const fmt = 0x77c4;
    const fmtCoords1 = [
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
      [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    ];
    for (let i = 0; i < 15; i++) {
      const bit = (fmt >> i) & 1;
      const [r, c] = fmtCoords1[i];
      grid[r][c] = bit;
      if (i < 7) grid[N - 1 - i][8] = bit;
      else grid[8][N - 15 + i] = bit;
    }

    // SVG 문자열 생성 (여백 4칸 포함)
    const pad = 3;
    const totalSize = N + pad * 2;
    let path = '';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (grid[r][c]) path += `M${c + pad},${r + pad}h1v1h-1z`;
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" class="h-48 w-48 rounded-xl bg-white p-2 mx-auto" role="img" aria-label="QR Code for sharing"><rect width="100%" height="100%" fill="#ffffff"/><path d="${path}" fill="#020617"/></svg>`;
  }

  return { toSvg };
})();

// Node.js 환경에서 테스트할 때 Engine 과 QRCode 를 내보냅니다.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ...Engine, Engine, QRCode };
}

/* =====================================================================
 * [3부] UI — 브라우저 화면 제어 로직
 * ===================================================================== */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const E = Engine;
    const $ = (id) => document.getElementById(id);

    // ---- 1) 앱 상태(State) 초기화 및 localStorage 복원 ----------------
    // 기본 단위는 대표님 지시대로 항상 'mi' (MPH / min/mi) 로 시작합니다!
    const STORE_KEY = 'rps.v2';
    const defaults = {
      unit: 'mi',            // 'mi' (MPH & min/mi) 또는 'km' (km/h & min/km)
      mps: E.mphToMps(7.5),  // 기본 트레드밀 속도: 7.5 MPH (8:00/mi)
      incline: 1.0,          // 기본 트레드밀 경사도: 1.0% (0.0 ~ 15.0%)
      weightLbs: 154,        // 기본 체중: 154 lbs (70 kg)
      // Tab 2 (Workouts) 상태
      wkBaseMode: 'easy',    // 'easy' | '5k' | 'marathon'
      wkEasyPace: '9:00',
      wk5kTime: '22:30',
      wkMaraTime: '3:45:00',
      wkDuration: 45,        // 30 | 45 | 60 (분)
      wkType: 'interval',    // 'interval' | 'cruise' | 'buildup' | 'recovery'
      // Tab 3 (Weather & MAF) 상태
      tempUnit: 'F',         // 'F' | 'C'
      humidMode: 'dew',      // 'dew' (이슬점 직접 입력) | 'rh' (상대습도 % 입력)
      tempVal: '78',
      dewVal: '65',
      rhVal: '65',
      windVal: '10',
      windDir: 'head',       // 'head' | 'tail' | 'cross'
      mafAge: '35',
      mafMod: '0',
      // Tab 4 (Marathon Pace Band) 상태
      pbRace: 'full',        // '5k' | '10k' | 'half' | 'full'
      pbTime: '3:30:00',
      pbStrategy: 'even',    // 'even' | 'negative' | 'conservative'
    };

    let state = { ...defaults };
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      if (saved.unit === 'mi' || saved.unit === 'km') state.unit = saved.unit;
      if (Number.isFinite(saved.mps) && saved.mps > 0.4 && saved.mps < 12) state.mps = saved.mps;
      if (Number.isFinite(saved.incline) && saved.incline >= 0 && saved.incline <= 15) state.incline = saved.incline;
      if (Number.isFinite(saved.weightLbs) && saved.weightLbs >= 60 && saved.weightLbs <= 400) state.weightLbs = saved.weightLbs;
      if (['easy', '5k', 'marathon'].includes(saved.wkBaseMode)) state.wkBaseMode = saved.wkBaseMode;
      if (typeof saved.wkEasyPace === 'string') state.wkEasyPace = saved.wkEasyPace;
      if (typeof saved.wk5kTime === 'string') state.wk5kTime = saved.wk5kTime;
      if (typeof saved.wkMaraTime === 'string') state.wkMaraTime = saved.wkMaraTime;
      if ([30, 45, 60].includes(saved.wkDuration)) state.wkDuration = saved.wkDuration;
      if (['interval', 'cruise', 'buildup', 'recovery'].includes(saved.wkType)) state.wkType = saved.wkType;
      if (saved.tempUnit === 'F' || saved.tempUnit === 'C') state.tempUnit = saved.tempUnit;
      if (saved.humidMode === 'dew' || saved.humidMode === 'rh') state.humidMode = saved.humidMode;
      if (typeof saved.tempVal === 'string') state.tempVal = saved.tempVal;
      if (typeof saved.dewVal === 'string') state.dewVal = saved.dewVal;
      if (typeof saved.rhVal === 'string') state.rhVal = saved.rhVal;
      if (typeof saved.windVal === 'string') state.windVal = saved.windVal;
      if (['head', 'tail', 'cross'].includes(saved.windDir)) state.windDir = saved.windDir;
      if (typeof saved.mafAge === 'string') state.mafAge = saved.mafAge;
      if (['-10', '-5', '0', '5'].includes(String(saved.mafMod))) state.mafMod = String(saved.mafMod);
      if (['5k', '10k', 'half', 'full'].includes(saved.pbRace)) state.pbRace = saved.pbRace;
      if (typeof saved.pbTime === 'string') state.pbTime = saved.pbTime;
      if (['even', 'negative', 'conservative'].includes(saved.pbStrategy)) state.pbStrategy = saved.pbStrategy;
    } catch (_) {
      /* 저장소 접근 불가 시 기본값 유지 */
    }

    // URL 공유 파라미터(?mph=8.0&inc=2&unit=mi&tab=workouts 등)가 있으면 우선 적용
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('unit') === 'km' || params.get('unit') === 'mi') state.unit = params.get('unit');
      const pMph = parseFloat(params.get('mph'));
      if (Number.isFinite(pMph) && pMph >= 1 && pMph <= 15) state.mps = E.mphToMps(pMph);
      const pInc = parseFloat(params.get('inc'));
      if (Number.isFinite(pInc) && pInc >= 0 && pInc <= 15) state.incline = pInc;
    } catch (_) {}

    const save = () => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
      } catch (_) {}
    };

    const MIN_MPS = E.mphToMps(1.0);
    const MAX_MPS = E.mphToMps(15.0);
    const clampMps = (v) => Math.min(MAX_MPS, Math.max(MIN_MPS, v));
    const clampIncline = (g) => Math.min(15, Math.max(0, Math.round(g * 2) / 2)); // 0.5% 단위, 0~15%

    /* ------------------------------------------------------------------
     * 2) 메인 탭 전환 (Tab 1 ~ Tab 4)
     * ------------------------------------------------------------------ */
    const tabButtons = document.querySelectorAll('[data-tab]');
    const panels = document.querySelectorAll('[data-panel]');
    function showTab(name) {
      panels.forEach((p) => (p.hidden = p.dataset.panel !== name));
      tabButtons.forEach((b) => {
        const active = b.dataset.tab === name;
        if (active) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    tabButtons.forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

    /* ------------------------------------------------------------------
     * 3) MILE (MPH) ↔ KM (km/h) 원터치 전역 변환 버튼
     * ------------------------------------------------------------------ */
    const unitToggleBtns = document.querySelectorAll('[data-unit-toggle]');
    function setUnit(nextUnit) {
      state.unit = nextUnit === 'km' ? 'km' : 'mi';
      unitToggleBtns.forEach((btn) => {
        const isCurrent = btn.dataset.unitToggle === state.unit;
        btn.setAttribute('aria-pressed', String(isCurrent));
      });
      // 단위 라벨 일괄 업데이트
      document.querySelectorAll('[data-unit-speed-label]').forEach((el) => {
        el.textContent = state.unit === 'mi' ? 'MPH' : 'km/h';
      });
      document.querySelectorAll('[data-unit-pace-label]').forEach((el) => {
        el.textContent = state.unit === 'mi' ? '/mi' : '/km';
      });
      renderSpeedPresets();
      renderTab1();
      renderWorkouts(false); // 큐시트는 유지하되 단위 표시 갱신
      renderWeather();
      renderPaceBand();
      save();
    }
    unitToggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => setUnit(btn.dataset.unitToggle));
    });

    /* ------------------------------------------------------------------
     * 4) Tab 1: Incline (0~15%) & Pace Converter + VO2 / 칼로리
     * ------------------------------------------------------------------ */
    const inMph = $('in-mph');
    const inKmh = $('in-kmh');
    const inPaceMi = $('in-pace-mi');
    const inPaceKm = $('in-pace-km');
    const inIncline = $('in-incline');
    const inWeight = $('in-weight');

    // 속도 프리셋 버튼 생성 (MILE 모드일 때는 MPH 프리셋, KM 모드일 때는 km/h 프리셋)
    function renderSpeedPresets() {
      const box = $('speed-presets');
      if (!box) return;
      const presets =
        state.unit === 'mi'
          ? [
              { label: '5.0 mph', mps: E.mphToMps(5.0) },
              { label: '6.0 mph', mps: E.mphToMps(6.0) },
              { label: '7.0 mph', mps: E.mphToMps(7.0) },
              { label: '7.5 mph', mps: E.mphToMps(7.5) },
              { label: '8.0 mph', mps: E.mphToMps(8.0) },
              { label: '9.0 mph', mps: E.mphToMps(9.0) },
              { label: '10.0 mph', mps: E.mphToMps(10.0) },
            ]
          : [
              { label: '8.0 km/h', mps: E.kmhToMps(8.0) },
              { label: '10.0 km/h', mps: E.kmhToMps(10.0) },
              { label: '11.0 km/h', mps: E.kmhToMps(11.0) },
              { label: '12.0 km/h', mps: E.kmhToMps(12.0) },
              { label: '13.0 km/h', mps: E.kmhToMps(13.0) },
              { label: '14.5 km/h', mps: E.kmhToMps(14.5) },
              { label: '16.0 km/h', mps: E.kmhToMps(16.0) },
            ];

      box.innerHTML = presets
        .map(
          (p) =>
            `<button type="button" data-preset-mps="${p.mps.toFixed(5)}" class="min-h-11 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 font-mono text-xs font-bold text-slate-200 hover:border-volt active:bg-volt active:text-slate-950">${p.label}</button>`
        )
        .join('');

      box.querySelectorAll('[data-preset-mps]').forEach((b) => {
        b.addEventListener('click', () => {
          state.mps = clampMps( parseFloat(b.dataset.presetMps) );
          renderTab1();
          renderEliteMatch();
          renderWeather();
        });
      });
    }

    // 경사도 0% ~ 15% 선택 칩 버튼 렌더링 (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15%)
    const INCLINE_CHIPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15];
    function renderInclineChips() {
      const box = $('incline-chips');
      if (!box) return;
      box.innerHTML = INCLINE_CHIPS.map((g) => {
        const active = Math.abs(state.incline - g) < 0.01;
        return `<button type="button" data-incline-chip="${g}" aria-pressed="${active}" class="min-h-11 rounded-xl border ${
          active ? 'border-volt bg-volt text-slate-950' : 'border-slate-700 bg-slate-800/90 text-slate-200'
        } px-3 py-1.5 font-mono text-xs font-extrabold">${g}%</button>`;
      }).join('');

      box.querySelectorAll('[data-incline-chip]').forEach((b) => {
        b.addEventListener('click', () => {
          state.incline = clampIncline(parseFloat(b.dataset.inclineChip));
          renderTab1();
          renderEliteMatch();
        });
      });
    }

    // Tab 1 전체 화면 업데이트
    function renderTab1(skipEl) {
      const v = state.mps;
      const inc = state.incline;
      const isMi = state.unit === 'mi';

      // 입력칸 동기화
      if (skipEl !== inMph) inMph.value = E.mpsToMph(v).toFixed(1);
      if (skipEl !== inKmh) inKmh.value = E.mpsToKmh(v).toFixed(1);
      if (skipEl !== inPaceMi) inPaceMi.value = E.formatTime(E.mpsToSecPerMile(v));
      if (skipEl !== inPaceKm) inPaceKm.value = E.formatTime(E.mpsToSecPerKm(v));
      if (skipEl !== inIncline) inIncline.value = inc.toFixed(1);
      if (skipEl !== inWeight) {
        inWeight.value = isMi ? String(Math.round(state.weightLbs)) : String(Math.round(E.lbsToKg(state.weightLbs)));
      }
      $('weight-unit-label').textContent = isMi ? 'lbs' : 'kg';

      // 주 단위 카드 하이라이트 (선택된 단위가 더 눈에 띄도록 강조)
      $('card-mph').classList.toggle('ring-2', isMi);
      $('card-mph').classList.toggle('ring-volt/70', isMi);
      $('card-kmh').classList.toggle('ring-2', !isMi);
      $('card-kmh').classList.toggle('ring-volt/70', !isMi);
      $('card-pace-mi').classList.toggle('ring-2', isMi);
      $('card-pace-mi').classList.toggle('ring-volt/70', isMi);
      $('card-pace-km').classList.toggle('ring-2', !isMi);
      $('card-pace-km').classList.toggle('ring-volt/70', !isMi);

      // 상단 대형 콘솔: 1) 현재 트레드밀 벨트 속도/페이스
      const beltPrimarySpeed = isMi ? E.mpsToMph(v).toFixed(1) : E.mpsToKmh(v).toFixed(1);
      const beltSecondarySpeed = isMi ? `${E.mpsToKmh(v).toFixed(1)} km/h` : `${E.mpsToMph(v).toFixed(1)} mph`;
      const beltPrimaryPace = isMi ? E.formatTime(E.mpsToSecPerMile(v)) : E.formatTime(E.mpsToSecPerKm(v));
      const beltSecondaryPace = isMi
        ? `${E.formatTime(E.mpsToSecPerKm(v))} /km`
        : `${E.formatTime(E.mpsToSecPerMile(v))} /mi`;

      $('big-speed').textContent = beltPrimarySpeed;
      $('big-speed-sub').textContent = beltSecondarySpeed;
      $('big-pace').textContent = beltPrimaryPace;
      $('big-pace-sub').textContent = beltSecondaryPace;
      $('big-incline-badge').textContent = `${inc.toFixed(1)}% Incline`;

      // 상단 대형 콘솔: 2) 트레드밀 속도 + 경사도(0~15%)를 반영한 평지 환산 속도 & 페이스 (GAP)
      const gapOutdoorMps = E.outdoorEquivalentMps(v, inc); // 야외 평지 환산 (1% 룰 기준)
      const gapZeroMps = E.flatZeroTreadmillMps(v, inc);   // 트레드밀 0% 평지 환산

      const gapPrimaryPace = isMi
        ? E.formatTime(E.mpsToSecPerMile(gapOutdoorMps))
        : E.formatTime(E.mpsToSecPerKm(gapOutdoorMps));
      const gapSecondaryPace = isMi
        ? `${E.formatTime(E.mpsToSecPerKm(gapOutdoorMps))} /km`
        : `${E.formatTime(E.mpsToSecPerMile(gapOutdoorMps))} /mi`;
      const gapPrimarySpeed = isMi
        ? `${E.mpsToMph(gapOutdoorMps).toFixed(1)} mph`
        : `${E.mpsToKmh(gapOutdoorMps).toFixed(1)} km/h`;
      const gapZeroSpeed = isMi
        ? `${E.mpsToMph(gapZeroMps).toFixed(1)} mph (${E.formatTime(E.mpsToSecPerMile(gapZeroMps))}/mi)`
        : `${E.mpsToKmh(gapZeroMps).toFixed(1)} km/h (${E.formatTime(E.mpsToSecPerKm(gapZeroMps))}/km)`;

      $('gap-pace').textContent = gapPrimaryPace;
      $('gap-pace-sub').textContent = gapSecondaryPace;
      $('gap-speed').textContent = gapPrimarySpeed;
      $('gap-zero-ref').textContent = gapZeroSpeed;

      // 실시간 VO2 & 칼로리 계산
      const vo2 = E.acsmRunningVO2(v, inc);
      const weightKg = E.lbsToKg(state.weightLbs);
      const cal = E.caloriesFromVO2(vo2, weightKg);

      $('stat-vo2').textContent = vo2.toFixed(1);
      $('stat-mets').textContent = `${cal.mets.toFixed(1)} METs`;
      $('stat-kcal-hr').textContent = String(Math.round(cal.kcalPerHour));
      $('stat-kcal-min').textContent = `${cal.kcalPerMin.toFixed(1)} kcal/min`;

      // 평지 환산 페이스(GAP) 기준 예상 레이스 완주 시간
      $('finish-list').innerHTML = E.RACES.map(
        (r) => `<div class="rounded-xl bg-slate-800/80 px-3 py-2">
            <dt class="text-xs text-slate-400">${r.label}</dt>
            <dd class="font-mono text-base font-bold text-slate-100 tabular-nums">${E.formatTime(r.meters / v)} <span class="text-xs font-normal text-lime-300">(GAP ${E.formatTime(r.meters / gapOutdoorMps)})</span></dd>
          </div>`
      ).join('');

      // 0% ~ 15% 전체 경사도 변환 매트릭스 표
      const tableGrades = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15];
      $('incline-target').textContent = isMi
        ? `${E.mpsToMph(v).toFixed(1)} mph (${E.formatTime(E.mpsToSecPerMile(v))}/mi)`
        : `${E.mpsToKmh(v).toFixed(1)} km/h (${E.formatTime(E.mpsToSecPerKm(v))}/km)`;

      $('incline-body').innerHTML = tableGrades
        .map((g) => {
          // 1) 현재 벨트 속도로 경사 g%를 뛸 때의 평지 환산 속도·페이스(GAP)
          const eqFlatMps = E.outdoorEquivalentMps(v, g);
          // 2) 현재 속도와 같은 힘을 들여 경사 g%를 뛰려면 맞춰야 할 벨트 속도
          const reqBeltMps = E.treadmillSpeedForOutdoor(v, g);
          const isSelected = Math.abs(inc - g) < 0.26;
          return `<tr class="border-t border-slate-800/80 ${isSelected ? 'bg-lime-400/15 text-lime-300 font-bold' : ''}">
              <th scope="row" class="py-2 pl-3 text-left font-mono">${g}%${g === 1 ? ' <span class="text-[10px] text-slate-400">(flat)</span>' : ''}</th>
              <td class="py-2 text-right font-mono tabular-nums">${
                isMi ? `${E.mpsToMph(eqFlatMps).toFixed(1)} mph` : `${E.mpsToKmh(eqFlatMps).toFixed(1)} km/h`
              }</td>
              <td class="py-2 text-right font-mono tabular-nums">${
                isMi ? E.formatTime(E.mpsToSecPerMile(eqFlatMps)) : E.formatTime(E.mpsToSecPerKm(eqFlatMps))
              }</td>
              <td class="py-2 pr-3 text-right font-mono tabular-nums text-slate-300">${
                isMi ? `${E.mpsToMph(reqBeltMps).toFixed(1)} mph` : `${E.mpsToKmh(reqBeltMps).toFixed(1)} km/h`
              }</td>
            </tr>`;
        })
        .join('');

      $('incline-warn').hidden = E.mpsToMph(v) >= 5.0;
      renderInclineChips();
      save();
    }

    // 입력칸 이벤트 연결
    function bindSpeedInput(el, toMps) {
      el.addEventListener('input', () => {
        const n = parseFloat(el.value);
        if (Number.isFinite(n) && n > 0) {
          state.mps = clampMps(toMps(n));
          renderTab1(el);
          renderEliteMatch();
          renderWeather();
        }
      });
      el.addEventListener('change', () => renderTab1());
    }
    function bindPaceInput(el, toMps) {
      el.addEventListener('input', () => {
        const sec = E.parseTime(el.value);
        if (Number.isFinite(sec) && sec >= 150 && sec <= 2400) {
          state.mps = clampMps(toMps(sec));
          renderTab1(el);
          renderEliteMatch();
          renderWeather();
        }
      });
      el.addEventListener('change', () => renderTab1());
    }
    bindSpeedInput(inMph, E.mphToMps);
    bindSpeedInput(inKmh, E.kmhToMps);
    bindPaceInput(inPaceMi, E.secPerMileToMps);
    bindPaceInput(inPaceKm, E.secPerKmToMps);

    inIncline.addEventListener('input', () => {
      const g = parseFloat(inIncline.value);
      if (Number.isFinite(g)) {
        state.incline = clampIncline(g);
        renderTab1(inIncline);
        renderEliteMatch();
      }
    });
    inIncline.addEventListener('change', () => renderTab1());

    inWeight.addEventListener('input', () => {
      const w = parseFloat(inWeight.value);
      if (Number.isFinite(w) && w > 25) {
        state.weightLbs = state.unit === 'mi' ? w : E.kgToLbs(w);
        renderTab1(inWeight);
      }
    });

    // +/- 원터치 버튼 (속도, 페이스, 경사도 0~15% 모두 지원, 길게 누르면 연속 증감)
    function applyStep(stepSpec) {
      const [kind, amtText] = stepSpec.split(':');
      const amt = Number(amtText);
      const v = state.mps;
      if (kind === 'mph') state.mps = clampMps(E.mphToMps(E.round1(E.mpsToMph(v)) + amt));
      else if (kind === 'kmh') state.mps = clampMps(E.kmhToMps(E.round1(E.mpsToKmh(v)) + amt));
      else if (kind === 'mi') state.mps = clampMps(E.secPerMileToMps(Math.round(E.mpsToSecPerMile(v)) + amt));
      else if (kind === 'km') state.mps = clampMps(E.secPerKmToMps(Math.round(E.mpsToSecPerKm(v)) + amt));
      else if (kind === 'inc') state.incline = clampIncline(state.incline + amt);

      renderTab1();
      renderEliteMatch();
      renderWeather();
    }

    document.querySelectorAll('[data-step]').forEach((btn) => {
      let holdTimer = null;
      let repeatTimer = null;
      const stop = () => {
        clearTimeout(holdTimer);
        clearInterval(repeatTimer);
      };
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        applyStep(btn.dataset.step);
        if (navigator.vibrate) navigator.vibrate(8);
        holdTimer = setTimeout(() => {
          repeatTimer = setInterval(() => applyStep(btn.dataset.step), 90);
        }, 420);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          applyStep(btn.dataset.step);
        }
      });
    });

    /* ------------------------------------------------------------------
     * 5) Tab 2: Treadmill Workouts & Elite Form Studio
     * ------------------------------------------------------------------ */
    let currentCueSteps = []; // 사용자가 직접 시간/속도/경사도를 미세 수정할 수 있는 현재 큐시트 배열

    // 사용자의 기준 입력(Easy Pace / 5K 기록 / 목표 마라톤 시간)으로부터 VDOT 산출
    function computeUserVdot() {
      if (state.wkBaseMode === 'easy') {
        const sec = E.parseTime(state.wkEasyPace);
        if (!Number.isFinite(sec) || sec < 210 || sec > 1200) return 45;
        const mps = state.unit === 'mi' ? E.secPerMileToMps(sec) : E.secPerKmToMps(sec);
        const vdot = E.vdotFromEasyMps(mps);
        return Number.isFinite(vdot) ? Math.min(85, Math.max(25, vdot)) : 45;
      }
      if (state.wkBaseMode === '5k') {
        const sec = E.parseTime(state.wk5kTime);
        const vdot = E.vdotFromRace(5000, sec);
        return Number.isFinite(vdot) ? Math.min(85, Math.max(25, vdot)) : 45;
      }
      const sec = E.parseTime(state.wkMaraTime);
      const vdot = E.vdotFromRace(42195, sec);
      return Number.isFinite(vdot) ? Math.min(85, Math.max(25, vdot)) : 45;
    }

    // 기준 입력 방식 버튼 (Easy Pace / 5K / Marathon)
    const baseModeBtns = document.querySelectorAll('[data-wk-base]');
    const wkBaseInput = $('wk-base-input');
    const wkBaseLabel = $('wk-base-label');

    function syncBaseInputUI() {
      baseModeBtns.forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.wkBase === state.wkBaseMode));
      });
      if (state.wkBaseMode === 'easy') {
        wkBaseLabel.textContent = `Your Easy Pace (${state.unit === 'mi' ? 'min/mi' : 'min/km'})`;
        wkBaseInput.value = state.wkEasyPace;
        wkBaseInput.placeholder = state.unit === 'mi' ? 'e.g. 9:00' : 'e.g. 5:35';
      } else if (state.wkBaseMode === '5k') {
        wkBaseLabel.textContent = 'Recent 5K Race Time (mm:ss)';
        wkBaseInput.value = state.wk5kTime;
        wkBaseInput.placeholder = 'e.g. 22:30';
      } else {
        wkBaseLabel.textContent = 'Goal Marathon Time (h:mm:ss)';
        wkBaseInput.value = state.wkMaraTime;
        wkBaseInput.placeholder = 'e.g. 3:45:00';
      }
    }

    baseModeBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.wkBaseMode = b.dataset.wkBase;
        syncBaseInputUI();
        renderWorkouts(true);
      });
    });

    wkBaseInput.addEventListener('input', () => {
      const val = wkBaseInput.value.trim();
      if (state.wkBaseMode === 'easy') state.wkEasyPace = val;
      else if (state.wkBaseMode === '5k') state.wk5kTime = val;
      else state.wkMaraTime = val;
      renderWorkouts(true);
    });

    // 총 운동 시간 선택 버튼 (30 / 45 / 60분)
    const durBtns = document.querySelectorAll('[data-wk-dur]');
    durBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.wkDuration = Number(b.dataset.wkDur);
        durBtns.forEach((btn) => btn.setAttribute('aria-pressed', String(Number(btn.dataset.wkDur) === state.wkDuration)));
        renderWorkouts(true);
      });
    });

    // 4대 워크아웃 종류 탭 버튼 (Interval / Cruise / Build-up / Recovery)
    const wkTypeBtns = document.querySelectorAll('[data-wk-type]');
    wkTypeBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.wkType = b.dataset.wkType;
        wkTypeBtns.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.wkType === state.wkType)));
        renderWorkouts(true);
      });
    });

    // 워크아웃 큐시트 생성 및 화면 렌더링
    // regenerate=true 이면 VDOT 기반으로 새 큐시트를 만들고, false 이면 사용자의 미세 수정값을 유지한 채 단위만 새로 표시합니다.
    function renderWorkouts(regenerate = true) {
      syncBaseInputUI();
      const vdot = computeUserVdot();
      $('wk-vdot-badge').textContent = `VDOT ${vdot.toFixed(1)}`;

      // VDOT 5대 훈련 존 요약 바 업데이트
      const zones = E.trainingZones(vdot);
      $('wk-zones-bar').innerHTML = zones
        .map((z) => {
          const spd = state.unit === 'mi' ? `${E.mpsToMph(z.midMps).toFixed(1)} mph` : `${E.mpsToKmh(z.midMps).toFixed(1)} km/h`;
          const pc = state.unit === 'mi' ? `${E.formatTime(E.mpsToSecPerMile(z.midMps))}/mi` : `${E.formatTime(E.mpsToSecPerKm(z.midMps))}/km`;
          return `<div class="min-w-0 rounded-xl bg-slate-800/90 px-1.5 py-2 text-center">
              <div class="truncate text-[11px] font-extrabold text-volt">${z.key} <span class="hidden sm:inline">· ${z.name.split(' ')[0]}</span></div>
              <div class="font-mono text-xs sm:text-sm font-bold text-slate-100 tabular-nums">${spd}</div>
              <div class="font-mono text-[10px] text-slate-400 tabular-nums">${pc}</div>
            </div>`;
        })
        .join('');

      if (regenerate || currentCueSteps.length === 0) {
        currentCueSteps = E.generateWorkout(state.wkType, state.wkDuration, vdot);
      }
      renderCueTable();
      save();
    }

    // 큐시트 표 렌더링 (사용자가 각 행의 시간, 속도, 경사도를 직접 미세 수정 가능!)
    function renderCueTable() {
      const tbody = $('wk-cue-body');
      let totalMin = 0;
      let totalMeters = 0;

      tbody.innerHTML = currentCueSteps
        .map((s, idx) => {
          totalMin += s.minutes;
          totalMeters += s.mps * s.minutes * 60;
          const mph = E.mpsToMph(s.mps).toFixed(1);
          const kmh = E.mpsToKmh(s.mps).toFixed(1);
          const primarySpeed = state.unit === 'mi' ? mph : kmh;
          const secondarySpeed = state.unit === 'mi' ? `${kmh} km/h` : `${mph} mph`;

          return `<tr class="border-t border-slate-800 align-middle">
              <td class="py-2.5 pl-3 pr-1">
                <div class="font-bold text-slate-100 text-xs sm:text-sm">${s.stage}</div>
                <div class="text-[11px] text-slate-400">${s.cue}</div>
              </td>
              <td class="py-2 px-1 text-center">
                <div class="inline-flex items-center gap-1 rounded-lg bg-slate-800 p-1">
                  <button type="button" data-edit-idx="${idx}" data-edit-field="min" data-edit-delta="-1" aria-label="Decrease stage ${idx + 1} minutes" class="h-7 w-7 rounded bg-slate-700 font-bold text-slate-200 active:bg-volt active:text-slate-950">−</button>
                  <span class="w-8 font-mono text-xs font-bold tabular-nums">${s.minutes}m</span>
                  <button type="button" data-edit-idx="${idx}" data-edit-field="min" data-edit-delta="1" aria-label="Increase stage ${idx + 1} minutes" class="h-7 w-7 rounded bg-slate-700 font-bold text-slate-200 active:bg-volt active:text-slate-950">+</button>
                </div>
              </td>
              <td class="py-2 px-1 text-center">
                <div class="inline-flex items-center gap-1 rounded-lg bg-slate-800 p-1">
                  <button type="button" data-edit-idx="${idx}" data-edit-field="spd" data-edit-delta="-0.1" aria-label="Decrease stage ${idx + 1} speed" class="h-7 w-7 rounded bg-slate-700 font-bold text-slate-200 active:bg-volt active:text-slate-950">−</button>
                  <span class="w-12 font-mono text-xs font-extrabold text-volt tabular-nums">${primarySpeed}</span>
                  <button type="button" data-edit-idx="${idx}" data-edit-field="spd" data-edit-delta="0.1" aria-label="Increase stage ${idx + 1} speed" class="h-7 w-7 rounded bg-slate-700 font-bold text-slate-200 active:bg-volt active:text-slate-950">+</button>
                </div>
                <div class="font-mono text-[10px] text-slate-400 tabular-nums mt-0.5">${secondarySpeed}</div>
              </td>
              <td class="py-2 px-1 text-center">
                <div class="inline-flex items-center gap-1 rounded-lg bg-slate-800 p-1">
                  <button type="button" data-edit-idx="${idx}" data-edit-field="inc" data-edit-delta="-0.5" aria-label="Decrease stage ${idx + 1} incline" class="h-7 w-7 rounded bg-slate-700 font-bold text-slate-200 active:bg-volt active:text-slate-950">−</button>
                  <span class="w-9 font-mono text-xs font-bold tabular-nums">${s.incline.toFixed(1)}%</span>
                  <button type="button" data-edit-idx="${idx}" data-edit-field="inc" data-edit-delta="0.5" aria-label="Increase stage ${idx + 1} incline" class="h-7 w-7 rounded bg-slate-700 font-bold text-slate-200 active:bg-volt active:text-slate-950">+</button>
                </div>
              </td>
              <td class="py-2 pr-3 pl-1 text-right text-xs font-semibold text-lime-300">${s.hrZone}</td>
            </tr>`;
        })
        .join('');

      // 큐시트 총 요약 업데이트
      const distVal = state.unit === 'mi' ? (totalMeters / E.METERS_PER_MILE).toFixed(2) + ' mi' : (totalMeters / 1000).toFixed(2) + ' km';
      $('wk-summary-time').textContent = `${totalMin} min`;
      $('wk-summary-dist').textContent = distVal;

      // 미세 수정 버튼 이벤트 연결
      tbody.querySelectorAll('[data-edit-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.editIdx);
          const field = btn.dataset.editField;
          const delta = Number(btn.dataset.editDelta);
          const item = currentCueSteps[idx];
          if (!item) return;
          if (field === 'min') {
            item.minutes = Math.min(60, Math.max(1, item.minutes + delta));
          } else if (field === 'spd') {
            if (state.unit === 'mi') {
              item.mps = clampMps(E.mphToMps(E.round1(E.mpsToMph(item.mps)) + delta));
            } else {
              item.mps = clampMps(E.kmhToMps(E.round1(E.mpsToKmh(item.mps)) + delta));
            }
          } else if (field === 'inc') {
            item.incline = clampIncline(item.incline + delta);
          }
          renderCueTable();
        });
      });
    }

    $('wk-reset-btn').addEventListener('click', () => renderWorkouts(true));

    /* ------------------------------------------------------------------
     * 6) 인터랙티브 트레드밀 콘솔 타이머 (Workout Cue Player)
     * ------------------------------------------------------------------ */
    let timerId = null;
    let timerRunning = false;
    let activeStepIdx = 0;
    let stepRemainSec = 0;
    let wakeLockSentinel = null;

    // Web Audio API 비프음 (외부 오디오 파일 없이도 구간 전환 알림음 재생)
    function playBeep(freq = 880, durationMs = 180) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.value = 0.15;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, durationMs);
      } catch (_) {}
    }

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator && !wakeLockSentinel) {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
        }
      } catch (_) {}
    }

    function updateConsoleDisplay() {
      const box = $('console-player');
      if (!currentCueSteps.length) return;
      const step = currentCueSteps[activeStepIdx] || currentCueSteps[0];
      const nextStep = currentCueSteps[activeStepIdx + 1];
      const isMi = state.unit === 'mi';

      $('con-stage-name').textContent = `${activeStepIdx + 1}/${currentCueSteps.length} · ${step.stage}`;
      $('con-timer').textContent = E.formatTime(stepRemainSec);
      $('con-speed').textContent = isMi
        ? `${E.mpsToMph(step.mps).toFixed(1)} MPH`
        : `${E.mpsToKmh(step.mps).toFixed(1)} km/h`;
      $('con-incline').textContent = `${step.incline.toFixed(1)}%`;
      $('con-cue').textContent = step.cue;
      $('con-next').textContent = nextStep
        ? `Next: ${nextStep.stage} (${
            isMi ? `${E.mpsToMph(nextStep.mps).toFixed(1)} mph` : `${E.mpsToKmh(nextStep.mps).toFixed(1)} km/h`
          } @ ${nextStep.incline.toFixed(1)}%)`
        : 'Final stage — Cool down & finish!';
      $('con-toggle-btn').textContent = timerRunning ? '⏸ Pause' : '▶ Resume';
      box.hidden = false;
    }

    function startConsoleWorkout() {
      if (!currentCueSteps.length) return;
      activeStepIdx = 0;
      stepRemainSec = currentCueSteps[0].minutes * 60;
      timerRunning = true;
      requestWakeLock();
      playBeep(880, 160);
      updateConsoleDisplay();
      $('console-player').scrollIntoView({ behavior: 'smooth', block: 'center' });

      clearInterval(timerId);
      timerId = setInterval(() => {
        if (!timerRunning) return;
        stepRemainSec -= 1;
        if (stepRemainSec === 3 || stepRemainSec === 2 || stepRemainSec === 1) {
          playBeep(660, 100);
        }
        if (stepRemainSec <= 0) {
          playBeep(1046, 280);
          if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
          activeStepIdx += 1;
          if (activeStepIdx >= currentCueSteps.length) {
            timerRunning = false;
            clearInterval(timerId);
            $('con-stage-name').textContent = 'Workout Complete!';
            $('con-timer').textContent = '0:00';
            $('con-toggle-btn').textContent = '▶ Restart';
            return;
          }
          stepRemainSec = currentCueSteps[activeStepIdx].minutes * 60;
        }
        updateConsoleDisplay();
      }, 1000);
    }

    $('wk-start-console-btn').addEventListener('click', startConsoleWorkout);
    $('con-toggle-btn').addEventListener('click', () => {
      if (activeStepIdx >= currentCueSteps.length) {
        startConsoleWorkout();
        return;
      }
      timerRunning = !timerRunning;
      updateConsoleDisplay();
    });
    $('con-next-btn').addEventListener('click', () => {
      if (activeStepIdx + 1 < currentCueSteps.length) {
        activeStepIdx += 1;
        stepRemainSec = currentCueSteps[activeStepIdx].minutes * 60;
        playBeep(880, 120);
        updateConsoleDisplay();
      }
    });

    /* ------------------------------------------------------------------
     * 7) Elite Runner Form by Speed 매칭 카드 렌더링
     * ------------------------------------------------------------------ */
    function renderEliteMatch() {
      const mph = E.mpsToMph(state.mps);
      const inc = state.incline;
      const matchedKey = E.matchEliteRunner(mph, inc);
      const matchedRunner = E.ELITE_RUNNERS.find((r) => r.key === matchedKey) || E.ELITE_RUNNERS[1];

      $('elite-current-speed').textContent =
        state.unit === 'mi'
          ? `${mph.toFixed(1)} MPH @ ${inc.toFixed(1)}%`
          : `${E.mpsToKmh(state.mps).toFixed(1)} km/h @ ${inc.toFixed(1)}%`;
      $('elite-matched-name').textContent = matchedRunner.name;

      $('elite-cards-grid').innerHTML = E.ELITE_RUNNERS.map((r) => {
        const isMatch = r.key === matchedKey;
        return `<article class="rounded-2xl border p-4 transition ${
          isMatch
            ? 'border-volt bg-gradient-to-b from-lime-400/15 to-slate-900 ring-1 ring-volt'
            : 'border-slate-800 bg-slate-900/90'
        }">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-base font-extrabold text-slate-100">${r.name}</h3>
                <p class="text-xs font-semibold text-slate-400">${r.title}</p>
              </div>
              <span class="rounded-full px-2.5 py-1 font-mono text-xs font-bold ${
                isMatch ? 'bg-volt text-slate-950' : 'bg-slate-800 text-slate-300'
              }">${isMatch ? '★ MATCHED FOR YOUR SPEED' : r.speedRangeMph}</span>
            </div>

            <dl class="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <div class="rounded-xl bg-slate-950/80 p-2.5">
                <dt class="text-slate-400">Cadence</dt>
                <dd class="mt-0.5 font-mono font-bold text-lime-300">${r.cadence}</dd>
              </div>
              <div class="rounded-xl bg-slate-950/80 p-2.5">
                <dt class="text-slate-400">Foot Strike</dt>
                <dd class="mt-0.5 font-semibold text-slate-200">${r.footStrike}</dd>
              </div>
              <div class="rounded-xl bg-slate-950/80 p-2.5">
                <dt class="text-slate-400">Upper Body &amp; Angle</dt>
                <dd class="mt-0.5 font-semibold text-slate-200">${r.upperBody}</dd>
              </div>
            </dl>

            <p class="mt-3 text-xs leading-relaxed text-slate-300">${r.biomechanics}</p>
            <p class="mt-2 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-semibold text-volt">
              Coach Cue: “${r.coachCue}”
            </p>

            <div class="mt-3">
              <!-- 🔒 대표님 보안 규칙: 모든 외부 유튜브 링크에 target="_blank" rel="noopener noreferrer" 필수 적용 -->
              <a
                href="${r.ytUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-extrabold text-slate-100 hover:bg-volt hover:text-slate-950"
              >
                <span>▶ Watch ${r.name} Slow-Motion Form Analysis (YouTube)</span>
              </a>
            </div>
          </article>`;
      }).join('');
    }

    /* ------------------------------------------------------------------
     * 8) Tab 3: Weather (기온·이슬점·습도·풍속) & MAF 180 계산기
     * ------------------------------------------------------------------ */
    const inTemp = $('in-temp');
    const inDew = $('in-dew');
    const inRh = $('in-rh');
    const inWind = $('in-wind');
    const windDirSel = $('wind-dir');
    const inMafAge = $('in-maf-age');
    const mafModSel = $('maf-mod');

    inTemp.value = state.tempVal;
    inDew.value = state.dewVal;
    inRh.value = state.rhVal;
    inWind.value = state.windVal;
    windDirSel.value = state.windDir;
    inMafAge.value = state.mafAge;
    mafModSel.value = state.mafMod;

    // 기온 단위(°F / °C) 전환 버튼
    const tempUnitBtns = document.querySelectorAll('[data-temp-unit]');
    tempUnitBtns.forEach((b) => {
      b.addEventListener('click', () => {
        const next = b.dataset.tempUnit;
        if (next === state.tempUnit) return;
        const conv = next === 'C' ? E.fToC : E.cToF;
        [inTemp, inDew].forEach((el) => {
          const n = parseFloat(el.value);
          if (Number.isFinite(n)) el.value = String(Math.round(conv(n)));
        });
        state.tempUnit = next;
        state.tempVal = inTemp.value;
        state.dewVal = inDew.value;
        renderWeather();
      });
    });

    // 이슬점 직접 입력 vs 상대습도(%) 입력 전환
    const humidModeBtns = document.querySelectorAll('[data-humid-mode]');
    humidModeBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.humidMode = b.dataset.humidMode;
        renderWeather();
      });
    });

    function renderWeather() {
      tempUnitBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tempUnit === state.tempUnit)));
      humidModeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.humidMode === state.humidMode)));
      document.querySelectorAll('.temp-unit-label').forEach((el) => (el.textContent = `°${state.tempUnit}`));
      $('wind-unit-label').textContent = state.unit === 'mi' ? 'MPH' : 'km/h';

      $('dew-input-wrap').hidden = state.humidMode !== 'dew';
      $('rh-input-wrap').hidden = state.humidMode !== 'rh';

      state.tempVal = inTemp.value.trim();
      state.dewVal = inDew.value.trim();
      state.rhVal = inRh.value.trim();
      state.windVal = inWind.value.trim();
      state.windDir = windDirSel.value;

      const tRaw = parseFloat(state.tempVal);
      const tC = state.tempUnit === 'C' ? tRaw : E.fToC(tRaw);
      const tF = state.tempUnit === 'F' ? tRaw : E.cToF(tRaw);

      let dF = NaN;
      if (state.humidMode === 'dew') {
        const dRaw = parseFloat(state.dewVal);
        dF = state.tempUnit === 'F' ? dRaw : E.cToF(dRaw);
      } else {
        const rh = parseFloat(state.rhVal);
        if (Number.isFinite(tC) && Number.isFinite(rh)) {
          const dC = E.dewPointFromTempRhC(tC, rh);
          dF = E.cToF(dC);
        }
      }

      const err = $('dew-error');
      const out = $('dew-out');
      if (!Number.isFinite(tF) || !Number.isFinite(dF)) {
        out.hidden = true;
        err.hidden = true;
      } else if (dF > tF + 0.5) {
        out.hidden = true;
        err.hidden = false;
      } else {
        err.hidden = true;
        out.hidden = false;
        const heatAdj = E.dewPointAdjustment(tF, dF);
        const wRaw = parseFloat(state.windVal) || 0;
        const windMps = state.unit === 'mi' ? E.mphToMps(wRaw) : E.kmhToMps(wRaw);
        const windPct = E.windAdjustmentPct(state.mps, windMps, state.windDir);

        const totalSlowPct = Math.max(-8, heatAdj.mid + windPct);
        const baseSec = state.unit === 'mi' ? E.mpsToSecPerMile(state.mps) : E.mpsToSecPerKm(state.mps);
        const adjSec = baseSec * (1 + totalSlowPct / 100);
        const unitSuffix = state.unit === 'mi' ? '/mi' : '/km';

        $('dew-sum').textContent = `${heatAdj.sum} (T+DP °F)`;
        $('dew-pct').textContent = `${heatAdj.lo}–${heatAdj.hi}%`;
        $('wind-pct').textContent = `${windPct >= 0 ? '+' : ''}${windPct.toFixed(1)}%`;
        $('dew-note').textContent = heatAdj.note;
        $('dew-pace').textContent = `${E.formatTime(adjSec)}${unitSuffix}`;
        $('dew-base-ref').textContent = `Baseline: ${E.formatTime(baseSec)}${unitSuffix} (${
          state.unit === 'mi' ? `${E.mpsToMph(state.mps).toFixed(1)} mph` : `${E.mpsToKmh(state.mps).toFixed(1)} km/h`
        })`;
      }

      // MAF 180 계산기 업데이트
      state.mafAge = inMafAge.value.trim();
      state.mafMod = mafModSel.value;
      const maf = E.calculateMaf(state.mafAge, state.mafMod);
      $('maf-target-hr').textContent = `${maf.mafMax} bpm`;
      $('maf-zone-range').textContent = maf.rangeText;

      // MAF 권장 트레드밀 속도 (현재 VDOT의 Easy 하단 속도)
      const vdot = computeUserVdot();
      const easyZone = E.trainingZones(vdot)[0];
      const mafMps = E.treadmillSpeedForOutdoor(easyZone.slowMps, 1.0);
      $('maf-rec-speed').textContent =
        state.unit === 'mi'
          ? `${E.mpsToMph(mafMps).toFixed(1)} MPH (${E.formatTime(E.mpsToSecPerMile(mafMps))}/mi) @ 1.0%`
          : `${E.mpsToKmh(mafMps).toFixed(1)} km/h (${E.formatTime(E.mpsToSecPerKm(mafMps))}/km) @ 1.0%`;

      save();
    }

    [inTemp, inDew, inRh, inWind, windDirSel, inMafAge, mafModSel].forEach((el) => {
      el.addEventListener('input', renderWeather);
      el.addEventListener('change', renderWeather);
    });

    /* ------------------------------------------------------------------
     * 9) Tab 4: Marathon Pace Band (5K / 10K / Half / Full)
     * ------------------------------------------------------------------ */
    const pbRaceSel = $('pb-race');
    const pbTimeIn = $('pb-time');
    const pbStratSel = $('pb-strategy');

    pbRaceSel.value = state.pbRace;
    pbTimeIn.value = state.pbTime;
    pbStratSel.value = state.pbStrategy;

    // 종목 변경 시 기본 목표 시간 추천값 세팅 (비어 있거나 종목 바꿀 때 편리하도록)
    pbRaceSel.addEventListener('change', () => {
      state.pbRace = pbRaceSel.value;
      const sampleTimes = { '5k': '22:30', '10k': '46:00', half: '1:40:00', full: '3:30:00' };
      pbTimeIn.value = sampleTimes[state.pbRace] || '3:30:00';
      state.pbTime = pbTimeIn.value;
      renderPaceBand();
    });
    pbTimeIn.addEventListener('input', () => {
      state.pbTime = pbTimeIn.value.trim();
      renderPaceBand();
    });
    pbStratSel.addEventListener('change', () => {
      state.pbStrategy = pbStratSel.value;
      renderPaceBand();
    });

    function renderPaceBand() {
      const race = E.RACES.find((r) => r.key === state.pbRace) || E.RACES[3];
      const sec = E.parseTime(state.pbTime);
      const err = $('pb-error');
      const tableWrap = $('pb-table-wrap');

      const minValidSec = race.meters / 7.0;
      if (!Number.isFinite(sec) || sec < minValidSec || sec > 10 * 3600) {
        err.hidden = false;
        tableWrap.hidden = true;
        return;
      }
      err.hidden = true;
      tableWrap.hidden = false;

      const avgMps = race.meters / sec;
      const isMi = state.unit === 'mi';
      $('pb-summary-pace').textContent = isMi
        ? `${E.formatTime(E.mpsToSecPerMile(avgMps))} /mi`
        : `${E.formatTime(E.mpsToSecPerKm(avgMps))} /km`;
      $('pb-summary-speed').textContent = isMi
        ? `${E.mpsToMph(avgMps).toFixed(1)} MPH`
        : `${E.mpsToKmh(avgMps).toFixed(1)} km/h`;

      const splits = E.generatePaceBand(race.meters, sec, state.unit, state.pbStrategy);
      $('pb-body').innerHTML = splits
        .map(
          (s) => `<tr class="border-t border-slate-800">
              <th scope="row" class="py-2 pl-3 text-left font-mono text-xs font-bold text-slate-200">${s.label}</th>
              <td class="py-2 text-right font-mono text-xs tabular-nums text-volt font-bold">${s.splitPace}</td>
              <td class="py-2 text-right font-mono text-xs tabular-nums font-semibold text-slate-100">${s.elapsedTime}</td>
              <td class="py-2 pr-3 text-right font-mono text-xs tabular-nums text-slate-400">${
                isMi ? `${s.mph} mph` : `${s.kmh} km/h`
              }</td>
            </tr>`
        )
        .join('');
      save();
    }

    // 페이스 밴드 모바일 텍스트/CSV 저장 & 인쇄 버튼
    $('pb-print-btn').addEventListener('click', () => window.print());
    $('pb-download-btn').addEventListener('click', () => {
      const race = E.RACES.find((r) => r.key === state.pbRace) || E.RACES[3];
      const sec = E.parseTime(state.pbTime);
      if (!Number.isFinite(sec)) return;
      const splits = E.generatePaceBand(race.meters, sec, state.unit, state.pbStrategy);
      const header = `RunPaceStudio Pace Band — ${race.label} (${E.formatTime(sec)}, ${state.pbStrategy} split)\nSplit\tPace\tElapsed\tTreadmill\n`;
      const lines = splits.map((s) => `${s.label}\t${s.splitPace}\t${s.elapsedTime}\t${state.unit === 'mi' ? s.mph + ' mph' : s.kmh + ' km/h'}`).join('\n');
      const blob = new Blob([header + lines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RunPaceStudio-${race.key}-paceband.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });

    /* ------------------------------------------------------------------
     * 10) 크루 공유(Share Link + 내장 QR 코드 모달) & PWA 설치
     * ------------------------------------------------------------------ */
    const shareModal = $('share-modal');
    const shareUrlInput = $('share-url-input');
    const shareCopyMsg = $('share-copy-msg');

    function buildShareUrl() {
      const u = new URL(window.location.href.split('?')[0]);
      u.searchParams.set('unit', state.unit);
      u.searchParams.set('mph', E.mpsToMph(state.mps).toFixed(1));
      u.searchParams.set('inc', state.incline.toFixed(1));
      return u.toString();
    }

    function openShareModal() {
      const url = buildShareUrl();
      shareUrlInput.value = url;
      $('qr-container').innerHTML = QRCode.toSvg(url);
      shareCopyMsg.hidden = true;
      shareModal.hidden = false;
    }

    document.querySelectorAll('[data-open-share]').forEach((btn) => {
      btn.addEventListener('click', openShareModal);
    });
    $('share-close-btn').addEventListener('click', () => {
      shareModal.hidden = true;
    });
    $('share-copy-btn').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareUrlInput.value);
        shareCopyMsg.textContent = '✓ Link copied to clipboard!';
        shareCopyMsg.hidden = false;
      } catch (_) {
        shareUrlInput.select();
      }
    });
    $('share-native-btn').addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'RunPaceStudio — My Treadmill Pace & Workout Setup',
            text: `Treadmill ${E.mpsToMph(state.mps).toFixed(1)} MPH @ ${state.incline.toFixed(1)}% incline`,
            url: shareUrlInput.value,
          });
        } catch (_) {}
      } else {
        $('share-copy-btn').click();
      }
    });

    // PWA 홈 화면 설치 버튼
    let deferredPrompt = null;
    const installBtn = $('install-btn');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.hidden = false;
    });
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.hidden = true;
    });

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // ---- 초기 화면 렌더링 실행 ----
    setUnit(state.unit);
    renderWorkouts(true);
    renderEliteMatch();
    renderWeather();
    renderPaceBand();
    $('year').textContent = String(new Date().getFullYear());
  });
}
