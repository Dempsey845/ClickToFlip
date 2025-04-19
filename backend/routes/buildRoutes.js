import express from "express";
import db from "../config/db.js";
const router = express.Router();

// POST /api/builds
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const userId = req.user.id;

  const {
    name,
    description,
    status,
    total_cost,
    sale_price,
    sold_date,
    profit,
    componentIds,
  } = req.body;

  if (!name || !componentIds || componentIds.length === 0) {
    return res
      .status(400)
      .json({ error: "Build name and at least one component are required." });
  }

  const client = await db.connect(); // ✅ get a dedicated client from the pool

  try {
    await client.query("BEGIN");

    // Validate all component IDs inside the transaction
    for (const componentId of componentIds) {
      const result = await client.query(
        `SELECT 1 FROM components WHERE id = $1;`,
        [componentId]
      );
      if (result.rows.length === 0) {
        throw new Error(`Component with ID ${componentId} does not exist.`);
      }
    }

    const buildResult = await client.query(
      `
      INSERT INTO builds (name, description, status, total_cost, sale_price, sold_date, profit, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `,
      [
        name,
        description || null,
        status || "planned",
        total_cost || null,
        sale_price || null,
        sold_date || null,
        profit || null,
        userId,
      ]
    );

    const buildId = buildResult.rows[0].id;

    for (const componentId of componentIds) {
      await client.query(
        `INSERT INTO build_components (build_id, component_id) VALUES ($1, $2);`,
        [buildId, componentId]
      );
    }

    await client.query("COMMIT");
    console.log("Transaction committed.");
    res.status(201).json({ message: "Build created successfully", buildId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating build:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  } finally {
    client.release(); // ✅ release client back to pool
  }
});

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const userId = req.user.id;

  try {
    const result = await db.query("SELECT * FROM builds WHERE user_id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(204).send(); // 204 No Content
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to query db for user builds" });
  }
});

export default router;
