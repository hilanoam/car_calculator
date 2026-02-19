// ====== Config ======
const FIXED_NI = 0.07;      // ביטוח לאומי
const FIXED_HEALTH = 0.05;  // ביטוח בריאות
const ALLOWANCE_AUTO_PCT = 0.71; // 71%

let allowanceAuto = true; // כל עוד true - ממלאים אוטומטית

// זמני – בהמשך תוסיפי עשרות דגמים
const CAR_VALUES = {
  bmw_d: 3040,                 // בי ווי די
  toyota_land_cruiser: 9270,   // טויוטה לנד קרוזר
  toyota_highlander: 8100,     // טויוטה היילנדר
  toyota_rav4: 4850,           // טויוטה ראב 4
  toyota_hilux: 7280,          // טויוטה היילקס
  toyota_vigo: 7650,           // טויוטה ויגו
  toyota_yaris_cross: 3380,    // טויוטה יאריס קרוס
  toyota_yaris: 3260,          // טויוטה יאריס
  toyota_camry: 5190,          // טויוטה קאמרי
  toyota_corolla: 3860,        // טויוטה קורולה

  hyundai_i25: 3340,           // יונדאי I25
  hyundai_elantra: 3800,       // יונדאי אלנטרה
  hyundai_accent: 3630,        // יונדאי אקסנט
  hyundai_i: 2830,             // יונדאיI
  hyundai_staria: 7750,        // יונדאיסטארייה

  mazda_2: 3220,               // מאזדה 2

  mitsubishi_triton: 6500,     // מיצוביי טרייטון
  mitsubishi_other: 7060,      // מיצובישי

  citroen_berlingo: 4380,      // סיטרואן ברלינגו
  citroen_berlingo_7: 6470,    // סיטרואן ברלינגו 7 מקומות
  citroen_jumpy: 6650,         // סיטרואן ג'מפי
  citroen_spacetourer: 5240,   // סיטרואן ספייסטורר (פיקאסו)

  skoda_octavia: 4590,         // סקודה אוקטביה
  fiat_ducato: 9375,           // פיאט דקאטו

  kia_ceed: 3780,              // קאיה סיד
  kia_niro: 4040,              // קיה נירו
  kia_sportage: 4940,          // קיה ספרטאג'
  kia_picanto: 2290,           // קיה פיקנטו
  kia_rio: 3160,               // קיה ריו

  renault_traffic: 6600,       // רנו טרפיק
  renault_megane: 4410,        // רנו מגאן
  renault_kangoo: 4070,        // רנו קנגו
};


// ====== Utils ======
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function pctToNum(pctStr) {
  return toNum(pctStr) / 100;
}

// ====== Elements ======
const dynamicCards = document.getElementById("dynamicCards");
const datesCard = document.getElementById("datesCard");

const btnYes = document.getElementById("btnStandardYes");
const btnNo = document.getElementById("btnStandardNo");

const field2Card = document.getElementById("field2Card");

const carType = document.getElementById("carType");
const benefitManual = document.getElementById("benefitManual");
const taxPct = document.getElementById("taxPct");
const allowance = document.getElementById("allowance");

const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

let datesMode = "dates"; // "dates" | "days"
const btnModeDates = document.getElementById("btnModeDates");
const btnModeDays = document.getElementById("btnModeDays");
const datesInputs = document.getElementById("datesInputs");
const daysInputs = document.getElementById("daysInputs");
const useMonth = document.getElementById("useMonth");
const daysCount = document.getElementById("daysCount");

const daysInMonthEl = document.getElementById("daysInMonth");
const daysUsedEl = document.getElementById("daysUsed");
const proratedCostEl = document.getElementById("proratedCost");
const dateErrorEl = document.getElementById("dateError");

// Breakdown field 1
const taxOnBenefit = document.getElementById("taxOnBenefit");
const nOnBenefit = document.getElementById("nOnBenefit");
const hOnBenefit = document.getElementById("hOnBenefit");
const sumBenefit = document.getElementById("sumBenefit");

// Breakdown field 2
const taxPct2 = document.getElementById("taxPct2");
const taxOnAllowance = document.getElementById("taxOnAllowance");
const nOnAllowance = document.getElementById("nOnAllowance");
const hOnAllowance = document.getElementById("hOnAllowance");
const netAllowance = document.getElementById("netAllowance");

// Final
const finalValue = document.getElementById("finalValue");

// Calc button
const btnCalc = document.getElementById("btnCalc");
const footerBanner = document.getElementById("footerBanner");

// ====== State ======
let hasStandard = null; // null עד שלא בוחרים
let submitted = false;

