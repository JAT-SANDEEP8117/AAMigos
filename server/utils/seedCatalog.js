import DeviceCategory from "../models/deviceCategories.js";
import Company from "../models/companies.js";

const DEFAULT_CATEGORIES = ["Smartphones", "Tablets", "Laptops"];

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
};
