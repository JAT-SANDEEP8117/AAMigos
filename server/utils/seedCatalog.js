import DeviceCategory from "../models/deviceCategories.js";

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
};
