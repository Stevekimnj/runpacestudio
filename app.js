/* =====================================================================
 * RunPaceStudio — app.js (v2.1 한/영 이중언어 & 통합 업그레이드)
 * ---------------------------------------------------------------------
 * 이 파일은 크게 4부분으로 나뉩니다.
 *   [1부] I18N     : 영어(en) ↔ 한국어(ko) 원터치 전환을 위한 이중언어 사전
 *   [2부] Engine   : 화면(DOM)과 독립된 순수 스포츠 과학 계산 엔진
 *                    - MILE(MPH, min/mi) ↔ KM(km/h, min/km) 양방향 변환
 *                    - 트레드밀 경사도(0% ~ 15%) ↔ 야외 평지 환산 속도·페이스(GAP)
 *                    - ACSM VO2 대사 방정식 & 실시간 칼로리 소모량 계산
 *                    - Jack Daniels VDOT & 4대 트레드밀 워크아웃 큐시트 생성기
 *                    - 속도별 엘리트 러너(Dauwalter, Kipchoge, Ingebrigtsen, Bekele) 주법 매칭
 *                    - 기온·이슬점(습도)·풍속 야외 페이스 보정기 & MAF 180 심박수 계산기
 *                    - 5K / 10K / 하프 / 풀 마라톤 구간별 페이스 밴드 생성기
 *   [3부] QRCode   : 외부 서버나 외부 라이브러리 없이 100% 브라우저 내부에서
 *                    실제 스캔 가능한 표준 QR 코드(SVG)를 그리는 보안 내장 모듈
 *   [4부] UI       : 4대 메인 탭, 원터치 EN↔한국어 & MILE↔KM 변환, 큐시트 미세 수정,
 *                    인터랙티브 트레드밀 콘솔 타이머, 인쇄·저장·공유 화면 로직
 * ===================================================================== */

'use strict';

/* =====================================================================
 * [1부] I18N — 한/영 이중언어 사전 데이터
 * ===================================================================== */
