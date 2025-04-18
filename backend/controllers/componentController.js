import db from "../config/db.js";

// Generic function (optional, for DRY)
const getComponentsByType = (type) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT (name, type) FROM components WHERE type = $1",
      [type],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.rows);
      }
    );
  });
};

export const getComponents = (req, res) => {
  db.query("SELECT (name, type) FROM components", (err, result) => {
    if (err) {
      console.error("Error fetching components:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json(result.rows);
  });
};

export const getGPUComponents = async (req, res) => {
  try {
    const rows = await getComponentsByType("GPU");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching GPU components:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCPUComponents = async (req, res) => {
  try {
    const rows = await getComponentsByType("CPU");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching CPU components:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMotherboardComponents = async (req, res) => {
  try {
    const rows = await getComponentsByType("Motherboard");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching Motherboard components:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
