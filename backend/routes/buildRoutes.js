import express from "express";
import fs from "fs";
import db from "../config/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

function deleteImageFromURL(imageURL) {
  try {
    const filename = imageURL.split("/uploads/")[1];
    const filePath = path.join(__dirname, "..", "uploads", filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
      } else {
        console.log(`Deleted image: ${filename}`);
      }
    });
  } catch (err) {
    console.error("Error processing image URL:", err);
  }
}

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
    const query = `
  SELECT 
    b.id,
    b.name,
    b.description,
    b.status,
    b.total_cost,
    b.sale_price,
    b.sold_date,
    b.profit,
    b.image_url,

    -- CPU: expect one
    cpu.cpu_id,
    cpu.name AS cpu_name,
    cpu.specs AS cpu_specs,

    -- GPUs: array of objects and array of IDs
    gpu.gpus,
    gpu.gpu_ids,

    -- Motherboard: expect one
    motherboard.motherboard_id,
    motherboard.name AS motherboard_name,
    motherboard.specs AS motherboard_specs

  FROM builds b

  -- CPU subquery: fetch one CPU per build
  LEFT JOIN (
    SELECT bc.build_id, c.id AS cpu_id, c.name, c.specs
    FROM build_components bc
    JOIN components c ON bc.component_id = c.id
    WHERE c.type = 'CPU'
  ) cpu ON b.id = cpu.build_id

  -- GPU subquery: fetch all GPUs for a build, including ids and JSON object (name + specs)
  LEFT JOIN (
    SELECT 
      bc.build_id, 
      ARRAY_AGG(c.id ORDER BY bc.component_id) AS gpu_ids,  -- Order by component_id instead of bc.id
      ARRAY_AGG(JSON_BUILD_OBJECT('id', c.id, 'name', c.name, 'specs', c.specs) ORDER BY bc.component_id) AS gpus  -- Full GPU objects
    FROM build_components bc
    JOIN components c ON bc.component_id = c.id
    WHERE c.type = 'GPU'
    GROUP BY bc.build_id
  ) gpu ON b.id = gpu.build_id

  -- Motherboard subquery: fetch one motherboard per build
  LEFT JOIN (
    SELECT bc.build_id, c.id AS motherboard_id, c.name, c.specs
    FROM build_components bc
    JOIN components c ON bc.component_id = c.id
    WHERE c.type = 'Motherboard'
  ) motherboard ON b.id = motherboard.build_id

  WHERE b.user_id = $1
  ORDER BY b.id DESC;
`;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(204).send(); // No builds
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching builds:", err);
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

    // Query to fetch build data with component names and specs
    const query = `
      SELECT 
        b.id, b.name, b.description, b.status, b.total_cost, b.sale_price, b.sold_date, b.profit,
        c_cpu.name AS cpu_name, 
        c_cpu.specs AS cpu_specs,
        ARRAY_AGG(DISTINCT c_gpu.name) AS gpu_names,  -- The old format: just GPU names
        ARRAY_AGG(DISTINCT jsonb_build_object('name', c_gpu.name, 'specs', c_gpu.specs)) AS gpus,  -- The new format with GPU specs
        c_motherboard.name AS motherboard_name,
        c_motherboard.specs AS motherboard_specs
      FROM builds b
      -- CPU Join
      LEFT JOIN build_components bc_cpu ON b.id = bc_cpu.build_id
      LEFT JOIN components c_cpu ON bc_cpu.component_id = c_cpu.id AND c_cpu.type = 'CPU'
      -- GPU Join
      LEFT JOIN build_components bc_gpu ON b.id = bc_gpu.build_id
      LEFT JOIN components c_gpu ON bc_gpu.component_id = c_gpu.id AND c_gpu.type = 'GPU'
      -- Motherboard Join
      LEFT JOIN build_components bc_motherboard ON b.id = bc_motherboard.build_id
      LEFT JOIN components c_motherboard ON bc_motherboard.component_id = c_motherboard.id AND c_motherboard.type = 'Motherboard'
      WHERE b.id = $1
      GROUP BY b.id, c_cpu.name, c_cpu.specs, c_motherboard.name, c_motherboard.specs;
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

router.post("/addGPU/:buildId", async (req, res) => {
  const buildId = parseInt(req.params.buildId);
  const gpuId = parseInt(Object.keys(req.body)[0], 10);

  if (!buildId || !gpuId) {
    return res.status(400).json({ error: "Invalid buildId or gpuId" });
  }

  try {
    await db.query(
      "INSERT INTO build_components (build_id, component_id) VALUES ($1, $2)",
      [buildId, gpuId]
    );
    res.status(201).json({ message: "GPU added to build successfully." });
  } catch (err) {
    console.error("Error adding GPU:", err);
    res.status(500).json({ error: "Failed to add GPU to build." });
  }
});

router.delete("/deleteGPU/:buildId", async (req, res) => {
  const buildId = parseInt(req.params.buildId, 10);
  const gpuId = parseInt(req.body.gpuId, 10);
  if (!buildId || !gpuId) {
    return res.status(400).json({ error: "Invalid buildId or gpuId" });
  }

  try {
    await db.query(
      `
      DELETE FROM build_components
      WHERE ctid IN (
        SELECT ctid FROM build_components
        WHERE build_id = $1 AND component_id = $2
        LIMIT 1
      )
      `,
      [buildId, gpuId]
    );

    res.status(201).json({ message: "GPU deleted from build successfully." });
  } catch (err) {
    console.error("Error deleting GPU:", err);
    res.status(500).json({ error: "Failed to delete GPU from build." });
  }
});

router.patch("/changeComponent/:prevComponentId/:buildId", async (req, res) => {
  const { prevComponentId, buildId } = req.params;
  const newComponentId = Number(Object.keys(req.body)[0]);
  const userId = req.user.id;

  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
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

    // Check if the previous component is in the build and exists in the components table
    const prevComponentCheck = await db.query(
      `
      SELECT bc.component_id 
      FROM build_components bc
      LEFT JOIN components c ON bc.component_id = c.id
      WHERE bc.build_id = $1 AND c.id = $2
      `,
      [buildId, prevComponentId]
    );

    if (prevComponentCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Previous component not found in this build." });
    }

    // Update the build_components table
    const result = await db.query(
      `
      UPDATE build_components
      SET component_id = $1
      WHERE build_id = $2 AND component_id = $3
      RETURNING *;
      `,
      [newComponentId, buildId, prevComponentId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Component not found in this build." });
    }

    return res.status(200).json({ message: "Component updated successfully." });
  } catch (err) {
    console.error("Error updating component:", err);
    return res.status(500).json({ error: "Server error updating component." });
  }
});

router.delete("/image/:filename", async (req, res) => {
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "uploads", filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting image:", err);
      return res.status(500).json({ error: "Failed to delete image." });
    }

    console.log(`Deleted image: ${filename}`);
    return res.status(200).json({ message: "Image deleted successfully." });
  });
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
    const build = check.rows[0];

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Forbidden. Not your build." });
    }

    // Delete the build
    await db.query("DELETE FROM builds WHERE id = $1", [buildId]);

    // Delete the image
    if (build.image_url) {
      const imageURL = build.image_url;
      deleteImageFromURL(imageURL);
    }

    return res.status(200).json({ message: "Build deleted successfully." });
  } catch (err) {
    console.error("Error deleting build:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
