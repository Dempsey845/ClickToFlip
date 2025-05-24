import { useEffect, useState } from "react";
import { getUserCurrency, updateUserCurrency } from "../handlers/apiHandler";

const currencies = [
  { code: "GBP", symbol: "£" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

function CurrencySelector({ userId }) {
  if (!userId) return <div>Loading...</div>;

  const [currency, setCurrency] = useState();

  useEffect(() => {
    const loadUserCurrency = async () => {
      try {
        const c = await getUserCurrency(userId);
        setCurrency(c);
      } catch (err) {
        console.error("Failed to fetch currency:", err);
      }
    };
    loadUserCurrency();
  }, []);

  const onCurrencyChange = async (e) => {
    const selected = e.target.value;
    setCurrency(selected);
    try {
      await updateUserCurrency(userId, selected);
    } catch (err) {
      console.error("Currency update failed:", err);
    }
  };

  if (!currency) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mb-3 d-flex align-items-center justify-content-between">
      <label htmlFor="currency" className="form-label mb-0 me-3">
        <strong>Currency:</strong>
      </label>
      <select
        id="currency"
        className="form-select w-auto"
        value={currency}
        onChange={onCurrencyChange}
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CurrencySelector;