const I18N = {
  en: {
    shareBtn: 'Share / QR',
    installBtn: 'Install',
    tab1Nav: 'Incline & Pace',
    tab2Nav: 'Workouts & Form',
    tab3Nav: 'Weather & MAF',
    tab4Nav: 'Pace Band',
    t1Title: 'Incline & Pace Converter',
    t1Sub: 'Treadmill Speed & Incline (0–15%) ↔ Flat Ground Equivalent Pace (GAP) + Real-time VO₂ & Calories',
    beltHeader: 'Treadmill Belt',
    gapHeader: 'Flat Ground Equivalent (GAP)',
    gapBadge: 'Speed + Incline',
    flatSpeedLabel: 'Flat Outdoor Speed',
    zeroWindLabel: '0% Zero-Wind Belt Equiv:',
    presetTitle: 'Quick Speed Presets',
    presetHint: 'Tap to set belt speed',
    inclineLabel: 'Treadmill Incline Grade (0% – 15%)',
    inclineRuleHint: '1.0% = Outdoor Flat (Jones & Doust)',
    lblMph: 'Treadmill Speed (MPH)',
    badgeUs: 'US Default',
    lblPaceMi: 'Pace per Mile (min:sec /mi)',
    lblKmh: 'Treadmill Speed (km/h)',
    badgeMetric: 'Metric',
    lblPaceKm: 'Pace per KM (min:sec /km)',
    vo2Title: 'Real-Time Metabolic VO₂ & Calorie Burn',
    vo2Sub: 'ACSM Running Equation (Speed + 0–15% Grade)',
    weightLabel: 'Body Weight:',
    oxygenCostLbl: 'Oxygen Cost (VO₂)',
    energyBurnLbl: 'Estimated Energy Burn',
    finishTitle: 'Projected Race Finish Times (Belt vs. Flat GAP)',
    matrixTitle: '0% – 15% Incline Conversion Matrix',
    matrixDesc1: 'At your current belt setting',
    matrixDesc2: 'see the flat-ground equivalent speed & GAP at each grade, or the belt speed needed to match that effort.',
    thIncline: 'Incline',
    thFlatSpd: 'Flat Equiv Speed',
    thFlatGap: 'Flat GAP',
    thBeltSame: 'Belt for Same Effort',
    inclineWarn:
      'Note: Below ~5.0 mph (8.0 km/h) biomechanics shift from running to walking/power-hiking; ACSM running equations are shown as a continuous reference.',
    t2Title: 'Treadmill Workouts & Elite Form Studio',
    t2Sub: 'Auto-generate editable 30/45/60-min cue sheets & match your speed to elite biomechanics.',
    wkStep1Title: 'Step 1 · Set Your Baseline & Total Workout Time',
    btnEasyPace: 'Easy Pace',
    btn5kTime: '5K Time',
    btnGoalMara: 'Goal Marathon',
    wkDurLabel: 'Total Workout Duration',
    wkStep2Title: 'Step 2 · Choose Your Workout Protocol',
    wkBtn1Title: '① Interval',
    wkBtn1Sub: 'VO₂max I-Pace & Jog',
    wkBtn2Title: '② Cruise Run',
    wkBtn2Sub: 'Daniels T-Pace Threshold',
    wkBtn3Title: '③ Build-up',
    wkBtn3Sub: '4-Stage Progression',
    wkBtn4Title: '④ Recovery/MAF',
    wkBtn4Sub: 'Low-HR Aerobic Base',
    wkTotalLbl: 'Total:',
    wkDistLbl: 'Est. Distance:',
    wkEditHint: '(Use −/+ in table to fine-tune any stage)',
    wkResetBtn: 'Reset',
    wkStartBtn: '▶ Start Console Timer',
    wakeLockBadge: 'Screen Wake-Lock Active',
    conTimeLeft: 'Time Left',
    conSetSpeed: 'Set Speed',
    conSetIncline: 'Set Incline',
    thStageCue: 'Stage & Coaching Cue',
    thMin: 'Min',
    thSpeedDual: 'Speed (MPH & km/h)',
    thHrZone: 'Target HR Zone',
    eliteStudioTitle: 'Elite Runner Form by Speed Studio',
    eliteMatchedSub: 'Matched to your current treadmill setting',
    t3Title: 'Weather, Wind & MAF 180 Adjuster',
    t3Sub:
      'Calculate heat, humidity (dew point), and headwind/tailwind pace adjustments plus your Maffetone MAF 180 heart-rate ceiling.',
    weatherCardTitle: 'Heat, Dew Point & Wind Pace Adjuster',
    btnEnterDew: 'Enter Dew Point',
    btnEnterRh: 'Enter Relative Humidity (%)',
    lblTemp: 'Temperature',
    lblDew: 'Dew Point',
    lblRh: 'Humidity (%)',
    lblWind: 'Wind',
    lblWindDir: 'Wind Direction',
    optHeadwind: 'Headwind (Against)',
    optTailwind: 'Tailwind (Behind)',
    optCrosswind: 'Crosswind (Side)',
    dewErrorMsg:
      'Dew point cannot exceed air temperature. Please lower the dew point or switch to Relative Humidity (%).',
    dtHeatSum: 'Heat Index Sum',
    dtHeatSlow: 'Heat Slowdown',
    dtWindEff: 'Wind Effect',
    dtThermStatus: 'Thermal Status',
    dtAdjPace: 'Weather-Adjusted Outdoor Target Pace (Equal Effort)',
    mafCardTitle: 'MAF 180 Aerobic Heart Rate Calculator',
    mafCardSub:
      'Build fat-burning mitochondrial density and prevent overtraining syndrome by capping aerobic runs at your MAF ceiling.',
    lblMafAge: 'Your Age (Years)',
    lblMafMod: 'Health & Training Modifier',
    mafOpt1: '−10 · Recovering from major illness, surgery, or on regular medication',
    mafOpt2: '−5 · Injured, >2 colds/yr, allergies/asthma, or beginner/returning',
    mafOpt3: '0 · Consistently training 4x/wk for 1–2 years without injury',
    mafOpt4: '+5 · Competing >2 years injury-free with improving race results',
    dtMafCeiling: 'MAF Ceiling HR',
    dtMafZone: 'MAF Aerobic Zone',
    dtMafStart: 'Suggested Treadmill Start',
    t4Title: 'Marathon & Race Pace Band',
    t4Sub:
      'Generate mile or kilometer splits for 5K, 10K, Half, or Full Marathon—save to phone, print wristband, or share QR.',
    lblPbRace: 'Race Distance',
    optRace5k: '5K (3.11 mi / 5 km)',
    optRace10k: '10K (6.21 mi / 10 km)',
    optRaceHalf: 'Half Marathon (13.11 mi / 21.1 km)',
    optRaceFull: 'Full Marathon (26.22 mi / 42.2 km)',
    lblPbTime: 'Goal Finish Time (Auto : format — e.g. 2000 → 20:00)',
    lblPbStrat: 'Pacing Strategy',
    optStratEven: 'Even Splits (Metronomic)',
    optStratNeg: 'Negative Split (Faster 2nd Half)',
    optStratCons: 'Conservative Start (Bank Cushion)',
    pbAvgPaceLbl: 'Required Avg Pace:',
    pbAvgSpdLbl: 'Avg Treadmill:',
    pbSaveBtn: '⬇ Save (.txt)',
    pbPrintBtn: '🖨 Print Band',
    pbErrorMsg: 'Please enter a realistic finish time for this race distance (e.g. 3:30:00 or 22:30).',
    thSplit: 'Split',
    thSplitPace: 'Split Pace',
    thElapsed: 'Elapsed Time',
    thTmSpd: 'Treadmill Speed',
    footerTagline: 'Built for marathoners & treadmill athletes.',
    navAbout: 'About Us',
    navPrivacy: 'Privacy Policy',
    navContact: 'Contact',
    footerDisclaimer:
      'Disclaimer: RunPaceStudio provides sports-science estimates for educational and training purposes only and does not constitute medical advice. Always consult a qualified physician or certified coach before starting a high-intensity exercise program. All settings are stored locally on your device.',
    shareModalTitle: 'Share with Running Crew',
    shareModalSub: 'Scan QR code with any phone camera or copy your exact speed & incline link.',
    btnCopyLink: 'Copy Link',
    btnSharePhone: 'Share via Phone',
    copiedMsg: '✓ Link copied to clipboard!',
  },
  ko: {
    shareBtn: '공유 / QR',
    installBtn: '앱 설치',
    tab1Nav: '경사도·페이스',
    tab2Nav: '훈련·엘리트주법',
    tab3Nav: '날씨·MAF심박',
    tab4Nav: '페이스 밴드',
    t1Title: '트레드밀 경사도(0–15%) & 평지 페이스 변환기',
    t1Sub: '트레드밀 속도·경사도(0~15%) ↔ 야외 평지 환산 페이스(GAP) + 실시간 VO₂ 및 칼로리 계산',
    beltHeader: '현재 트레드밀 세팅',
    gapHeader: '야외 평지 환산 페이스 (GAP)',
    gapBadge: '속도 + 경사도 반영',
    flatSpeedLabel: '야외 평지 환산 속도',
    zeroWindLabel: '트레드밀 0% 무풍 환산:',
    presetTitle: '원터치 속도 프리셋',
    presetHint: '버튼을 누르면 속도가 바로 적용됩니다',
    inclineLabel: '트레드밀 경사도 선택 (0% – 15%)',
    inclineRuleHint: '1.0% 경사 = 야외 평지 (Jones & Doust 논문)',
    lblMph: '트레드밀 속도 (MPH · 마일)',
    badgeUs: '미국 기본',
    lblPaceMi: '1마일당 페이스 (분:초 /mi)',
    lblKmh: '트레드밀 속도 (km/h · 킬로미터)',
    badgeMetric: '한국/미터법',
    lblPaceKm: '1km당 페이스 (분:초 /km)',
    vo2Title: '실시간 산소섭취량(VO₂) & 소모 칼로리',
    vo2Sub: 'ACSM 달리기 대사 방정식 (속도 + 0~15% 경사 반영)',
    weightLabel: '나의 체중:',
    oxygenCostLbl: '산소 소모량 (VO₂)',
    energyBurnLbl: '예상 에너지 소모량',
    finishTitle: '이 속도로 달릴 때 거리별 예상 완주 시간 (벨트 vs 평지 GAP)',
    matrixTitle: '0% – 15% 경사도별 평지 환산 매트릭스 표',
    matrixDesc1: '현재 벨트 속도',
    matrixDesc2: '기준, 각 경사도(0~15%)에서 달릴 때의 야외 평지 환산 속도·페이스(GAP)와 동일 부하 벨트 속도입니다.',
    thIncline: '경사도',
    thFlatSpd: '평지 환산 속도',
    thFlatGap: '평지 환산 페이스',
    thBeltSame: '동일 부하 벨트속도',
    inclineWarn:
      '참고: 약 5.0 mph (8.0 km/h) 미만은 달리기에서 파워워킹 주법으로 전환되는 구간이므로 ACSM 달리기 공식 값을 참고용으로만 활용하세요.',
    t2Title: '트레드밀 4대 워크아웃 & 엘리트 주법 스튜디오',
    t2Sub: '30/45/60분 맞춤형 시간표(큐시트) 자동 생성·미세 수정 & 속도별 엘리트 러너 자세 분석',
    wkStep1Title: 'Step 1 · 나의 기준 기록 & 총 운동 시간 선택',
    btnEasyPace: '평소 조깅 페이스',
    btn5kTime: '5K 기록',
    btnGoalMara: '목표 마라톤 시간',
    wkDurLabel: '총 운동 시간 선택',
    wkStep2Title: 'Step 2 · 4대 훈련 프로그램 선택',
    wkBtn1Title: '① 인터벌 트레이닝',
    wkBtn1Sub: 'VO₂max 고강도 & 회복 조깅',
    wkBtn2Title: '② 크루즈 러닝',
    wkBtn2Sub: '다니엘스 T-페이스 역치 훈련',
    wkBtn3Title: '③ 빌드업 런',
    wkBtn3Sub: '4단계 점진 가속 프로그램',
    wkBtn4Title: '④ 리커버리/MAF',
    wkBtn4Sub: '부상 방지 저심박 유산소',
    wkTotalLbl: '총 시간:',
    wkDistLbl: '예상 거리:',
    wkEditHint: '(표의 −/+ 버튼으로 시간·속도·경사를 직접 수정할 수 있습니다)',
    wkResetBtn: '초기화',
    wkStartBtn: '▶ 트레드밀 콘솔 타이머 시작',
    wakeLockBadge: '화면 꺼짐 방지 작동 중',
    conTimeLeft: '남은 시간',
    conSetSpeed: '목표 벨트 속도',
    conSetIncline: '목표 경사도',
    thStageCue: '구간 & 코칭 포인트',
    thMin: '시간(분)',
    thSpeedDual: '트레드밀 속도 (MPH & km/h)',
    thHrZone: '목표 심박존',
    eliteStudioTitle: '속도별 엘리트 러너 주법 매칭 스튜디오',
    eliteMatchedSub: '현재 트레드밀 세팅에 매칭된 롤모델',
    t3Title: '날씨·바람 페이스 보정기 & MAF 180 계산기',
    t3Sub: '기온·습도(이슬점)·풍속에 따른 야외 페이스 보정 및 필 마페톤 박사의 MAF 180 최대 유산소 심박수 계산',
    weatherCardTitle: '기온 · 이슬점(습도) · 풍속 야외 페이스 보정',
    btnEnterDew: '이슬점 직접 입력',
    btnEnterRh: '상대습도(%)로 입력',
    lblTemp: '기온',
    lblDew: '이슬점',
    lblRh: '상대습도 (%)',
    lblWind: '풍속',
    lblWindDir: '바람 방향',
    optHeadwind: '맞바람 (앞에서 불어옴)',
    optTailwind: '뒷바람 (뒤에서 밀어줌)',
    optCrosswind: '측풍 (옆에서 불어옴)',
    dewErrorMsg: '이슬점은 기온보다 높을 수 없습니다. 이슬점을 낮추거나 상대습도(%) 입력 모드로 전환해 주세요.',
    dtHeatSum: '열지수 합산',
    dtHeatSlow: '더위 감속률',
    dtWindEff: '바람 영향',
    dtThermStatus: '컨디션 상태',
    dtAdjPace: '날씨·바람 반영 야외 목표 페이스 (동일 체감 강도)',
    mafCardTitle: 'MAF 180 유산소 심박수 계산기',
    mafCardSub:
      '오버트레이닝과 부상을 예방하고 지방 대사·미토콘드리아 능력을 극대화하는 개인별 최대 에어로빅 심박수입니다.',
    lblMafAge: '만 나이 (세)',
    lblMafMod: '건강 및 훈련 상태 보정',
    mafOpt1: '−10 · 큰 질병/수술 회복 중이거나 정기 복용 약물이 있는 경우',
    mafOpt2: '−5 · 부상 회복 중, 연 2회 이상 감기, 알레르기/천식, 입문자/휴식 후 복귀',
    mafOpt3: '0 · 지난 1~2년간 큰 부상 없이 주 4회 이상 꾸준히 훈련 중',
    mafOpt4: '+5 · 2년 이상 부상 없이 경쟁적으로 훈련하며 기록이 향상 중인 러너',
    dtMafCeiling: 'MAF 상한 심박수',
    dtMafZone: '권장 MAF 에어로빅 존',
    dtMafStart: '권장 트레드밀 시작 속도',
    t4Title: '마라톤 & 레이스 구간별 페이스 밴드',
    t4Sub: '5K, 10K, 하프, 풀 마라톤의 마일(mi) 또는 킬로미터(km) 구간별 통과 시간표 생성 · 저장 · 인쇄 · QR 공유',
    lblPbRace: '레이스 종목',
    optRace5k: '5K (3.11 mi / 5 km)',
    optRace10k: '10K (6.21 mi / 10 km)',
    optRaceHalf: '하프 마라톤 (13.11 mi / 21.1 km)',
    optRaceFull: '풀 마라톤 (26.22 mi / 42.195 km)',
    lblPbTime: '목표 완주 시간 (숫자만 쳐도 자동 : 변환 · 예: 2000 → 20:00)',
    lblPbStrat: '레이스 운영 전략',
    optStratEven: '이븐 스플릿 (전 구간 일정 페이스)',
    optStratNeg: '네거티브 스플릿 (후반 가속형)',
    optStratCons: '초반 안전 출발 (첫 20% 여유 후 정속)',
    pbAvgPaceLbl: '목표 평균 페이스:',
    pbAvgSpdLbl: '평균 트레드밀 속도:',
    pbSaveBtn: '⬇ 파일 저장 (.txt)',
    pbPrintBtn: '🖨 페이스밴드 인쇄',
    pbErrorMsg: '선택한 종목에 맞는 현실적인 완주 시간을 입력해 주세요 (예: 3:30:00 또는 22:30).',
    thSplit: '구간',
    thSplitPace: '구간 페이스',
    thElapsed: '누적 통과 시간',
    thTmSpd: '트레드밀 속도',
    footerTagline: '마라토너와 트레드밀 러너를 위한 스포츠 과학 유틸리티.',
    navAbout: '서비스 소개',
    navPrivacy: '개인정보처리방침',
    navContact: '문의하기',
    footerDisclaimer:
      '면책 고지: RunPaceStudio는 교육 및 훈련 참고를 위한 스포츠 과학 추정치를 제공하며 의학적 진단을 대신하지 않습니다. 고강도 운동 시작 전 전문의 또는 코치와 상담하세요. 모든 설정값은 사용자의 기기에만 안전하게 저장됩니다.',
    shareModalTitle: '러닝 크루 & 친구에게 공유하기',
    shareModalSub: '스마트폰 카메라로 QR 코드를 스캔하거나 링크를 복사해 현재 속도와 경사도 세팅을 공유하세요.',
    btnCopyLink: '링크 복사하기',
    btnSharePhone: '휴대폰 공유 창 열기',
    copiedMsg: '✓ 클립보드에 링크가 복사되었습니다!',
  },
};

