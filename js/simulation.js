/**
 * 積立投資シミュレーション計算ロジック
 */

/**
 * 複利積立計算
 * @param {number} monthly - 毎月の積立額（円）
 * @param {number} annualRate - 年利（%）
 * @param {number} years - 運用期間（年）
 * @param {number} initial - 初期投資額（円）
 * @returns {{ yearly: Array, total: number, principal: number, gain: number }}
 */
function calcInvestment(monthly, annualRate, years, initial = 0) {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  const yearly = [];

  let balance = initial;
  let totalPrincipal = initial;

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthly;
    totalPrincipal += monthly;

    if (m % 12 === 0) {
      yearly.push({
        year: m / 12,
        balance: Math.round(balance),
        principal: Math.round(totalPrincipal),
        gain: Math.round(balance - totalPrincipal),
      });
    }
  }

  return {
    yearly,
    total: Math.round(balance),
    principal: Math.round(totalPrincipal),
    gain: Math.round(balance - totalPrincipal),
  };
}

/**
 * 数値を「万円」表示にフォーマット
 */
function formatMan(yen) {
  if (yen >= 1_0000_0000) {
    return (yen / 1_0000_0000).toFixed(1) + '億円';
  }
  if (yen >= 10000) {
    return Math.round(yen / 10000).toLocaleString() + '万円';
  }
  return yen.toLocaleString() + '円';
}

/**
 * 数値を3桁カンマ区切りの円表示
 */
function formatYen(yen) {
  return yen.toLocaleString() + '円';
}

export { calcInvestment, formatMan, formatYen };
