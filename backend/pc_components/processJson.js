import fs from "fs";
import { parse } from "json2csv";

function generateProcessorCSV() {
  // Path to the JSON file
  const filePath = "./processors.json";

  // Read the JSON file asynchronously
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Parse the JSON string into a JavaScript object
    const processors = JSON.parse(data);

    // Process the components (example)
    const components = processors.map((processor) => {
      const name = processor.name;
      const brand = name.split(" ")[0]; // Extract brand (first word)
      const model = name.split(" ")[1] + " " + name.split(" ")[2]; // Extract model (second and third word)
      const specs = `Cores: ${processor.cores}, TDP: ${processor.tdp}W`;

      return {
        name,
        type: "CPU",
        brand,
        model,
        specs,
      };
    });

    const csv = parse(components);

    // Write the CSV data to a file
    fs.writeFileSync("processors.csv", csv);

    console.log("CSV file has been created: processors.csv");
  });
}

function generateGpuCSV() {
  const filePath = "./graphic_cards.json";

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    const gpus = JSON.parse(data);

    const components = gpus
      .map((gpu) => {
        const name = gpu.name.trim();
        if (!name) return null;

        // Try to infer brand from name (NVIDIA, AMD, Radeon, GeForce, etc.)
        const brandMatch = name.match(/\b(AMD|NVIDIA|Radeon|GeForce)\b/i);
        const brand = brandMatch ? brandMatch[0].toUpperCase() : "UNKNOWN";

        // Infer model by dropping known memory prefixes and taking rest
        const model = name.replace(/^(\d+MB|\d+\sDDR|DDR)?\s*/i, "").trim();

        // Try to pull out specs from the name
        const memoryMatch = name.match(/\d+MB|\d+\sDDR/i);
        const memory = memoryMatch
          ? memoryMatch[0].replace(/\s/, "")
          : "Unknown";

        const specs = `Memory: ${memory}`;

        return {
          name,
          type: "GPU",
          brand,
          model,
          specs,
        };
      })
      .filter(Boolean); // Remove nulls

    const csv = parse(components);

    fs.writeFileSync("gpus.csv", csv);
    console.log("CSV file has been created: gpus.csv");
  });
}

function generateMotherboardCSV() {
  const filePath = "./motherboards.json";

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    const motherboards = JSON.parse(data);

    const components = motherboards.map((mb) => {
      const name = mb.name;
      const brand = name.split(" ")[0]; // usually the first word is the brand
      const model = name.split(" ").slice(1).join(" "); // the rest is the model
      const specs = `Socket: ${mb.socket}, Chipset: ${mb.chipset}`;

      return {
        name,
        type: "Motherboard",
        brand,
        model,
        specs,
      };
    });

    const csv = parse(components);

    fs.writeFileSync("motherboards.csv", csv);

    console.log("CSV file has been created: motherboards.csv");
  });
}

generateMotherboardCSV();