// ====== UI helpers ======
function showDateError(msg) {
  if (!dateErrorEl) return;
  if (!msg) {
    dateErrorEl.classList.add("hidden");
    dateErrorEl.textContent = "";
  } else {
    dateErrorEl.classList.remove("hidden");
    dateErrorEl.textContent = msg;
  }
}

function setDatesMode(mode) {
  datesMode = mode;

  if (datesInputs) datesInputs.classList.toggle("hidden", mode !== "dates");
  if (daysInputs) daysInputs.classList.toggle("hidden", mode !== "days");

  btnModeDates?.classList.remove("ring-2", "ring-violet-400");
  btnModeDays?.classList.remove("ring-2", "ring-violet-400");
  (mode === "dates" ? btnModeDates : btnModeDays)?.classList.add("ring-2", "ring-violet-400");

  showDateError("");

  if (submitted) recalc();
}

function setStandardMode(isYes) {
  hasStandard = isYes;

  dynamicCards?.classList.remove("hidden");

  // צמוד => תוספת איזון מוצגת, כרטיס תאריכים מוסתר
  field2Card?.classList.toggle("hidden", !hasStandard);
  datesCard?.classList.toggle("hidden", hasStandard);

  // highlight כפתור
    btnYes?.classList.remove("btn-choice-active");
    btnNo?.classList.remove("btn-choice-active");
    (isYes ? btnYes : btnNo)?.classList.add("btn-choice-active");



  // מעבר ל"איגום" -> מאפסים תוספת איזון שלא תשפיע
  if (!hasStandard && allowance) allowance.value = "";

  // בצמוד: ממלאים תוספת איזון אוטומטית (רק אם לא כתבו ידנית)
  if (hasStandard) {
    allowanceAuto = true;
    autoFillAllowanceIfNeeded();
  } else {
    allowanceAuto = true;
  }

  if (submitted) recalc();
}

function daysInMonthFromMonthInput(val) {
  // val like "2026-02"
  if (!val) return null;
  const [y, m] = val.split("-").map(Number);
  if (!y || !m) return null;
  return new Date(y, m, 0).getDate(); // m is 1-12
}

function daysInMonthFrom(dateObj) {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth(); // 0-11
  return new Date(y, m + 1, 0).getDate();
}

function parseDateInput(val) {
  if (!val) return null;
  const d = new Date(val + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function diffDaysInclusive(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((end - start) / ms) + 1;
}
function calcPayForMonthSegment(usedDaysInThatMonth, daysInMonth, fullMonthlyCost) {
  // יום חינם אחד לכל חודש קלנדרי
  if (usedDaysInThatMonth <= 1) return 0;
  if (usedDaysInThatMonth >= 10) return fullMonthlyCost;
  return (fullMonthlyCost / daysInMonth) * (usedDaysInThatMonth - 1);
}

function endOfMonth(dateObj) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
}

function addDays(dateObj, days) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return d;
}

// ====== Calculation helpers ======
function getBenefitValue() {
  const manual = toNum(benefitManual?.value);
  if (manual > 0) return manual;
  return CAR_VALUES[carType?.value] ?? 0;
}

function autoFillAllowanceIfNeeded() {
  if (hasStandard !== true) return;
  if (!allowance) return;
  if (!allowanceAuto) return;

  const B = getBenefitValue();
  allowance.value = B > 0 ? money(B * ALLOWANCE_AUTO_PCT) : "";
}

// ====== Validation (אדום רק אחרי "חשב") ======
function mark(el, ok) {
  if (!el) return;
  if (!submitted) {
    el.classList.remove("input-error");
    return;
  }
  el.classList.toggle("input-error", !ok);
}

function clearAllMarks() {
  [carType, benefitManual, taxPct, allowance, startDate, endDate, useMonth, daysCount].forEach((el) => {
    if (el) el.classList.remove("input-error");
  });
}

function stopWithError(msg) {
  showDateError(msg);
  if (finalValue) finalValue.textContent = "—";
  return { ok: false };
}

