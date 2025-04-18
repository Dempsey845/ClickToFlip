import fs from "fs";
import { parse } from "json2csv";

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
