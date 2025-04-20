import db from "../config/db.js";

// Generic function (optional, for DRY)
const getComponentsByType = (type, userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, name, type FROM components WHERE type = $1 AND (user_id = $2 OR user_id IS NULL)`,
      [type, userId],
      (err, result) => {
        if (err) return reject(err);

        resolve(result.rows);
      }
    );
  });
};

export const getComponents = (req, res) => {
  db.query(
    "SELECT id, name, type FROM components WHERE user_id = $1 OR user_id IS NULL",
    [req.user.id],
    (err, result) => {
      if (err) {
        console.error("Error fetching components:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json(result.rows);
    }
  );
};

export const getGPUComponents = async (req, res) => {
  try {
    const rows = await getComponentsByType("GPU", req.user.id);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching GPU components:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCPUComponents = async (req, res) => {
  try {
    const rows = await getComponentsByType("CPU", req.user.id);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching CPU components:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMotherboardComponents = async (req, res) => {
  try {
    const rows = await getComponentsByType("Motherboard", req.user.id);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching Motherboard components:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addUserComponent = async (req, res) => {
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const { name, type, brand, model, specs } = req.body;
  const user_id = req.user.id;

  if (!name || !type || !brand || !model) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Insert the user-specific component directly into the `components` table
    await db.query(
      `INSERT INTO components (user_id, name, type, brand, model, specs)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, name, type, brand, model, specs]
    );

    return res
      .status(200)
      .json({ message: "User component added successfully." });
  } catch (err) {
    console.error("Error adding user component:", err);
    return res
      .status(500)
      .json({ error: "Server error adding user component." });
  }
};
