import DeviceCategory from "../models/deviceCategories.js";
import Company from "../models/companies.js";
import DeviceModel from "../models/deviceModels.js";

const DEFAULT_CATEGORIES = ["Smartphones", "Tablets", "Laptops"];

const CATEGORY_IMAGES = {
  Smartphones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=320&q=80",
  Laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=320&q=80",
  Tablets: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=320&q=80",
};

const DEFAULT_MODELS = {
  Smartphones: [["Apple", "iPhone 15"], ["Samsung", "Galaxy S24"], ["Google", "Pixel 8"], ["OnePlus", "OnePlus 12"], ["Xiaomi", "Xiaomi 14"]],
  Laptops: [["Apple", "MacBook Air"], ["Dell", "XPS 13"], ["HP", "Pavilion 15"], ["Lenovo", "ThinkPad E14"], ["Asus", "VivoBook 15"]],
  Tablets: [["Apple", "iPad Air"], ["Samsung", "Galaxy Tab S9"], ["Lenovo", "Tab P12"], ["Xiaomi", "Pad 6"]],
};

export const seedCatalog = async () => {
  await DeviceCategory.bulkWrite(
    DEFAULT_CATEGORIES.map((name) => ({
      updateOne: {
        filter: { name },
        update: { $setOnInsert: { name } },
        upsert: true,
      },
    })),
  );

  const categories = await DeviceCategory.find({ name: { $in: DEFAULT_CATEGORIES } });
  const categoryByName = new Map(categories.map((category) => [category.name, category._id]));
  const defaults = {
    Smartphones: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Oppo", "Vivo", "Realme", "Motorola", "Nothing"],
    Laptops: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "MSI"],
    Tablets: ["Apple", "Samsung", "Lenovo", "Xiaomi", "Microsoft", "Huawei"],
  };

  for (const [categoryName, companyNames] of Object.entries(defaults)) {
    const categoryId = categoryByName.get(categoryName);
    if (!categoryId) continue;
    for (const name of companyNames) {
      const company = await Company.findOneAndUpdate(
        { name },
        { $addToSet: { categories: categoryId } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      await DeviceCategory.findByIdAndUpdate(categoryId, { $addToSet: { companies: company._id } });
    }
  }

  for (const [categoryName, models] of Object.entries(DEFAULT_MODELS)) {
    const categoryId = categoryByName.get(categoryName);
    if (!categoryId) continue;

    for (const [companyName, name] of models) {
      const company = await Company.findOne({ name: companyName, categories: categoryId });
      if (!company) continue;

      const model = await DeviceModel.findOneAndUpdate(
        { name, company: company._id, category: categoryId },
        { $setOnInsert: { name, company: company._id, category: categoryId, img: CATEGORY_IMAGES[categoryName] } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      await Company.findByIdAndUpdate(company._id, { $addToSet: { models: model._id } });
    }
  }
};