function validateRequired() {
  if (!submitted) return { ok: false };

  clearAllMarks();
  showDateError("");

  // חובה לבחור סוג שימוש
  if (hasStandard !== true && hasStandard !== false) {
    return stopWithError("בחרי סוג שימוש ברכב כדי לחשב.");
  }

  // חובה לבחור רכב או להזין ידני
  const manual = toNum(benefitManual?.value);
  const hasCar = !!carType?.value;
  const hasManual = manual > 0;

  mark(carType, hasCar || hasManual);
  mark(benefitManual, hasCar || hasManual);
  if (!hasCar && !hasManual) {
    return stopWithError("בחרי קטגוריית רכב או הזיני סכום ידני.");
  }

  // חובה מס שולי
  const hasTax = !!taxPct?.value;
  mark(taxPct, hasTax);
  if (!hasTax) {
    return stopWithError("בחרי אחוז מס שולי.");
  }

  // בצמוד חובה תוספת איזון (גם אם אוטומטי – חייב להיות לא ריק)
  if (hasStandard) {
    const hasAllow = allowance?.value?.trim() !== "";
    mark(allowance, hasAllow);
    if (!hasAllow) {
      return stopWithError("תוספת איזון היא שדה חובה ברכב צמוד/מוצמד.");
    }
  }

  // באיגום חובה תאריכים או חודש+ימים
  if (!hasStandard) {
    if (datesMode === "dates") {
      const hasS = !!startDate?.value;
      const hasE = !!endDate?.value;
      mark(startDate, hasS);
      mark(endDate, hasE);
      if (!hasS || !hasE) {
        return stopWithError("בחרי תאריך התחלה ותאריך סיום.");
      }
    } else {
      const hasM = !!useMonth?.value;
      const usedRaw = daysCount?.value?.trim();
      const used = Math.floor(toNum(usedRaw));
      const hasD = usedRaw !== "" && Number.isFinite(used) && used >= 0;

      mark(useMonth, hasM);
      mark(daysCount, hasD);

      if (!hasM || !hasD) {
        return stopWithError("בחרי חודש והזיני מספר ימי נסיעה.");
      }
    }
  }

  return { ok: true };
}

// ====== Main calc ======
function recalc() {
  if (!submitted) {
    if (finalValue) finalValue.textContent = "—";
    return;
  }

  const v = validateRequired();
  if (!v.ok) {
    return;
  } else {
    footerBanner?.classList.remove("hidden");
  }

  const B = getBenefitValue();
  const T = pctToNum(taxPct?.value);

  // field1 cost (עלות ניכוי על זקיפת הטבה לרכב)
  const taxB = B * T;
  const niB = B * FIXED_NI;
  const healthB = B * FIXED_HEALTH;
  const cost1 = taxB + niB + healthB;

  // field2 net (תוספת איזון נטו)
  const A = hasStandard ? toNum(allowance?.value) : 0;
  const taxA = A * T;
  const niA = A * FIXED_NI;
  const healthA = A * FIXED_HEALTH;
  const net2 = A - (taxA + niA + healthA);

  let final = 0;

  if (hasStandard) {
    // רכב צמוד
    final = cost1 - net2;

    if (daysInMonthEl) daysInMonthEl.textContent = "—";
    if (daysUsedEl) daysUsedEl.textContent = "—";
    if (proratedCostEl) proratedCostEl.textContent = money(0);
    showDateError("");
  } else {
    // איגום / ת"ש
    if (datesMode === "days") {
      // מצב הזנת מספר ימים
      const dim = daysInMonthFromMonthInput(useMonth?.value);
      const used = Math.floor(toNum(daysCount?.value));

      if (!dim) return stopWithError("בחרי חודש כדי לחשב ימים בחודש (לדוגמה 2026-02).");
      if (used > dim) return stopWithError(`מספר הימים לא יכול להיות גדול ממספר הימים בחודש (${dim}).`);

      // יום חינם אחד בכל חודש
      let pay = 0;
      if (used <= 1) pay = 0;
      else if (used >= 10) pay = cost1;
      else pay = (cost1 / dim) * (used - 1);

      final = pay;

      if (daysInMonthEl) daysInMonthEl.textContent = String(dim);
      if (daysUsedEl) daysUsedEl.textContent = String(used);
      if (proratedCostEl) proratedCostEl.textContent = money(pay);
      showDateError("");
    } else {
      // מצב הזנת תאריכים — תומך גם בטווח שחוצה חודשים
      const s = parseDateInput(startDate?.value);
      const e = parseDateInput(endDate?.value);

      if (!s || !e) return stopWithError("בחרי תאריך התחלה ותאריך סיום.");
      if (e < s) return stopWithError("תאריך סיום חייב להיות אחרי תאריך התחלה.");

      // === חישוב לפי חודשים: יום חינם בכל חודש קלנדרי ===
      let cursor = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      let totalPay = 0;
      const segments = [];

      while (cursor <= e) {
        const segStart = new Date(cursor);
        const segEnd = new Date(Math.min(endOfMonth(cursor).getTime(), e.getTime()));

        const dim = daysInMonthFrom(segStart);
        const used = diffDaysInclusive(segStart, segEnd);

        // יום חינם לכל חודש + כלל 2-9 יחסית, 10+ מלא
        const paySeg = calcPayForMonthSegment(used, dim, cost1);
        totalPay += paySeg;

        segments.push({
          y: segStart.getFullYear(),
          m: segStart.getMonth() + 1,
          dim,
          used,
          pay: paySeg,
        });

        cursor = addDays(segEnd, 1);
      }

      final = totalPay;

      // UI summary
      if (daysInMonthEl) {
        daysInMonthEl.textContent =
          segments.length === 1
            ? String(segments[0].dim)
            : segments.map((sg) => `${sg.m}/${sg.y}: ${sg.dim}`).join(" | ");
      }

      if (daysUsedEl) {
        const totalUsed = segments.reduce((acc, sg) => acc + sg.used, 0);
        daysUsedEl.textContent =
          segments.length === 1
            ? String(segments[0].used)
            : `${totalUsed} (ב־${segments.length} חודשים)`;
      }

      if (proratedCostEl) proratedCostEl.textContent = money(totalPay);
      showDateError("");
    }
  }

  // ====== Render breakdowns ======
  if (taxOnBenefit) taxOnBenefit.textContent = money(taxB);
  if (nOnBenefit) nOnBenefit.textContent = money(niB);
  if (hOnBenefit) hOnBenefit.textContent = money(healthB);
  if (sumBenefit) sumBenefit.textContent = money(cost1);

  if (taxPct2) taxPct2.textContent = taxPct?.value ? `${taxPct.value}%` : "—";
  if (taxOnAllowance) taxOnAllowance.textContent = money(taxA);
  if (nOnAllowance) nOnAllowance.textContent = money(niA);
  if (hOnAllowance) hOnAllowance.textContent = money(healthA);
  if (netAllowance) netAllowance.textContent = money(net2);

  if (finalValue) finalValue.textContent = `₪ ${money(final)}`;
}


