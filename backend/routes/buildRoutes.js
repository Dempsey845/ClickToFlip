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

router.get("/:buildId", async (req, res) => {
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const userId = req.user.id;
  const { buildId } = req.params;

  try {
    // Check if the build belongs to the user
    const check = await db.query(
      "SELECT * FROM builds WHERE id = $1 AND user_id = $2",
      [buildId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Forbidden. Not your build." });
    }

    // Query to fetch build data with associated components (CPU, GPUs, Motherboard)
    const query = `SELECT b.id, b.name, b.description, b.status, b.total_cost, b.sale_price, b.sold_date, b.profit, 
       c_cpu.name AS cpu_name, 
       ARRAY_AGG(DISTINCT c_gpu.name) AS gpu_names, 
       c_motherboard.name AS motherboard_name
        FROM builds b
        -- Join to get CPU component for this build
        LEFT JOIN build_components bc_cpu ON b.id = bc_cpu.build_id
        LEFT JOIN components c_cpu ON bc_cpu.component_id = c_cpu.id AND c_cpu.type = 'CPU'  -- Only select CPUs
        -- Join to get GPU components for this build
        LEFT JOIN build_components bc_gpu ON b.id = bc_gpu.build_id
        LEFT JOIN components c_gpu ON bc_gpu.component_id = c_gpu.id AND c_gpu.type = 'GPU'  -- Only select GPUs
        -- Join to get Motherboard component for this build
        LEFT JOIN build_components bc_motherboard ON b.id = bc_motherboard.build_id
        LEFT JOIN components c_motherboard ON bc_motherboard.component_id = c_motherboard.id AND c_motherboard.type = 'Motherboard'  -- Only select Motherboards
        WHERE b.id = $1
        GROUP BY b.id, c_cpu.name, c_motherboard.name;
`;

    const result = await db.query(query, [buildId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Build not found." });
    }

    // Send the result back as JSON
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching build:", err);
    return res.status(500).json({ error: "Failed to fetch build." });
  }
});

router.patch("/:buildId", async (req, res) => {
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const userId = req.user.id;
  const { buildId } = req.params;

  // Destructure all potential fields
  const {
    name,
    description,
    total_cost,
    status,
    sale_price,
    sold_date,
    profit,
    image_url,
  } = req.body;

  if (!buildId) {
    return res.status(400).json({ error: "Missing build ID in params." });
  }

  try {
    // Check if the build belongs to the user
    const check = await db.query(
      "SELECT * FROM builds WHERE id = $1 AND user_id = $2",
      [buildId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Forbidden. Not your build." });
    }

    // Build the update query dynamically
    const fields = [];
    const values = [];
    let index = 1;

    if (name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }
    if (total_cost !== undefined) {
      fields.push(`total_cost = $${index++}`);
      values.push(total_cost);
    }
    if (status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(status);
    }
    if (sale_price !== undefined) {
      fields.push(`sale_price = $${index++}`);
      values.push(sale_price);
    }
    if (sold_date !== undefined) {
      fields.push(`sold_date = $${index++}`);
      values.push(sold_date);
    }
    if (profit !== undefined) {
      fields.push(`profit = $${index++}`);
      values.push(profit);
    }
    if (image_url !== undefined) {
      fields.push(`image_url = $${index++}`);
      values.push(image_url);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    values.push(buildId);
    const updateQuery = `
      UPDATE builds
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *;
    `;

    const result = await db.query(updateQuery, values);
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating build:", err);
    return res.status(500).json({ error: "Failed to update build." });
  }
});

router.delete("/:buildId", async (req, res) => {
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const userId = req.user.id;
  const { buildId } = req.params;

  try {
    // Check if the build belongs to the user
    const check = await db.query(
      "SELECT * FROM builds WHERE id = $1 AND user_id = $2",
      [buildId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Forbidden. Not your build." });
    }

    // Delete the build
    await db.query("DELETE FROM builds WHERE id = $1", [buildId]);

    return res.status(200).json({ message: "Build deleted successfully." });
  } catch (err) {
    console.error("Error deleting build:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
