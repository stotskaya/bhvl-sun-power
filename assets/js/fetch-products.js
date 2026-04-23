const fs = require("fs");
const path = require("path");
const DATA_SOURCE = "./data/products.json";
const OUTPUT_DIR = "./content/products";

function generate() {
  try {
    if (!fs.existsSync(DATA_SOURCE)) {
      console.error("❌ Помилка: Файл data/products.json не знайдено!");
      return;
    }
    const products = JSON.parse(fs.readFileSync(DATA_SOURCE, "utf8"));

    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const indexContent = `---\ntitle: "Catalog"\nlayout: "list"\nsubtitle: "Products and services curated for elegant, resilient residential energy."\n---`;
    fs.writeFileSync(path.join(OUTPUT_DIR, "_index.md"), indexContent);

   products.forEach((p) => {
     const fileName = `${p.sku.toLowerCase()}.md`;
     const content = `---
title: "${p.title}"
product_id: "${p.sku}"
category: "${p.category}"
price: ${p.price}
currency: "${p.currency}"
image: "${p.image}"
layout: "single"
tags: "${p.tags || ""}"
rating: "${p.rating}"
reviews: "${p.reviews}"
---
${p.description}`;

     fs.writeFileSync(path.join(OUTPUT_DIR, fileName), content);
   });

    console.log(
      `✅ Успішно! Створено ${products.length} файлів у ${OUTPUT_DIR}`
    );
  } catch (err) {
    console.error("❌ Щось пішло не так:", err);
  }
}

generate();
