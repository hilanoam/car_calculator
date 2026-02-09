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
const btnYes = document.getElementById("btnStandardYes");
const btnNo = document.getElementById("btnStandardNo");
const field2Card = document.getElementById("field2Card");

const carType = document.getElementById("carType");
const benefitManual = document.getElementById("benefitManual");
const taxPct = document.getElementById("taxPct");
const allowance = document.getElementById("allowance");

// Inline / summary
const totalRatePct = document.getElementById("totalRatePct");
const taxPctInline = document.getElementById("taxPctInline");
const rInline = document.getElementById("rInline");
const benefitInline = document.getElementById("benefitInline");
const allowanceInline = document.getElementById("allowanceInline");

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
const cost1Value = document.getElementById("cost1Value");
const net2Value = document.getElementById("net2Value");

// ====== State ======
let hasStandard = true;

// ====== UI helpers ======
function setStandardMode(isYes) {
  hasStandard = isYes;

  // Toggle styles
  if (isYes) {
    btnYes.className = "px-4 py-2 rounded-2xl border border-white/50 bg-white/80 hover:bg-white/95 transition shadow-sm text-sm";
    btnNo.className  = "px-4 py-2 rounded-2xl border border-white/40 bg-white/30 hover:bg-white/60 transition text-sm";
    field2Card.classList.remove("hidden");
  } else {
    btnYes.className = "px-4 py-2 rounded-2xl border border-white/40 bg-white/30 hover:bg-white/60 transition text-sm";
    btnNo.className  = "px-4 py-2 rounded-2xl border border-white/50 bg-white/80 hover:bg-white/95 transition shadow-sm text-sm";
    field2Card.classList.add("hidden");

    // כשאין תקינה – מאפסים שדה 2 כדי שלא “ישפיע”
    allowance.value = "";
  }

  recalc();
}

// ====== Calculation ======
function getBenefitValue() {
  // אם יש ערך ידני – הוא גובר
  const manual = toNum(benefitManual.value);
  if (manual > 0) return manual;

  // אחרת – לפי סוג רכב
  return CAR_VALUES[carType.value] ?? 0;
}

function recalc() {
  const B = getBenefitValue();
  const A = hasStandard ? toNum(allowance.value) : 0;

  const T = pctToNum(taxPct.value);
  const R = T + FIXED_NI + FIXED_HEALTH;

  // שדה 1: סכום ניכוי על ההטבה
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
  const final = cost1 - (hasStandard ? net2 : 0);

  // ====== Render ======
  taxPctInline.textContent = `${taxPct.value}%`;
  totalRatePct.textContent = `${Math.round(R * 10000) / 100}%`;
  rInline.textContent = `${Math.round(R * 10000) / 100}%`;

  benefitInline.textContent = `${money(B)}`;
  allowanceInline.textContent = `${money(A)}`;

  // Field 1 breakdown
  taxOnBenefit.textContent = money(taxB);
  nOnBenefit.textContent = money(niB);
  hOnBenefit.textContent = money(healthB);
  sumBenefit.textContent = money(cost1);

  // Field 2 breakdown
  taxPct2.textContent = `${taxPct.value}%`;
  taxOnAllowance.textContent = money(taxA);
  nOnAllowance.textContent = money(niA);
  hOnAllowance.textContent = money(healthA);
  netAllowance.textContent = money(net2);

  // Final
  cost1Value.textContent = money(cost1);
  net2Value.textContent = money(hasStandard ? net2 : 0);
  finalValue.textContent = money(final);
}

// ====== Events ======
btnYes.addEventListener("click", () => setStandardMode(true));
btnNo.addEventListener("click", () => setStandardMode(false));

carType.addEventListener("change", recalc);
benefitManual.addEventListener("input", recalc);
taxPct.addEventListener("change", recalc);
allowance.addEventListener("input", recalc);

// ====== Init ======
setStandardMode(true);

// דמו מהיר לפי הדוגמה שלך (אפשר למחוק):
benefitManual.value = 500;
taxPct.value = "35";
allowance.value = 355;
recalc();
