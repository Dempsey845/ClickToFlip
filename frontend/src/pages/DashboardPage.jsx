import { useState, useEffect } from "react";
import AddBuildForm from "../components/AddBuildForm";
import Builds from "../components/Builds";
import { getUserBuilds, getUserData } from "../handlers/apiHandler";
import { useNavigate } from "react-router-dom";

function getCurrencySymbol(currencyCode) {
  const symbols = {
    AED: "د.إ", // UAE Dirham
    AUD: "A$", // Australian Dollar
    BGN: "лв", // Bulgarian Lev
    BRL: "R$", // Brazilian Real
    CAD: "C$", // Canadian Dollar
    CHF: "CHF", // Swiss Franc
    CNY: "¥", // Chinese Yuan
    CZK: "Kč", // Czech Koruna
    DKK: "kr", // Danish Krone
    EUR: "€", // Euro
    GBP: "£", // British Pound
    HKD: "HK$", // Hong Kong Dollar
    HUF: "Ft", // Hungarian Forint
    IDR: "Rp", // Indonesian Rupiah
    ILS: "₪", // Israeli New Shekel
    INR: "₹", // Indian Rupee
    JPY: "¥", // Japanese Yen
    KRW: "₩", // South Korean Won
    MXN: "$", // Mexican Peso
    MYR: "RM", // Malaysian Ringgit
    NOK: "kr", // Norwegian Krone
    NZD: "NZ$", // New Zealand Dollar
    PHP: "₱", // Philippine Peso
    PLN: "zł", // Polish Zloty
    RON: "lei", // Romanian Leu
    RUB: "₽", // Russian Ruble
    SAR: "﷼", // Saudi Riyal
    SEK: "kr", // Swedish Krona
    SGD: "S$", // Singapore Dollar
    THB: "฿", // Thai Baht
    TRY: "₺", // Turkish Lira
    USD: "$", // US Dollar
    VND: "₫", // Vietnamese Dong
    ZAR: "R", // South African Rand
  };

  return symbols[currencyCode.toUpperCase()] || currencyCode;
}

function DashboardPage({ onLogout, darkMode }) {
  const [builds, setBuilds] = useState([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [userData, setUserData] = useState();
  const navigate = useNavigate();

  const getBuilds = async () => {
    const result = await getUserBuilds();
    result && setBuilds(result);
  };

  useEffect(() => {
    getBuilds();
  }, [updateCount]);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserData();
      console.log("ud: ", data);
      setUserData(data);
    };

    loadUserData();
  }, []);

  const handleUpdate = async () => {
    setUpdateCount((prev) => prev + 1);
  };

  const cardClass = `card ${darkMode ? "bg-dark text-light" : ""}`;
  const specialCardClass = `card mb-4 p-4 shadow-sm ${
    darkMode ? "bg-dark text-light" : ""
  }`;

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Dashboard</h1>

      {/* Add Build Form */}
      <div className={cardClass}>
        <AddBuildForm
          onUpdate={handleUpdate}
          darkMode={darkMode}
          currency={getCurrencySymbol(userData.currency)}
        />
      </div>

      {/* Edit Components Card */}
      <div className={specialCardClass}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary">Edit Your Components</h5>
          <button
            onClick={() => {
              navigate("/my-components");
            }}
            className="btn btn-outline-primary d-flex align-items-center py-2 px-3"
          >
            <i className="bi bi-pencil-square fs-5 me-2"></i>
            Edit
          </button>
        </div>
      </div>

      {/* Builds Section */}
      <div className={cardClass}>
        <Builds
          builds={builds}
          onUpdate={handleUpdate}
          darkMode={darkMode}
          currency={getCurrencySymbol(userData.currency)}
        />
      </div>
    </div>
  );
}

export default DashboardPage;
