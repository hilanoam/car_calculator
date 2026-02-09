// ====== Config ======
const FIXED_NI = 0.07;      // ביטוח לאומי
const FIXED_HEALTH = 0.05;  // ביטוח בריאות

// זמני – בהמשך תוסיפי עשרות דגמים
const CAR_VALUES = {
  small: 3200,
  medium: 4100,
  large: 5200,
};

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
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

const daysInMonthEl = document.getElementById("daysInMonth");
const daysUsedEl = document.getElementById("daysUsed");
const payableDaysEl = document.getElementById("payableDays");
const proratedCostEl = document.getElementById("proratedCost");
const dateErrorEl = document.getElementById("dateError");

const btnYes = document.getElementById("btnStandardYes");
const btnNo = document.getElementById("btnStandardNo");
const field2Card = document.getElementById("field2Card");

const carType = document.getElementById("carType");
const benefitManual = document.getElementById("benefitManual");
const taxPct = document.getElementById("taxPct");
const allowance = document.getElementById("allowance");

// Field 1 breakdown
const taxOnBenefit = document.getElementById("taxOnBenefit");
const nOnBenefit = document.getElementById("nOnBenefit");
const hOnBenefit = document.getElementById("hOnBenefit");
const sumBenefit = document.getElementById("sumBenefit");

// Field 2 breakdown
const taxPct2 = document.getElementById("taxPct2");
const taxOnAllowance = document.getElementById("taxOnAllowance");
const nOnAllowance = document.getElementById("nOnAllowance");
const hOnAllowance = document.getElementById("hOnAllowance");
const netAllowance = document.getElementById("netAllowance");

// Final
const finalValue = document.getElementById("finalValue");

// ====== State ======
let hasStandard = false;

// ====== UI helpers ======
function setStandardMode(isYes) {
  hasStandard = isYes;
   
  if (dynamicCards) {
    dynamicCards.classList.remove("hidden");
  }
  if (field2Card) {
    field2Card.classList.toggle("hidden", !hasStandard);
  }
  if (datesCard) datesCard.classList.toggle("hidden", hasStandard);
    btnYes.classList.remove(
    "ring-2",
    "ring-violet-400",
    "shadow-[0_12px_25px_rgba(139,92,246,0.35)]"
  );
  btnNo.classList.remove(
    "ring-2",
    "ring-violet-400",
    "shadow-[0_12px_25px_rgba(139,92,246,0.35)]"
  );

  // סימון הבחירה
  const activeBtn = isYes ? btnYes : btnNo;
  activeBtn.classList.add(
    "ring-2",
    "ring-violet-400",
    "shadow-[0_12px_25px_rgba(139,92,246,0.35)]"
  );

  // אם עברו ל"לא" – מאפסים תוספת איזון כדי שלא תשפיע
  if (!hasStandard && allowance) allowance.value = "";

  recalc();
}
function daysInMonthFrom(dateObj) {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth(); // 0-11
  return new Date(y, m + 1, 0).getDate();
}