// ====== Listeners ======
function maybeRecalc() {
  if (submitted) recalc();
}

benefitManual?.addEventListener("input", () => {
  const v = benefitManual.value.trim();
  if (v !== "" && carType) carType.value = "";
  autoFillAllowanceIfNeeded();
  maybeRecalc();
});

carType?.addEventListener("change", () => {
  const val = CAR_VALUES[carType.value] ?? 0;

  if (benefitManual) {
    benefitManual.value = String(val);
  }

  autoFillAllowanceIfNeeded();
  maybeRecalc();
});


taxPct?.addEventListener("change", maybeRecalc);

// allowance: אם מתחילים להקליד -> מפסיקים אוטומטי
allowance?.addEventListener("input", () => {
  allowanceAuto = allowance.value.trim() === "";
  if (allowanceAuto) autoFillAllowanceIfNeeded();
  maybeRecalc();
});

// כפתורי סוג שימוש
btnYes?.addEventListener("click", () => setStandardMode(true));
btnNo?.addEventListener("click", () => setStandardMode(false));

// מצב תאריכים / ימים
btnModeDates?.addEventListener("click", () => setDatesMode("dates"));
btnModeDays?.addEventListener("click", () => setDatesMode("days"));

// קלטי תאריכים / ימים
startDate?.addEventListener("change", maybeRecalc);
endDate?.addEventListener("change", maybeRecalc);
useMonth?.addEventListener("change", maybeRecalc);
daysCount?.addEventListener("input", maybeRecalc);

// כפתור חשב
btnCalc?.addEventListener("click", () => {
  submitted = true;
  recalc();
});

// ====== Init ======
function init() {
  // התחל ריק
  if (carType) carType.value = "";
  if (benefitManual) benefitManual.value = "";
  if (taxPct) taxPct.value = "";
  if (allowance) allowance.value = "";

  submitted = false;
  hasStandard = null;

  // מסתירים הכול בהתחלה
  field2Card?.classList.add("hidden");
  datesCard?.classList.add("hidden");
  dynamicCards?.classList.add("hidden");

  // בלי סימון כפתורים
  btnYes?.classList.remove("ring-2", "ring-violet-400", "shadow-[0_12px_25px_rgba(139,92,246,0.35)]");
  btnNo?.classList.remove("ring-2", "ring-violet-400", "shadow-[0_12px_25px_rgba(139,92,246,0.35)]");

  // מצב ברירת מחדל לתאריכים
  setDatesMode("dates");

  clearAllMarks();
  showDateError("");
  if (finalValue) finalValue.textContent = "";
}

init();