/* =====================================================================
 * [2부] Engine — 순수 스포츠 과학 계산 함수 모음
 * ===================================================================== */
const Engine = (() => {
  const METERS_PER_MILE = 1609.344;
  const METERS_PER_KM = 1000;
  const LBS_PER_KG = 2.20462262;

  const mphToMps = (mph) => (mph * METERS_PER_MILE) / 3600;
  const mpsToMph = (mps) => (mps * 3600) / METERS_PER_MILE;
  const kmhToMps = (kmh) => (kmh * METERS_PER_KM) / 3600;
  const mpsToKmh = (mps) => (mps * 3600) / METERS_PER_KM;

  const secPerMileToMps = (sec) => METERS_PER_MILE / sec;
  const mpsToSecPerMile = (mps) => METERS_PER_MILE / mps;
  const secPerKmToMps = (sec) => METERS_PER_KM / sec;
  const mpsToSecPerKm = (mps) => METERS_PER_KM / mps;

  const lbsToKg = (lbs) => lbs / LBS_PER_KG;
  const kgToLbs = (kg) => kg * LBS_PER_KG;
  const round1 = (x) => Math.round(x * 10) / 10;

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
      if (t.length <= 2) return Number(t) * 60;
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

  // ---- 경사도(0~15%) ↔ 야외 평지 환산(GAP) 및 대사/칼로리 ----------
  function acsmRunningVO2(mps, gradePct) {
    const v = Math.max(0, mps) * 60;
    const g = Math.max(0, gradePct) / 100;
    return 0.2 * v + 0.9 * v * g + 3.5;
  }

  function caloriesFromVO2(vo2, weightKg) {
    const w = Number.isFinite(weightKg) && weightKg > 20 ? weightKg : 70;
    const kcalPerMin = ((vo2 * w) / 1000) * 5;
    return {
      kcalPerMin,
      kcalPerHour: kcalPerMin * 60,
      mets: vo2 / 3.5,
    };
  }

  const OUTDOOR_EQUIV_GRADE = 1.0;

  function outdoorEquivalentMps(treadmillMps, gradePct) {
    const refFactor = 0.2 + 0.9 * (OUTDOOR_EQUIV_GRADE / 100);
    const gradeFactor = 0.2 + 0.9 * (Math.max(0, gradePct) / 100);
    return (treadmillMps * gradeFactor) / refFactor;
  }

  function flatZeroTreadmillMps(treadmillMps, gradePct) {
    const gradeFactor = 0.2 + 0.9 * (Math.max(0, gradePct) / 100);
    return (treadmillMps * gradeFactor) / 0.2;
  }

  function treadmillSpeedForOutdoor(outdoorMps, gradePct) {
    const refFactor = 0.2 + 0.9 * (OUTDOOR_EQUIV_GRADE / 100);
    const gradeFactor = 0.2 + 0.9 * (Math.max(0, gradePct) / 100);
    return (outdoorMps * refFactor) / gradeFactor;
  }

  // ---- Jack Daniels VDOT & 훈련 존 계산 --------------------------
  const danielsVO2 = (vMpm) => -4.6 + 0.182258 * vMpm + 0.000104 * vMpm * vMpm;
  const danielsPctMax = (tMin) =>
    0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin);

  function vdotFromRace(distanceM, timeSec) {
    if (!(distanceM > 0) || !(timeSec > 0)) return NaN;
    const tMin = timeSec / 60;
    const vMpm = distanceM / tMin;
    return danielsVO2(vMpm) / danielsPctMax(tMin);
  }

  function vdotFromEasyMps(easyMps) {
    if (!(easyMps > 0)) return NaN;
    const vMpm = easyMps * 60;
    return danielsVO2(vMpm) / 0.67;
  }

  function mpsForVO2(vo2) {
    const a = 0.000104;
    const b = 0.182258;
    const c = -(4.6 + vo2);
    const vMpm = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    return vMpm / 60;
  }

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

  const ZONES = [
    { key: 'E', name: 'Easy / Recovery', nameKo: '조깅', lo: 0.59, hi: 0.74, hrZone: 'Zone 2 (65–78% HRmax)', purpose: 'Aerobic base & capillary density' },
    { key: 'M', name: 'Marathon Pace', nameKo: '마라톤', lo: null, hi: null, hrZone: 'Zone 3 (80–85% HRmax)', purpose: 'Race-specific glycogen efficiency' },
    { key: 'T', name: 'Threshold (Cruise)', nameKo: '역치', lo: 0.88, hi: 0.88, hrZone: 'Zone 4 (88–92% HRmax)', purpose: 'Lactate clearance stamina' },
    { key: 'I', name: 'Interval (VO₂max)', nameKo: '인터벌', lo: 0.975, hi: 0.975, hrZone: 'Zone 5 (95–100% HRmax)', purpose: 'Maximal aerobic power' },
    { key: 'R', name: 'Repetition (Speed)', nameKo: '스피드', lo: 1.07, hi: 1.07, hrZone: 'Anaerobic (N/A)', purpose: 'Neuromuscular economy & form' },
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

  // ---- Tab 2: 4대 트레드밀 워크아웃 큐시트 생성기 (한/영 코칭 큐 모두 포함) ----
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
    const add = (stage, stageKo, minutes, mps, incline, hrZone, cue, cueKo) => {
      steps.push({
        id: steps.length + 1,
        stage,
        stageKo,
        minutes: Number(minutes),
        mps: mphToMps(round1(mpsToMph(treadmillSpeedForOutdoor(mps, incline)))),
        incline: Number(incline),
        hrZone,
        cue,
        cueKo,
      });
    };

    if (type === 'interval') {
      const wu = dur === 30 ? 6 : 10;
      const reps = dur === 30 ? 4 : dur === 45 ? 5 : 8;
      const cd = dur === 30 ? 4 : 10;

      add(
        'Warm-up Jog',
        '워밍업 조깅',
        wu,
        easyLow,
        1.0,
        'Zone 2 (65–75%)',
        'Start easy. Let synovial fluid warm the joints; relax shoulders.',
        '천천히 시작하세요. 어깨의 긴장을 풀고 발목·무릎 관절을 부드럽게 예열합니다.'
      );
      for (let r = 1; r <= reps; r++) {
        add(
          `VO₂max Work #${r}/${reps}`,
          `VO₂max 인터벌 질주 #${r}/${reps}`,
          3,
          iPace,
          1.0,
          'Zone 5 (95–100%)',
          'Drive knees, 190+ spm turnover, gaze straight ahead—do not look down at feet.',
          '무릎을 앞으로 힘차게 차올리고 190+ 케이던스를 유지하세요. 시선은 정면을 봅니다.'
        );
        add(
          `Recovery Jog #${r}/${reps}`,
          `회복 조깅 #${r}/${reps}`,
          2,
          easyLow * 0.92,
          0.5,
          'Zone 1–2 (<72%)',
          'Deep belly breaths. Shake out arms and hands before the next rep.',
          '깊은 복식 호흡으로 심박수를 낮추고 팔과 손목의 힘을 툭툭 털어주세요.'
        );
      }
      add(
        'Cool-down Jog',
        '쿨다운 마무리 조깅',
        cd,
        easyLow,
        0.5,
        'Zone 1–2 (60–70%)',
        'Gradually bring heart rate down; keep cadence light.',
        '가벼운 발걸음으로 호흡과 심박수를 천천히 안정시킵니다.'
      );
    } else if (type === 'cruise') {
      const config =
        dur === 30
          ? { wu: 5, reps: 3, work: 6, rest: 1, cd: 4 }
          : dur === 45
          ? { wu: 8, reps: 4, work: 7, rest: 1, cd: 5 }
          : { wu: 10, reps: 5, work: 8, rest: 1, cd: 5 };

      add(
        'Warm-up Aerobic',
        '워밍업 에어로빅 조깅',
        config.wu,
        easyMid,
        1.0,
        'Zone 2 (68–75%)',
        'Find your rhythm; mid-foot contact directly under hips.',
        '편안한 리듬을 찾으며 발이 몸통(골반) 바로 아래에 착지하도록 집중하세요.'
      );
      for (let r = 1; r <= config.reps; r++) {
        add(
          `Cruise T-Pace #${r}/${config.reps}`,
          `크루즈 역치(T-Pace) #${r}/${config.reps}`,
          config.work,
          tPace,
          1.0,
          'Zone 4 (88–92%)',
          'Comfortably hard! Smooth Norwegian-style threshold rhythm—zero upper-body tension.',
          '기분 좋게 힘든(Comfortably hard) 역치 리듬! 상체 힘을 빼고 일정한 호흡을 유지하세요.'
        );
        add(
          `Float Recovery #${r}/${config.reps}`,
          `짧은 회복 조깅 #${r}/${config.reps}`,
          config.rest,
          easyLow,
          1.0,
          'Zone 2 (70–75%)',
          'Short 60-sec float jog to clear lactate while keeping aerobic enzymes active.',
          '60초 짧은 조깅으로 유산소 효소 활성은 유지하면서 혈중 젖산을 빠르게 제거합니다.'
        );
      }
      add(
        'Cool-down Easy',
        '쿨다운 조깅',
        config.cd,
        easyLow,
        0.5,
        'Zone 1–2 (<70%)',
        'Easy spin-down; hydrate immediately after stepping off.',
        '편안하게 마무리하고 트레드밀에서 내려온 직후 수분을 보충하세요.'
      );
    } else if (type === 'buildup') {
      const blocks =
        dur === 30 ? [5, 7, 7, 6, 5] : dur === 45 ? [8, 10, 10, 10, 7] : [10, 14, 14, 12, 10];

      add(
        'Stage 1 · Easy Warm-up',
        '1단계 · 워밍업 조깅',
        blocks[0],
        easyLow,
        1.0,
        'Zone 2 (65–72%)',
        'Patient start. Let muscles warm up naturally without forcing stride length.',
        '여유 있게 출발하세요. 억지로 보폭을 넓히지 말고 근육이 자연스럽게 풀리게 합니다.'
      );
      add(
        'Stage 2 · Steady Aerobic',
        '2단계 · 스테디 유산소 런',
        blocks[1],
        easyHigh,
        1.0,
        'Zone 2–3 (74–80%)',
        'Settle into a 180 spm rhythm; 3–5° forward lean from the ankles.',
        '180 spm 리듬에 안착하며 허리가 아닌 발목부터 3~5° 앞으로 살짝 기울이세요.'
      );
      add(
        'Stage 3 · Marathon Pace',
        '3단계 · 마라톤 레이스 페이스',
        blocks[2],
        mPace,
        1.0,
        'Zone 3 (80–85%)',
        'Kipchoge-style race rhythm—compact 90° arm swing, quiet head.',
        '킵초게 스타일의 레이스 리듬! 팔꿈치는 90°로 간결하게 흔들고 머리의 상하 흔들림을 줄이세요.'
      );
      add(
        'Stage 4 · Threshold Finish',
        '4단계 · 역치(T-Pace) 피니시',
        blocks[3],
        tPace,
        1.5,
        'Zone 4 (88–92%)',
        'Strong finish! Slight 1.5% grade recruits glutes while protecting hamstrings.',
        '강한 피니시! 1.5% 경사가 햄스트링 과부하를 막아주면서 둔근(엉덩이 근육)을 강하게 동원합니다.'
      );
      add(
        'Cool-down Jog',
        '쿨다운 조깅',
        blocks[4],
        easyLow,
        0.5,
        'Zone 1–2 (<70%)',
        'Gentle flush-out jog. Celebrate a textbook negative-split progression!',
        '정석적인 빌드업 완주를 축하합니다! 가벼운 조깅으로 다리 피로를 풀어주세요.'
      );
    } else {
      const blocks =
        dur === 30 ? [5, 10, 10, 5] : dur === 45 ? [5, 18, 15, 7] : [6, 24, 22, 8];

      add(
        'Gentle Warm-up',
        '부드러운 워밍업',
        blocks[0],
        easyLow * 0.9,
        0.5,
        'Zone 1 (60–65%)',
        'Ultra-easy transition from rest to movement. Nose-breathing check.',
        '코로만 숨을 쉴 수 있을 정도로 아주 편안하게 움직임을 시작합니다.'
      );
      add(
        'MAF Aerobic Block 1',
        'MAF 저심박 유산소 1구간',
        blocks[1],
        easyLow,
        1.0,
        'MAF Zone (68–73%)',
        'Strict low heart rate. If HR drifts up, drop speed by 0.2 mph immediately.',
        '목표 MAF 심박수를 엄격히 지킵니다. 심박수가 오르면 속도를 0.2 mph 낮추세요.'
      );
      add(
        'MAF Incline Posture Block 2',
        'MAF 경사 밸런스 2구간',
        blocks[2],
        easyLow * 0.98,
        1.5,
        'MAF Zone (70–75%)',
        'Slight 1.5% grade reduces impact shock on knees while keeping aerobic load steady.',
        '1.5% 약한 경사로 무릎 착지 충격을 줄이면서 유산소 자극을 일정하게 이어갑니다.'
      );
      add(
        'Recovery Cool-down',
        '리커버리 쿨다운',
        blocks[3],
        easyLow * 0.88,
        0.0,
        'Zone 1 (<65%)',
        'Finish feeling fresher than when you started.',
        '운동을 시작할 때보다 몸이 더 개운하고 가벼운 상태로 마무리합니다.'
      );
    }

    return steps;
  }

  // ---- Tab 2: 속도별 엘리트 러너 주법 매칭 데이터 (한/영 완비) ---------
  const ELITE_RUNNERS = [
    {
      key: 'dauwalter',
      name: 'Courtney Dauwalter',
      nameKo: '코트니 도월터 (Courtney Dauwalter)',
      title: 'Ultra & Incline Efficiency Master',
      titleKo: '울트라마라톤 & 고경사 러닝의 여제',
      speedRangeMph: '4.5 – 7.4 MPH (or Incline ≥ 6%)',
      speedRangeKo: '4.5 – 7.4 MPH (또는 경사도 6% 이상)',
      minMph: 0,
      maxMph: 7.45,
      cadence: '168–176 spm (short, rhythmic steps)',
      cadenceKo: '168–176 spm (짧고 리드미컬한 보폭)',
      footStrike: 'Soft midfoot landing directly under hips; zero braking force',
      footStrikeKo: '골반 바로 아래 부드러운 미드풋 착지 (브레이크 저항 제로)',
      upperBody: '6–10° ankle lean on grades; ultra-relaxed low shoulders & loose hands',
      upperBodyKo: '경사 구간 발목부터 6–10° 전경사 · 어깨와 손목의 완전한 이완',
      biomechanics:
        'At recovery speeds or steep treadmill grades (6–15%), long strides waste hip-flexor energy. Dauwalter keeps ground contact smooth with short, piston-like steps and transitions seamlessly to power-hiking on extreme inclines.',
      biomechanicsKo:
        '리커버리 저속 구간이나 6~15% 오르막 경사에서 보폭을 길게 뻗으면 고관절과 허벅지 앞쪽이 금방 지칩니다. 도월터는 피스톤처럼 짧고 빠른 스텝으로 골반 바로 아래에 착지하며 상체 긴장을 완전히 빼서 에너지 소모를 최소화합니다.',
      coachCue: 'Shorten your stride as incline rises—keep effort conversational and arms swinging low.',
      coachCueKo: '경사가 높아질수록 보폭을 짧게 줄이고, 팔을 낮고 편안하게 흔들며 일정한 호흡을 유지하세요.',
      ytUrl: 'https://www.youtube.com/results?search_query=Courtney+Dauwalter+running+form+slow+motion+analysis',
    },
    {
      key: 'kipchoge',
      name: 'Eliud Kipchoge',
      nameKo: '엘리우드 킵초게 (Eliud Kipchoge)',
      title: 'Marathon GOAT (1:59:40 Rhythm)',
      titleKo: '마라톤 역사상 최고의 러너 (1:59:40 주법)',
      speedRangeMph: '7.5 – 9.2 MPH (Marathon & Build-up Zone)',
      speedRangeKo: '7.5 – 9.2 MPH (마라톤 & 빌드업 구간)',
      minMph: 7.45,
      maxMph: 9.25,
      cadence: '180–185 spm (metronomic consistency)',
      cadenceKo: '180–185 spm (메트로놈처럼 일정한 리듬)',
      footStrike: 'Balanced midfoot strike 2–3 cm ahead of center of mass',
      footStrikeKo: '무게중심 바로 아래 균형 잡힌 미드풋(중족부) 착지',
      upperBody: '3–5° whole-body forward lean from ankles; level chin, 90° elbow angle',
      upperBodyKo: '발목부터 시작되는 3–5° 전경사 · 시선 수평 · 90° 간결한 팔치기',
      biomechanics:
        'Kipchoge maximizes elastic recoil from the Achilles tendon while minimizing vertical oscillation (~6.5 cm). His wrists graze the ribcage without crossing the chest midline, saving up to 3% metabolic energy over 26.2 miles.',
      biomechanicsKo:
        '킵초게는 상하 수직 움직임(약 6.5cm)을 최소화하고 아킬레스건의 탄성 반발력을 극대화합니다. 주먹이 가슴 중앙선을 넘지 않고 갈비뼈 옆을 스치듯 뒤로 뻗어주어 42.195km 동안 약 3%의 대사 에너지를 절약합니다.',
      coachCue: 'Run tall with a slight ankle lean, relax your facial muscles, and let the belt roll behind you.',
      coachCueKo: '키가 커진 느낌으로 서서 발목부터 살짝 기울이고, 얼굴과 어깨 힘을 뺀 채 벨트를 뒤로 밀어내세요.',
      ytUrl: 'https://www.youtube.com/results?search_query=Eliud+Kipchoge+running+form+biomechanics+slow+motion',
    },
    {
      key: 'ingebrigtsen',
      name: 'Jakob Ingebrigtsen',
      nameKo: '야콥 잉게브리그센 (Jakob Ingebrigtsen)',
      title: 'Norwegian Threshold & Cruise Specialist',
      titleKo: '노르웨이식 더블 스레숄드(역치)의 정점',
      speedRangeMph: '9.3 – 10.8 MPH (Threshold / Cruise Zone)',
      speedRangeKo: '9.3 – 10.8 MPH (크루즈 & 젖산 역치 구간)',
      minMph: 9.25,
      maxMph: 10.85,
      cadence: '184–192 spm (high leg stiffness)',
      cadenceKo: '184–192 spm (높은 다리 스프링 탄성)',
      footStrike: 'Crisp midfoot-to-forefoot strike with sub-180ms ground contact',
      footStrikeKo: '180ms 미만의 짧은 지면 접촉 · 경쾌한 미드/포어풋 착지',
      upperBody: '4–6° forward lean; locked neutral pelvis & rock-solid core',
      upperBodyKo: '4–6° 전경사 · 흔들림 없는 중립 골반과 단단한 코어 고정',
      biomechanics:
        'Built on Norwegian double-threshold training, Ingebrigtsen maintains exceptional running economy at lactate threshold by keeping pelvic tilt neutral and using stiff ankle springs rather than over-pushing with the quads.',
      biomechanicsKo:
        '노르웨이식 역치 훈련의 상징인 잉게브리그센은 골반이 앞뒤로 무너지지 않게 코어를 잡아주고, 허벅지 근육으로 억지로 밀기보다 단단한 발목 스프링 반동을 이용해 젖산 역치 속도에서 최고의 러닝 이코노미를 보여줍니다.',
      coachCue: 'Stabilize your pelvis, pop off the belt quickly, and match your breathing to a 2-in / 2-out cadence.',
      coachCueKo: '골반과 복부를 단단히 고정하고 지면을 짧고 탄력 있게 튕겨내며 2박자 들숨·2박자 날숨 리듬을 타세요.',
      ytUrl: 'https://www.youtube.com/results?search_query=Jakob+Ingebrigtsen+running+form+threshold+slow+motion',
    },
    {
      key: 'bekele',
      name: 'Kenenisa Bekele',
      nameKo: '케네니사 베켈레 (Kenenisa Bekele)',
      title: 'VO₂max Interval & Track Legend',
      titleKo: 'VO₂max 인터벌 & 트랙 황제',
      speedRangeMph: '10.9+ MPH (VO₂max Interval & Speed Zone)',
      speedRangeKo: '10.9+ MPH (고강도 VO₂max 인터벌 & 스피드 구간)',
      minMph: 10.85,
      maxMph: 99,
      cadence: '190–204 spm (explosive turnover)',
      cadenceKo: '190–204 spm (폭발적인 고케이던스 회전)',
      footStrike: 'Active forefoot/midfoot paw-back with powerful triple extension',
      footStrikeKo: '지면이 닿기 직전 뒤로 채는 포어/미드풋 착지 & 강력한 고관절 신전',
      upperBody: '5–7° dynamic forward lean; high heel recovery & strong backward elbow drive',
      upperBodyKo: '5–7° 역동적 전경사 · 높은 뒷발 리커버리 & 강력한 팔꿈치 드라이브',
      biomechanics:
        'At high treadmill speeds (10.9+ MPH), speed comes from hip-extensor power and rapid hamstring folding (heel close to glutes during swing phase), shortening the leg lever so it swings forward effortlessly.',
      biomechanicsKo:
        '10.9 MPH 이상의 고속 인터벌에서는 지면을 박찬 뒤 발뒤꿈치가 엉덩이 가까이 높게 접혀 올라오는 힐 리커버리(Heel Recovery)가 핵심입니다. 다리 지렛대가 짧아져 적은 힘으로도 무릎이 총알처럼 앞으로 당겨집니다.',
      coachCue: 'Drive knees forward, snap heels high toward glutes, and punch elbows straight back.',
      coachCueKo: '무릎을 앞으로 강하게 당기고, 뒷발을 엉덩이 쪽으로 빠르게 접어 올리며 팔꿈치를 뒤로 강하게 치세요.',
      ytUrl: 'https://www.youtube.com/results?search_query=Kenenisa+Bekele+running+form+slow+motion+biomechanics',
    },
  ];

  function matchEliteRunner(mph, gradePct = 1) {
    if (gradePct >= 6 && mph < 8.5) return 'dauwalter';
    const found = ELITE_RUNNERS.find((r) => mph >= r.minMph && mph < r.maxMph);
    return found ? found.key : 'kipchoge';
  }

  // ---- Tab 3: 날씨(기온·이슬점·습도·풍속) & MAF 180 계산 ------------
  const fToC = (f) => ((f - 32) * 5) / 9;
  const cToF = (c) => (c * 9) / 5 + 32;

  function dewPointFromTempRhC(tempC, rhPct) {
    const rh = Math.min(100, Math.max(1, rhPct));
    const a = 17.625;
    const b = 243.04;
    const alpha = Math.log(rh / 100) + (a * tempC) / (b + tempC);
    return (b * alpha) / (a - alpha);
  }

  const DEW_TABLE = [
    { max: 100, lo: 0, hi: 0, note: 'Ideal — 100% normal pace', noteKo: '최적 날씨 — 평상시 100% 페이스' },
    { max: 110, lo: 0, hi: 0.5, note: 'Prime conditions', noteKo: '달리기 아주 좋은 쾌적한 상태' },
    { max: 120, lo: 0.5, hi: 1.0, note: 'Slight warmth', noteKo: '약간 따뜻함 — 영향 미미' },
    { max: 130, lo: 1.0, hi: 2.0, note: 'Noticeable humidity', noteKo: '습도 체감 시작 — 수분 보충' },
    { max: 140, lo: 2.0, hi: 3.0, note: 'Moderate heat load', noteKo: '중간 열부하 — 페이스 2~3% 감속' },
    { max: 150, lo: 3.0, hi: 4.5, note: 'Hard — hydrate & electrolytes', noteKo: '무더움 — 전해질·수분 필수' },
    { max: 160, lo: 4.5, hi: 6.0, note: 'Very hard — shorten intervals', noteKo: '매우 무더움 — 고강도 훈련 단축' },
    { max: 170, lo: 6.0, hi: 8.0, note: 'Severe heat stress — move indoors', noteKo: '심각한 열스트레스 — 실내 권장' },
    { max: 180, lo: 8.0, hi: 10.0, note: 'Dangerous — easy jog or treadmill only', noteKo: '위험 — 가벼운 조깅/트레드밀 전환' },
  ];

  function dewPointAdjustment(tempF, dewF) {
    const sum = Math.round(tempF + dewF);
    const row = DEW_TABLE.find((r) => sum <= r.max);
    if (!row) {
      return {
        sum,
        lo: 10,
        hi: 12,
        mid: 11,
        note: 'Extreme heat — move workout to treadmill!',
        noteKo: '극심한 폭염 — 실내 트레드밀 훈련 권장!',
        notRecommended: true,
      };
    }
    return {
      sum,
      lo: row.lo,
      hi: row.hi,
      mid: (row.lo + row.hi) / 2,
      note: row.note,
      noteKo: row.noteKo,
      notRecommended: false,
    };
  }

  function windAdjustmentPct(runnerMps, windMps, direction = 'head') {
    if (!(runnerMps > 0) || !(windMps > 0)) return 0;
    const baseVO2 = acsmRunningVO2(runnerMps, 1.0) - 3.5;
    const dragDrag = 0.015 * windMps * windMps + 0.018 * runnerMps * windMps;
    const rawPct = (dragDrag / Math.max(10, baseVO2)) * 100;
    if (direction === 'head') return Math.min(25, rawPct);
    if (direction === 'tail') return -Math.min(12, rawPct * 0.5);
    return Math.min(10, rawPct * 0.25);
  }

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

  // ---- Tab 4: 마라톤 페이스 밴드 스플릿 생성기 --------------------
  const RACES = [
    { key: '5k', label: '5K', labelKo: '5K', meters: 5000 },
    { key: '10k', label: '10K', labelKo: '10K', meters: 10000 },
    { key: 'half', label: 'Half Marathon', labelKo: '하프 마라톤', meters: 21097.5 },
    { key: 'full', label: 'Full Marathon', labelKo: '풀 마라톤', meters: 42195 },
  ];

  function generatePaceBand(distanceM, targetSec, unit = 'mi', strategy = 'even', lang = 'en') {
    if (!(distanceM > 0) || !(targetSec > 0)) return [];
    const unitMeters = unit === 'km' ? METERS_PER_KM : METERS_PER_MILE;
    const totalUnits = distanceM / unitMeters;
    const fullCount = Math.floor(totalUnits);
    const remainder = totalUnits - fullCount;

    const segments = [];
    for (let i = 1; i <= fullCount; i++) {
      segments.push({ index: i, label: `${i} ${unit}`, distFrac: 1, cumUnits: i });
    }
    if (remainder > 0.01) {
      const finWord = lang === 'ko' ? '피니시' : 'Finish';
      segments.push({
        index: fullCount + 1,
        label: `${finWord} (${totalUnits.toFixed(2)} ${unit})`,
        distFrac: remainder,
        cumUnits: totalUnits,
      });
    }

    const n = segments.length;
    const rawWeights = segments.map((seg, idx) => {
      const progress = idx / Math.max(1, n - 1);
      let paceFactor = 1.0;
      if (strategy === 'negative') {
        paceFactor = 1.018 - 0.036 * progress;
      } else if (strategy === 'conservative') {
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
 * [3부] QRCode — 외부 서버/스크립트 없이 작동하는 순수 내장 QR 생성기
 * ===================================================================== */
const QRCode = (() => {
  const VERSIONS = [
    null,
    { ver: 1, size: 21, total: 26, ecc: 7, maxBytes: 17, align: [] },
    { ver: 2, size: 25, total: 44, ecc: 10, maxBytes: 32, align: [6, 18] },
    { ver: 3, size: 29, total: 70, ecc: 15, maxBytes: 53, align: [6, 22] },
    { ver: 4, size: 33, total: 100, ecc: 20, maxBytes: 78, align: [6, 26] },
    { ver: 5, size: 37, total: 134, ecc: 26, maxBytes: 106, align: [6, 30] },
    { ver: 6, size: 41, total: 172, ecc: 36, maxBytes: 134, align: [6, 34] },
  ];

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

  function toSvg(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    const vInfo = VERSIONS.slice(1, 6).find((v) => bytes.length <= v.maxBytes) || VERSIONS[5];
    const payload = bytes.slice(0, vInfo.maxBytes);
    const dataLen = vInfo.total - vInfo.ecc;

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

    const N = vInfo.size;
    const grid = Array.from({ length: N }, () => new Uint8Array(N));
    const reserved = Array.from({ length: N }, () => new Uint8Array(N));

    const setModule = (r, c, val, isFunc = true) => {
      if (r < 0 || r >= N || c < 0 || c >= N) return;
      grid[r][c] = val ? 1 : 0;
      if (isFunc) reserved[r][c] = 1;
    };

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

    if (vInfo.align.length) {
      const [, a1] = vInfo.align;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const on = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setModule(a1 + dr, a1 + dc, on, true);
        }
      }
    }

    for (let i = 8; i < N - 8; i++) {
      setModule(6, i, i % 2 === 0, true);
      setModule(i, 6, i % 2 === 0, true);
    }

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
            if ((r + c) % 2 === 0) bit ^= 1;
            grid[r][c] = bit;
          }
        }
      }
      upward = !upward;
    }

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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ...Engine, Engine, QRCode, I18N };
}