function parseDateInput(val) {
  // val like "2026-02-09"
  if (!val) return null;
  const d = new Date(val + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function diffDaysInclusive(a, b) {
  // inclusive difference in days between two Date objects
  const ms = 24 * 60 * 60 * 1000;
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((end - start) / ms) + 1;
}

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

// ====== Calculation ======
function getBenefitValue() {
  const manual = toNum(benefitManual.value);
  if (manual > 0) return manual;

  return CAR_VALUES[carType.value] ?? 0;
}

function recalc() {
  const B = getBenefitValue();
  const A = hasStandard ? toNum(allowance.value) : 0;

  const T = pctToNum(taxPct.value);
  const R = T + FIXED_NI + FIXED_HEALTH;

  const taxB = B * T;
  const niB = B * FIXED_NI;
  const healthB = B * FIXED_HEALTH;
  const cost1 = taxB + niB + healthB;

  // שדה 2: ניכויים על תוספת איזון, והנטו שנשאר
  const taxA = A * T;
  const niA = A * FIXED_NI;
  const healthA = A * FIXED_HEALTH;
  const net2 = A - (taxA + niA + healthA);

  // סופי: cost1 - net2 (אם אין תקינה net2=0)
  let final;

  if (hasStandard) {
    // כן תקינה – כמו קודם
    final = cost1 - net2;
    // (אפשר לאפס תצוגות ימים)
    if (daysInMonthEl) daysInMonthEl.textContent = "—";
    if (daysUsedEl) daysUsedEl.textContent = "—";
    if (payableDaysEl) payableDaysEl.textContent = "—";
    if (proratedCostEl) proratedCostEl.textContent = money(0);
    showDateError("");
  } else {
    // לא תקינה – חישוב לפי ימים
    const s = parseDateInput(startDate?.value);
    const e = parseDateInput(endDate?.value);

    // אם אין תאריכים – כרגע נחשב 0 (או אפשר להציג cost1, מה שתרצי)
    if (!s || !e) {
      final = 0;
      if (daysInMonthEl) daysInMonthEl.textContent = "—";
      if (daysUsedEl) daysUsedEl.textContent = "—";
      if (payableDaysEl) payableDaysEl.textContent = "—";
      if (proratedCostEl) proratedCostEl.textContent = money(0);
      showDateError("");
    } else if (e < s) {
      final = 0;
      showDateError("תאריך סיום חייב להיות אחרי תאריך התחלה.");
    } else if (s.getFullYear() !== e.getFullYear() || s.getMonth() !== e.getMonth()) {
      final = 0;
      showDateError("כרגע החישוב תומך בתאריכים באותו חודש בלבד.");
    } else {
      showDateError("");

      const dim = daysInMonthFrom(s);
      const used = diffDaysInclusive(s, e);

      let pay;
      if (used <= 1) pay = 0;
      else if (used >= 10) pay = cost1;
      else {
        const payableDays = used - 1; // יום חינם
        pay = (cost1 / dim) * payableDays;
      }

      final = pay;

      // Render לכרטיס התאריכים
      if (daysInMonthEl) daysInMonthEl.textContent = String(dim);
      if (daysUsedEl) daysUsedEl.textContent = String(used);

      const pd = used <= 1 ? 0 : (used >= 10 ? dim : (used - 1));
      if (payableDaysEl) payableDaysEl.textContent = String(pd);

      if (proratedCostEl) proratedCostEl.textContent = money(pay);
    }
  }

 // ====== Render ======
    if (taxOnBenefit) taxOnBenefit.textContent = money(taxB);
    if (nOnBenefit) nOnBenefit.textContent = money(niB);
    if (hOnBenefit) hOnBenefit.textContent = money(healthB);
    if (sumBenefit) sumBenefit.textContent = money(cost1);

    if (taxPct2) taxPct2.textContent = taxPct?.value ? `${taxPct.value}%` : "—";
    if (taxOnAllowance) taxOnAllowance.textContent = money(taxA);
    if (nOnAllowance) nOnAllowance.textContent = money(niA);
    if (hOnAllowance) hOnAllowance.textContent = money(healthA);
    if (netAllowance) netAllowance.textContent = money(net2);

    if (finalValue) finalValue.textContent = money(final);
    }

    // ====== UX: או רכב או ידני (אחד מאפס את השני) ======
    if (benefitManual) {
    benefitManual.addEventListener("input", () => {
        if (toNum(benefitManual.value) > 0 && carType) carType.value = "";
        recalc();
    });
    }
    if (carType) {
    carType.addEventListener("change", () => {
        if (carType.value && benefitManual) benefitManual.value = "";
        recalc();
    });
    }
    if (taxPct) taxPct.addEventListener("change", recalc);
    if (allowance) allowance.addEventListener("input", recalc);

    if (btnYes) btnYes.addEventListener("click", () => setStandardMode(true));
    if (btnNo) btnNo.addEventListener("click", () => setStandardMode(false));
    if (startDate) startDate.addEventListener("change", recalc);
    if (endDate) endDate.addEventListener("change", recalc);

    // ====== Init (ריק, בלי ברירת מחדל) ======
    if (carType) carType.value = "";
    if (benefitManual) benefitManual.value = "";
    if (taxPct) taxPct.value = "";
    if (allowance) allowance.value = "";
    setStandardMode(true);
    dynamicCards.classList.add("hidden");
    recalc();
