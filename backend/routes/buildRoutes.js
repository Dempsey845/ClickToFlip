import express from "express";
import fs from "fs";
import db from "../config/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

async function doesImageExistInMultipleBuilds(imageUrl) {
  try {
    const result = await db.query("SELECT 1 FROM builds WHERE image_url = $1", [
      imageUrl,
    ]);
    console.log(result.rows.length);
    return result.rows.length > 1;
  } catch (err) {
    console.error("Error checking image URL:", err);
    return false;
  }
}

router.get("/doesImageExistInMultipleBuilds/:filename", async (req, res) => {
  const existsInMultiple = await doesImageExistInMultipleBuilds(
    "/uploads/" + req.params.filename
  );
  return res.status(200).json({ existsInMultiple: existsInMultiple });
});

function deleteImageFromURL(imageUrl) {
  try {
    const filename = imageUrl.split("/uploads/")[1];
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
    imageUrl,
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
      INSERT INTO builds (name, description, status, total_cost, sale_price, sold_date, profit, image_url, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
        imageUrl || null,
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
    res.status(201).json({
      message: "Build created successfully",
      buildId,
    });
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
      cpu.brand AS cpu_brand,
      cpu.model AS cpu_model,
  
      -- GPUs: array of objects and array of IDs
      gpu.gpus,
      gpu.gpu_ids,
  
      -- Motherboard: expect one
      motherboard.motherboard_id,
      motherboard.name AS motherboard_name,
      motherboard.specs AS motherboard_specs,
      motherboard.brand AS motherboard_brand,
      motherboard.model AS motherboard_model,
  
      -- Unified components list
      all_components.components
  
    FROM builds b
  
    -- CPU subquery
    LEFT JOIN (
      SELECT bc.build_id, c.id AS cpu_id, c.name, c.specs, c.brand, c.model
      FROM build_components bc
      JOIN components c ON bc.component_id = c.id
      WHERE c.type = 'CPU'
    ) cpu ON b.id = cpu.build_id
  
    -- GPU subquery
    LEFT JOIN (
      SELECT 
        bc.build_id, 
        ARRAY_AGG(c.id ORDER BY bc.component_id) AS gpu_ids,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'id', c.id,
            'name', c.name,
            'brand', c.brand,
            'model', c.model,
            'specs', c.specs
          )
          ORDER BY bc.component_id
        ) AS gpus
      FROM build_components bc
      JOIN components c ON bc.component_id = c.id
      WHERE c.type = 'GPU'
      GROUP BY bc.build_id
    ) AS gpu ON b.id = gpu.build_id
  
    -- Motherboard subquery
    LEFT JOIN (
      SELECT bc.build_id, c.id AS motherboard_id, c.name, c.specs, c.brand, c.model
      FROM build_components bc
      JOIN components c ON bc.component_id = c.id
      WHERE c.type = 'Motherboard'
    ) motherboard ON b.id = motherboard.build_id
  
    -- All components with build_component ID
    LEFT JOIN (
      SELECT 
        bc.build_id,
        ARRAY_AGG(
          jsonb_build_object(
            'component_reference_id', bc.id,
            'component_id', c.id,
            'type', c.type,
            'name', c.name,
            'brand', c.brand,
            'model', c.model,
            'specs', c.specs
          )
          ORDER BY bc.id
        ) AS components
      FROM build_components bc
      JOIN components c ON bc.component_id = c.id
      GROUP BY bc.build_id
    ) all_components ON b.id = all_components.build_id
  
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

router.get("/buildComponents/:buildId", async (req, res) => {
  const { buildId } = req.params;

  try {
    const result = await db.query(
      "SELECT component_id FROM build_components WHERE build_id = $1",
      [buildId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No build components found" });
    }

    const componentIds = result.rows.map((row) => row.component_id);

    return res.status(200).json({
      message: "Got build components successfully",
      componentIds,
    });
  } catch (err) {
    console.error("Error fetching build components:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:buildId", async (req, res) => {
  /*
  if (!req.isAuthenticated()) {
    console.error("Unauthorized: User not authenticated.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
    */

  //const userId = req.user.id;
  const { buildId } = req.params;

  try {
    /*
    // Check if the build belongs to the user
    const check = await db.query(
      "SELECT * FROM builds WHERE id = $1 AND user_id = $2",
      [buildId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Forbidden. Not your build." });
    }
      */

    const query = `SELECT 
  b.id,
  b.name,
  b.description,
  b.status,
  b.total_cost,
  b.sale_price,
  b.sold_date,
  b.profit,
  b.image_url,
  b.user_id,

  -- CPU: expect one
  cpu.cpu_id,
  cpu.name AS cpu_name,
  cpu.specs AS cpu_specs,
  cpu.brand AS cpu_brand,
  cpu.model AS cpu_model,

  -- GPUs: array of objects and array of IDs
  gpu.gpus,
  gpu.gpu_ids,

  -- Motherboard: expect one
  motherboard.motherboard_id,
  motherboard.name AS motherboard_name,
  motherboard.specs AS motherboard_specs,
  motherboard.brand AS motherboard_brand,
  motherboard.model AS motherboard_model,

  -- Unified components list
  all_components.components

FROM builds b

-- CPU subquery
LEFT JOIN (
  SELECT bc.build_id, c.id AS cpu_id, c.name, c.specs, c.brand, c.model
  FROM build_components bc
  JOIN components c ON bc.component_id = c.id
  WHERE c.type = 'CPU'
) cpu ON b.id = cpu.build_id

-- GPU subquery
LEFT JOIN (
  SELECT 
    bc.build_id, 
    ARRAY_AGG(c.id ORDER BY bc.component_id) AS gpu_ids,
    ARRAY_AGG(
      JSON_BUILD_OBJECT(
        'id', c.id,
        'name', c.name,
        'brand', c.brand,
        'model', c.model,
        'specs', c.specs
      )
      ORDER BY bc.component_id
    ) AS gpus
  FROM build_components bc
  JOIN components c ON bc.component_id = c.id
  WHERE c.type = 'GPU'
  GROUP BY bc.build_id
) AS gpu ON b.id = gpu.build_id

-- Motherboard subquery
LEFT JOIN (
  SELECT bc.build_id, c.id AS motherboard_id, c.name, c.specs, c.brand, c.model
  FROM build_components bc
  JOIN components c ON bc.component_id = c.id
  WHERE c.type = 'Motherboard'
) motherboard ON b.id = motherboard.build_id

-- All components with build_component ID
LEFT JOIN (
  SELECT 
    bc.build_id,
    ARRAY_AGG(
      jsonb_build_object(
        'component_reference_id', bc.id,
        'component_id', c.id,
        'type', c.type,
        'name', c.name,
        'brand', c.brand,
        'model', c.model,
        'specs', c.specs
      )
      ORDER BY bc.id
    ) AS components
  FROM build_components bc
  JOIN components c ON bc.component_id = c.id
  GROUP BY bc.build_id
) all_components ON b.id = all_components.build_id

WHERE b.id = $1;
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
    const result = await db.query(
      "INSERT INTO build_components (build_id, component_id) VALUES ($1, $2) RETURNING id",
      [buildId, gpuId]
    );

    const componentId = result.rows[0].id;

    res.status(201).json({
      message: "GPU added to build successfully.",
      componentId: componentId,
    });
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
      RETURNING id AS reference_id, component_id;
      `,
      [newComponentId, buildId, prevComponentId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Component not found in this build." });
    }

    return res.status(200).json({
      message: "Component updated successfully.",
      updatedComponent: {
        reference_id: result.rows[0].reference_id,
        component_id: result.rows[0].component_id,
      },
    });
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

  try {
    const imageExistsInOtherBuilds = await doesImageExistInMultipleBuilds(
      `/uploads/${filename}`
    );

    // If the image is used in other builds, don't delete it
    if (imageExistsInOtherBuilds) {
      return res.status(200).json({
        message: "Image still in use by other builds. Not deleted.",
      });
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
        return res.status(500).json({ error: "Failed to delete image." });
      }

      console.log(`Deleted image: ${filename}`);
      return res.status(200).json({ message: "Image deleted successfully." });
    });
  } catch (err) {
    console.error("Error checking image usage:", err);
    return res.status(500).json({ error: "Server error." });
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

    const build = check.rows[0];

    if (!build) {
      return res.status(403).json({ error: "Forbidden. Not your build." });
    }

    const imageExistsInOtherBuilds = await doesImageExistInMultipleBuilds(
      build.image_url
    );

    // Delete the build
    await db.query("DELETE FROM builds WHERE id = $1", [buildId]);

    // Conditionally delete the image file if it's not used elsewhere
    let imageMessage = null;

    if (build.image_url) {
      const imageURL = build.image_url;

      if (!imageExistsInOtherBuilds) {
        deleteImageFromURL(imageURL, build.id);
        imageMessage = "Image deleted.";
      } else {
        imageMessage = "Image still in use by other builds. Not deleted.";
      }
    }

    return res.status(200).json({
      message: "Build deleted successfully.",
      ...(imageMessage && { image: imageMessage }),
    });
  } catch (err) {
    console.error("Error deleting build:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