/* =====================================================================
 * [4부] UI — 브라우저 화면 제어 로직 (EN ↔ 한국어 완벽 연동)
 * ===================================================================== */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const E = Engine;
    const $ = (id) => document.getElementById(id);

    const STORE_KEY = 'rps.v2';
    const defaults = {
      lang: 'en',            // 'en' (기본 영어) | 'ko' (한국어)
      unit: 'mi',            // 'mi' (기본 MPH & min/mi) | 'km' (km/h & min/km)
      mps: E.mphToMps(7.5),
      incline: 1.0,
      weightLbs: 154,
      wkBaseMode: 'easy',
      wkEasyPace: '9:00',
      wk5kTime: '22:30',
      wkMaraTime: '3:45:00',
      wkDuration: 45,
      wkType: 'interval',
      tempUnit: 'F',
      humidMode: 'dew',
      tempVal: '78',
      dewVal: '65',
      rhVal: '65',
      windVal: '10',
      windDir: 'head',
      mafAge: '35',
      mafMod: '0',
      pbRace: 'full',
      pbTime: '3:30:00',
      pbStrategy: 'even',
    };

    let state = { ...defaults };
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      if (saved.lang === 'ko' || saved.lang === 'en') state.lang = saved.lang;
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
    } catch (_) {}

    // URL 공유 파라미터(?lang=ko&mph=8.0&inc=2&unit=mi 등)가 있으면 우선 적용
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('lang') === 'ko' || params.get('lang') === 'en') state.lang = params.get('lang');
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
    const clampIncline = (g) => Math.min(15, Math.max(0, Math.round(g * 2) / 2));

    /* ------------------------------------------------------------------
     * 메인 탭 전환 (Tab 1 ~ Tab 4)
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
     * 🌐 EN ↔ 한국어 언어 전환 스위치
     * ------------------------------------------------------------------ */
    const langToggleBtns = document.querySelectorAll('[data-lang-toggle]');
    function setLang(nextLang) {
      state.lang = nextLang === 'ko' ? 'ko' : 'en';
      document.documentElement.lang = state.lang;
      langToggleBtns.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.langToggle === state.lang));
      });

      const dict = I18N[state.lang] || I18N.en;
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        if (dict[key]) el.textContent = dict[key];
      });

      // 한국어 선택 시 하단 한국어 핵심 가이드 박스 표시
      const koGuide = $('ko-guide-summary');
      if (koGuide) koGuide.hidden = state.lang !== 'ko';

      renderTab1();
      renderWorkouts(false);
      renderEliteMatch();
      renderWeather();
      renderPaceBand();
      save();
    }
    langToggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.langToggle));
    });

    /* ------------------------------------------------------------------
     * MILE (MPH) ↔ KM (km/h) 원터치 전역 변환 버튼
     * ------------------------------------------------------------------ */
    const unitToggleBtns = document.querySelectorAll('[data-unit-toggle]');
    function setUnit(nextUnit) {
      state.unit = nextUnit === 'km' ? 'km' : 'mi';
      unitToggleBtns.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.unitToggle === state.unit));
      });
      document.querySelectorAll('[data-unit-speed-label]').forEach((el) => {
        el.textContent = state.unit === 'mi' ? 'MPH' : 'km/h';
      });
      document.querySelectorAll('[data-unit-pace-label]').forEach((el) => {
        el.textContent = state.unit === 'mi' ? '/mi' : '/km';
      });
      renderSpeedPresets();
      renderTab1();
      renderWorkouts(false);
      renderEliteMatch();
      renderWeather();
      renderPaceBand();
      save();
    }
    unitToggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => setUnit(btn.dataset.unitToggle));
    });

    /* ------------------------------------------------------------------
     * Tab 1: Incline (0~15%) & Pace Converter + VO2 / 칼로리
     * ------------------------------------------------------------------ */
    const inMph = $('in-mph');
    const inKmh = $('in-kmh');
    const inPaceMi = $('in-pace-mi');
    const inPaceKm = $('in-pace-km');
    const inIncline = $('in-incline');
    const inWeight = $('in-weight');

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
          state.mps = clampMps(parseFloat(b.dataset.presetMps));
          renderTab1();
          renderEliteMatch();
          renderWeather();
        });
      });
    }

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

    function renderTab1(skipEl) {
      const v = state.mps;
      const inc = state.incline;
      const isMi = state.unit === 'mi';
      const isKo = state.lang === 'ko';

      if (skipEl !== inMph) inMph.value = E.mpsToMph(v).toFixed(1);
      if (skipEl !== inKmh) inKmh.value = E.mpsToKmh(v).toFixed(1);
      if (skipEl !== inPaceMi) inPaceMi.value = E.formatTime(E.mpsToSecPerMile(v));
      if (skipEl !== inPaceKm) inPaceKm.value = E.formatTime(E.mpsToSecPerKm(v));
      if (skipEl !== inIncline) inIncline.value = inc.toFixed(1);
      if (skipEl !== inWeight) {
        inWeight.value = isMi ? String(Math.round(state.weightLbs)) : String(Math.round(E.lbsToKg(state.weightLbs)));
      }
      $('weight-unit-label').textContent = isMi ? 'lbs' : 'kg';

      $('card-mph').classList.toggle('ring-2', isMi);
      $('card-mph').classList.toggle('ring-volt/70', isMi);
      $('card-kmh').classList.toggle('ring-2', !isMi);
      $('card-kmh').classList.toggle('ring-volt/70', !isMi);
      $('card-pace-mi').classList.toggle('ring-2', isMi);
      $('card-pace-mi').classList.toggle('ring-volt/70', isMi);
      $('card-pace-km').classList.toggle('ring-2', !isMi);
      $('card-pace-km').classList.toggle('ring-volt/70', !isMi);

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
      $('big-incline-badge').textContent = isKo ? `경사도 ${inc.toFixed(1)}%` : `${inc.toFixed(1)}% Incline`;

      const gapOutdoorMps = E.outdoorEquivalentMps(v, inc);
      const gapZeroMps = E.flatZeroTreadmillMps(v, inc);

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

      const vo2 = E.acsmRunningVO2(v, inc);
      const weightKg = E.lbsToKg(state.weightLbs);
      const cal = E.caloriesFromVO2(vo2, weightKg);

      $('stat-vo2').textContent = vo2.toFixed(1);
      $('stat-mets').textContent = `${cal.mets.toFixed(1)} METs`;
      $('stat-kcal-hr').textContent = String(Math.round(cal.kcalPerHour));
      $('stat-kcal-min').textContent = `${cal.kcalPerMin.toFixed(1)} kcal/min`;

      $('finish-list').innerHTML = E.RACES.map(
        (r) => `<div class="rounded-xl bg-slate-800/80 px-3 py-2">
            <dt class="text-xs text-slate-400">${isKo ? r.labelKo : r.label}</dt>
            <dd class="font-mono text-base font-bold text-slate-100 tabular-nums">${E.formatTime(r.meters / v)} <span class="text-xs font-normal text-lime-300">(GAP ${E.formatTime(r.meters / gapOutdoorMps)})</span></dd>
          </div>`
      ).join('');

      const tableGrades = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15];
      $('incline-target').textContent = isMi
        ? `${E.mpsToMph(v).toFixed(1)} mph (${E.formatTime(E.mpsToSecPerMile(v))}/mi)`
        : `${E.mpsToKmh(v).toFixed(1)} km/h (${E.formatTime(E.mpsToSecPerKm(v))}/km)`;

      const flatTag = isKo ? '(야외평지)' : '(flat)';
      $('incline-body').innerHTML = tableGrades
        .map((g) => {
          const eqFlatMps = E.outdoorEquivalentMps(v, g);
          const reqBeltMps = E.treadmillSpeedForOutdoor(v, g);
          const isSelected = Math.abs(inc - g) < 0.26;
          return `<tr class="border-t border-slate-800/80 ${isSelected ? 'bg-lime-400/15 text-lime-300 font-bold' : ''}">
              <th scope="row" class="py-2 pl-3 text-left font-mono">${g}%${g === 1 ? ` <span class="text-[10px] text-slate-400">${flatTag}</span>` : ''}</th>
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

    // 📱 아이폰/모바일 숫자 키패드(0~9) 전용 스마트 콜론(:) 자동 포맷터
    // 숫자만 연속으로 쳐도 (예: 830 -> 8:30, 2000 -> 20:00, 33000 -> 3:30:00) 실시간 변환!
    function formatDigitsToTime(raw) {
      const digits = String(raw || '').replace(/\D/g, '').slice(0, 6);
      if (!digits) return '';
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, -2)}:${digits.slice(-2)}`;
      return `${digits.slice(0, -4)}:${digits.slice(-4, -2)}:${digits.slice(-2)}`;
    }

    function attachAutoSelectOnFocus(el) {
      if (!el) return;
      el.addEventListener('focus', () => {
        setTimeout(() => {
          try {
            el.select();
          } catch (_) {}
        }, 20);
      });
    }

    function bindSpeedInput(el, toMps) {
      attachAutoSelectOnFocus(el);
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
      attachAutoSelectOnFocus(el);
      el.addEventListener('input', () => {
        const formatted = formatDigitsToTime(el.value);
        if (el.value !== formatted) el.value = formatted;
        const sec = E.parseTime(formatted);
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
     * Tab 2: Treadmill Workouts & Elite Form Studio
     * ------------------------------------------------------------------ */
    let currentCueSteps = [];

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

    const baseModeBtns = document.querySelectorAll('[data-wk-base]');
    const wkBaseInput = $('wk-base-input');
    const wkBaseLabel = $('wk-base-label');

    function syncBaseInputUI() {
      const isKo = state.lang === 'ko';
      const isEditing = document.activeElement === wkBaseInput;
      baseModeBtns.forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.wkBase === state.wkBaseMode));
      });
      if (state.wkBaseMode === 'easy') {
        wkBaseLabel.textContent = isKo
          ? `평소 편안한 조깅 페이스 (${state.unit === 'mi' ? '분:초 /mi' : '분:초 /km'})`
          : `Your Easy Pace (${state.unit === 'mi' ? 'min/mi' : 'min/km'})`;
        if (!isEditing) wkBaseInput.value = state.wkEasyPace;
        wkBaseInput.placeholder = state.unit === 'mi' ? 'e.g. 9:00' : 'e.g. 5:35';
      } else if (state.wkBaseMode === '5k') {
        wkBaseLabel.textContent = isKo ? '최근 5K 완주 기록 (분:초)' : 'Recent 5K Race Time (mm:ss)';
        if (!isEditing) wkBaseInput.value = state.wk5kTime;
        wkBaseInput.placeholder = 'e.g. 22:30';
      } else {
        wkBaseLabel.textContent = isKo ? '목표 풀 마라톤 시간 (시:분:초)' : 'Goal Marathon Time (h:mm:ss)';
        if (!isEditing) wkBaseInput.value = state.wkMaraTime;
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

    attachAutoSelectOnFocus(wkBaseInput);
    wkBaseInput.addEventListener('input', () => {
      const formatted = formatDigitsToTime(wkBaseInput.value);
      if (wkBaseInput.value !== formatted) wkBaseInput.value = formatted;
      if (state.wkBaseMode === 'easy') state.wkEasyPace = formatted;
      else if (state.wkBaseMode === '5k') state.wk5kTime = formatted;
      else state.wkMaraTime = formatted;
      renderWorkouts(true);
    });

    const durBtns = document.querySelectorAll('[data-wk-dur]');
    durBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.wkDuration = Number(b.dataset.wkDur);
        durBtns.forEach((btn) => btn.setAttribute('aria-pressed', String(Number(btn.dataset.wkDur) === state.wkDuration)));
        renderWorkouts(true);
      });
    });

    const wkTypeBtns = document.querySelectorAll('[data-wk-type]');
    wkTypeBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.wkType = b.dataset.wkType;
        wkTypeBtns.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.wkType === state.wkType)));
        renderWorkouts(true);
      });
    });

    function renderWorkouts(regenerate = true) {
      syncBaseInputUI();
      const vdot = computeUserVdot();
      const isKo = state.lang === 'ko';
      $('wk-vdot-badge').textContent = `VDOT ${vdot.toFixed(1)}`;

      const zones = E.trainingZones(vdot);
      $('wk-zones-bar').innerHTML = zones
        .map((z) => {
          const spd = state.unit === 'mi' ? `${E.mpsToMph(z.midMps).toFixed(1)} mph` : `${E.mpsToKmh(z.midMps).toFixed(1)} km/h`;
          const pc = state.unit === 'mi' ? `${E.formatTime(E.mpsToSecPerMile(z.midMps))}/mi` : `${E.formatTime(E.mpsToSecPerKm(z.midMps))}/km`;
          const zLabel = isKo ? z.nameKo : z.name.split(' ')[0];
          return `<div class="min-w-0 rounded-xl bg-slate-800/90 px-1.5 py-2 text-center">
              <div class="truncate text-[11px] font-extrabold text-volt">${z.key} <span class="hidden sm:inline">· ${zLabel}</span></div>
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

    function renderCueTable() {
      const tbody = $('wk-cue-body');
      const isKo = state.lang === 'ko';
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
          const stageTitle = isKo && s.stageKo ? s.stageKo : s.stage;
          const stageCue = isKo && s.cueKo ? s.cueKo : s.cue;

          return `<tr class="border-t border-slate-800 align-middle">
              <td class="py-2.5 pl-3 pr-1">
                <div class="font-bold text-slate-100 text-xs sm:text-sm">${stageTitle}</div>
                <div class="text-[11px] text-slate-400">${stageCue}</div>
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

      const distVal = state.unit === 'mi' ? (totalMeters / E.METERS_PER_MILE).toFixed(2) + ' mi' : (totalMeters / 1000).toFixed(2) + ' km';
      $('wk-summary-time').textContent = isKo ? `${totalMin}분` : `${totalMin} min`;
      $('wk-summary-dist').textContent = distVal;

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
     * 인터랙티브 트레드밀 콘솔 타이머 (Workout Cue Player)
     * ------------------------------------------------------------------ */
    let timerId = null;
    let timerRunning = false;
    let activeStepIdx = 0;
    let stepRemainSec = 0;
    let wakeLockSentinel = null;

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
      const isKo = state.lang === 'ko';

      const sTitle = isKo && step.stageKo ? step.stageKo : step.stage;
      const sCue = isKo && step.cueKo ? step.cueKo : step.cue;
      const nTitle = nextStep ? (isKo && nextStep.stageKo ? nextStep.stageKo : nextStep.stage) : '';

      $('con-stage-name').textContent = `${activeStepIdx + 1}/${currentCueSteps.length} · ${sTitle}`;
      $('con-timer').textContent = E.formatTime(stepRemainSec);
      $('con-speed').textContent = isMi
        ? `${E.mpsToMph(step.mps).toFixed(1)} MPH`
        : `${E.mpsToKmh(step.mps).toFixed(1)} km/h`;
      $('con-incline').textContent = `${step.incline.toFixed(1)}%`;
      $('con-cue').textContent = sCue;
      $('con-next').textContent = nextStep
        ? `${isKo ? '다음 구간' : 'Next'}: ${nTitle} (${
            isMi ? `${E.mpsToMph(nextStep.mps).toFixed(1)} mph` : `${E.mpsToKmh(nextStep.mps).toFixed(1)} km/h`
          } @ ${nextStep.incline.toFixed(1)}%)`
        : isKo
        ? '마지막 구간입니다 — 쿨다운 후 마무리하세요!'
        : 'Final stage — Cool down & finish!';
      $('con-toggle-btn').textContent = timerRunning
        ? isKo
          ? '⏸ 일시정지'
          : '⏸ Pause'
        : isKo
        ? '▶ 계속하기'
        : '▶ Resume';
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
            const isKo = state.lang === 'ko';
            $('con-stage-name').textContent = isKo ? '워크아웃 완료! 수고하셨습니다!' : 'Workout Complete!';
            $('con-timer').textContent = '0:00';
            $('con-toggle-btn').textContent = isKo ? '▶ 처음부터 다시' : '▶ Restart';
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
     * Elite Runner Form by Speed 매칭 카드 렌더링 (한/영 지원)
     * ------------------------------------------------------------------ */
    function renderEliteMatch() {
      const mph = E.mpsToMph(state.mps);
      const inc = state.incline;
      const isKo = state.lang === 'ko';
      const matchedKey = E.matchEliteRunner(mph, inc);
      const matchedRunner = E.ELITE_RUNNERS.find((r) => r.key === matchedKey) || E.ELITE_RUNNERS[1];

      $('elite-current-speed').textContent =
        state.unit === 'mi'
          ? `${mph.toFixed(1)} MPH @ ${inc.toFixed(1)}%`
          : `${E.mpsToKmh(state.mps).toFixed(1)} km/h @ ${inc.toFixed(1)}%`;
      $('elite-matched-name').textContent = isKo ? matchedRunner.nameKo : matchedRunner.name;

      $('elite-cards-grid').innerHTML = E.ELITE_RUNNERS.map((r) => {
        const isMatch = r.key === matchedKey;
        const rName = isKo ? r.nameKo : r.name;
        const rTitle = isKo ? r.titleKo : r.title;
        const rRange = isKo ? r.speedRangeKo : r.speedRangeMph;
        const rCadence = isKo ? r.cadenceKo : r.cadence;
        const rStrike = isKo ? r.footStrikeKo : r.footStrike;
        const rUpper = isKo ? r.upperBodyKo : r.upperBody;
        const rBio = isKo ? r.biomechanicsKo : r.biomechanics;
        const rCue = isKo ? r.coachCueKo : r.coachCue;
        const matchLabel = isKo ? '★ 현재 속도에 자동 매칭됨' : '★ MATCHED FOR YOUR SPEED';
        const ytBtnLabel = isKo
          ? `▶ ${r.nameKo.split(' ')[0]} 슬로우모션 주법 분석 영상 보기 (YouTube)`
          : `▶ Watch ${r.name} Slow-Motion Form Analysis (YouTube)`;

        return `<article class="rounded-2xl border p-4 transition ${
          isMatch
            ? 'border-volt bg-gradient-to-b from-lime-400/15 to-slate-900 ring-1 ring-volt'
            : 'border-slate-800 bg-slate-900/90'
        }">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-base font-extrabold text-slate-100">${rName}</h3>
                <p class="text-xs font-semibold text-slate-400">${rTitle}</p>
              </div>
              <span class="rounded-full px-2.5 py-1 font-mono text-xs font-bold ${
                isMatch ? 'bg-volt text-slate-950' : 'bg-slate-800 text-slate-300'
              }">${isMatch ? matchLabel : rRange}</span>
            </div>

            <dl class="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <div class="rounded-xl bg-slate-950/80 p-2.5">
                <dt class="text-slate-400">${isKo ? '케이던스 (보속)' : 'Cadence'}</dt>
                <dd class="mt-0.5 font-mono font-bold text-lime-300">${rCadence}</dd>
              </div>
              <div class="rounded-xl bg-slate-950/80 p-2.5">
                <dt class="text-slate-400">${isKo ? '착지 주법' : 'Foot Strike'}</dt>
                <dd class="mt-0.5 font-semibold text-slate-200">${rStrike}</dd>
              </div>
              <div class="rounded-xl bg-slate-950/80 p-2.5">
                <dt class="text-slate-400">${isKo ? '상체 각도 & 팔치기' : 'Upper Body & Angle'}</dt>
                <dd class="mt-0.5 font-semibold text-slate-200">${rUpper}</dd>
              </div>
            </dl>

            <p class="mt-3 text-xs leading-relaxed text-slate-300">${rBio}</p>
            <p class="mt-2 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-semibold text-volt">
              ${isKo ? '코칭 포인트' : 'Coach Cue'}: “${rCue}”
            </p>

            <div class="mt-3">
              <a
                href="${r.ytUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-extrabold text-slate-100 hover:bg-volt hover:text-slate-950"
              >
                <span>${ytBtnLabel}</span>
              </a>
            </div>
          </article>`;
      }).join('');
    }

    /* ------------------------------------------------------------------
     * Tab 3: Weather (기온·이슬점·습도·풍속) & MAF 180 계산기
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

    const humidModeBtns = document.querySelectorAll('[data-humid-mode]');
    humidModeBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.humidMode = b.dataset.humidMode;
        renderWeather();
      });
    });

    function renderWeather() {
      const isKo = state.lang === 'ko';
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
        $('dew-note').textContent = isKo ? heatAdj.noteKo : heatAdj.note;
        $('dew-pace').textContent = `${E.formatTime(adjSec)}${unitSuffix}`;
        $('dew-base-ref').textContent = `${isKo ? '기준 페이스' : 'Baseline'}: ${E.formatTime(baseSec)}${unitSuffix} (${
          state.unit === 'mi' ? `${E.mpsToMph(state.mps).toFixed(1)} mph` : `${E.mpsToKmh(state.mps).toFixed(1)} km/h`
        })`;
      }

      state.mafAge = inMafAge.value.trim();
      state.mafMod = mafModSel.value;
      const maf = E.calculateMaf(state.mafAge, state.mafMod);
      $('maf-target-hr').textContent = `${maf.mafMax} bpm`;
      $('maf-zone-range').textContent = maf.rangeText;

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
     * Tab 4: Marathon Pace Band (5K / 10K / Half / Full)
     * ------------------------------------------------------------------ */
    const pbRaceSel = $('pb-race');
    const pbTimeIn = $('pb-time');
    const pbStratSel = $('pb-strategy');
    const pbMinusBtn = $('pb-minus-btn');
    const pbPlusBtn = $('pb-plus-btn');
    const pbQuickTimes = $('pb-quick-times');

    const PB_PRESETS = {
      '5k': ['18:00', '20:00', '22:30', '25:00', '30:00'],
      '10k': ['40:00', '45:00', '50:00', '55:00', '1:00:00'],
      half: ['1:30:00', '1:40:00', '1:50:00', '2:00:00'],
      full: ['3:00:00', '3:30:00', '3:45:00', '4:00:00'],
    };

    function renderPbQuickTimes() {
      if (!pbQuickTimes) return;
      const list = PB_PRESETS[state.pbRace] || PB_PRESETS.full;
      pbQuickTimes.innerHTML = list
        .map((t) => {
          const active = state.pbTime === t;
          return `<button type="button" data-pb-preset="${t}" aria-pressed="${active}" class="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[11px] font-bold text-slate-300 transition">${t}</button>`;
        })
        .join('');
      pbQuickTimes.querySelectorAll('[data-pb-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          pbTimeIn.value = btn.dataset.pbPreset;
          state.pbTime = pbTimeIn.value;
          renderPaceBand();
        });
      });
    }

    pbRaceSel.value = state.pbRace;
    pbTimeIn.value = state.pbTime;
    pbStratSel.value = state.pbStrategy;
    attachAutoSelectOnFocus(pbTimeIn);

    pbRaceSel.addEventListener('change', () => {
      state.pbRace = pbRaceSel.value;
      const sampleTimes = { '5k': '20:00', '10k': '45:00', half: '1:40:00', full: '3:30:00' };
      pbTimeIn.value = sampleTimes[state.pbRace] || '3:30:00';
      state.pbTime = pbTimeIn.value;
      renderPaceBand();
    });
    pbTimeIn.addEventListener('input', () => {
      const formatted = formatDigitsToTime(pbTimeIn.value);
      if (pbTimeIn.value !== formatted) pbTimeIn.value = formatted;
      state.pbTime = formatted;
      renderPaceBand();
    });
    if (pbMinusBtn) {
      pbMinusBtn.addEventListener('click', () => {
        const cur = E.parseTime(state.pbTime);
        if (Number.isFinite(cur) && cur > 60) {
          pbTimeIn.value = E.formatTime(cur - 30);
          state.pbTime = pbTimeIn.value;
          renderPaceBand();
        }
      });
    }
    if (pbPlusBtn) {
      pbPlusBtn.addEventListener('click', () => {
        const cur = E.parseTime(state.pbTime);
        if (Number.isFinite(cur)) {
          pbTimeIn.value = E.formatTime(cur + 30);
          state.pbTime = pbTimeIn.value;
          renderPaceBand();
        }
      });
    }
    pbStratSel.addEventListener('change', () => {
      state.pbStrategy = pbStratSel.value;
      renderPaceBand();
    });

    function renderPaceBand() {
      renderPbQuickTimes();
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

      const splits = E.generatePaceBand(race.meters, sec, state.unit, state.pbStrategy, state.lang);
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

    $('pb-print-btn').addEventListener('click', () => window.print());
    $('pb-download-btn').addEventListener('click', () => {
      const race = E.RACES.find((r) => r.key === state.pbRace) || E.RACES[3];
      const sec = E.parseTime(state.pbTime);
      if (!Number.isFinite(sec)) return;
      const splits = E.generatePaceBand(race.meters, sec, state.unit, state.pbStrategy, state.lang);
      const header = `RunPaceStudio Pace Band — ${race.label} (${E.formatTime(sec)}, ${state.pbStrategy} split)\nSplit\tPace\tElapsed\tTreadmill\n`;
      const lines = splits
        .map((s) => `${s.label}\t${s.splitPace}\t${s.elapsedTime}\t${state.unit === 'mi' ? s.mph + ' mph' : s.kmh + ' km/h'}`)
        .join('\n');
      const blob = new Blob([header + lines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RunPaceStudio-${race.key}-paceband.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });

    /* ------------------------------------------------------------------
     * 크루 공유(Share Link + 내장 QR 코드 모달) & PWA 설치
     * ------------------------------------------------------------------ */
    const shareModal = $('share-modal');
    const shareUrlInput = $('share-url-input');
    const shareCopyMsg = $('share-copy-msg');

    function buildShareUrl() {
      const u = new URL(window.location.href.split('?')[0]);
      u.searchParams.set('lang', state.lang);
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
      const dict = I18N[state.lang] || I18N.en;
      try {
        await navigator.clipboard.writeText(shareUrlInput.value);
        shareCopyMsg.textContent = dict.copiedMsg;
        shareCopyMsg.hidden = false;
      } catch (_) {
        shareUrlInput.select();
      }
    });
    $('share-native-btn').addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'RunPaceStudio — Treadmill Pace & Workout Setup',
            text: `Treadmill ${E.mpsToMph(state.mps).toFixed(1)} MPH @ ${state.incline.toFixed(1)}% incline`,
            url: shareUrlInput.value,
          });
        } catch (_) {}
      } else {
        $('share-copy-btn').click();
      }
    });

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
    setLang(state.lang);
    renderWorkouts(true);
    renderEliteMatch();
    renderWeather();
    renderPaceBand();
    $('year').textContent = String(new Date().getFullYear());
  });
}
