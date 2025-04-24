import db from "../config/db.js";

// Generic function (optional, for DRY)
const getComponentsByType = (type, userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM components WHERE type = $1 AND (user_id = $2 OR user_id IS NULL)`,
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
    "SELECT * FROM components WHERE user_id = $1 OR user_id IS NULL",
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

export const getUserComponents = (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT * FROM components WHERE user_id = $1",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Error fetching user components: ", err);
        return result.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json(result).rows;
    }
  );
};

export const getUserComponentsByType = (req, res) => {
  const userId = req.user.id;
  const { type } = req.params;

  db.query(
    "SELECT * FROM components WHERE user_id = $1 AND type = $2",
    [userId, type],
    (err, result) => {
      if (err) {
        console.error("Error fetching user components: ", err);
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
    const result = await db.query(
      `INSERT INTO components (user_id, name, type, brand, model, specs)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, name, type, brand, model, specs]
    );

    const newComponent = result.rows[0];

    return res.status(200).json({
      message: "User component added successfully.",
      newComponent: newComponent,
    });
  } catch (err) {
    console.error("Error adding user component:", err);
    return res
      .status(500)
      .json({ error: "Server error adding user component." });
  }
};

export const updateUserComponent = async (req, res) => {
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const { id } = req.params;
  const { name, type, brand, model, specs } = req.body;
  const user_id = req.user.id;

  if (!name || !type || !brand || !model) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Check if the component belongs to the user
    const check = await db.query(
      `SELECT * FROM components WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({
        error: "Forbidden. Component not found or not owned by user.",
      });
    }

    const result = await db.query(
      `UPDATE components
       SET name = $1, type = $2, brand = $3, model = $4, specs = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, type, brand, model, specs, id, user_id]
    );

    const updatedComponent = result.rows[0];

    return res.status(200).json({
      message: "User component updated successfully.",
      updatedComponent,
    });
  } catch (err) {
    console.error("Error updating user component:", err);
    return res
      .status(500)
      .json({ error: "Server error updating user component." });
  }
};

export const deleteComponent = async (req, res) => {
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const { reference_id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM build_components WHERE id = $1 RETURNING *",
      [reference_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Component not found." });
    }

    return res.status(200).json({ message: "Component deleted successfully." });
  } catch (err) {
    console.error("Error deleting component:", err);
    return res.status(500).json({ error: "Server error deleting component." });
  }
};
