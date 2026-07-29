import {
  CreateInventoryLevelInput,
  ExecArgs,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { ProductStatus } from "@mercurjs/types";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";
import { createSellerDefaultsWorkflow } from "@mercurjs/core/workflows";
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";

const updateStoreCurrencies = createWorkflow(
  "nople-update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => ({
      selector: { id: data.input.store_id },
      update: {
        supported_currencies: data.input.supported_currencies.map(
          (currency) => ({
            currency_code: currency.currency_code,
            is_default: currency.is_default ?? false,
          })
        ),
      },
    }));

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

const COFFEE_CATEGORY_NAMES = [
  "Arabica Beans",
  "Robusta Beans",
  "Blended Roasts",
  "Ground Coffee",
  "Coffee Equipment",
];

const PRODUCT_HANDLES = [
  "ethiopia-yirgacheffe-arabica",
  "brazil-santos-arabica",
  "vietnam-robusta",
  "house-blend",
  "espresso-ground",
];

const COFFEE_IMAGE = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop`;

export default async function seedNopleCoffeeData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  // Coffee-producing & consuming countries for the B2B marketplace region.
  const countries = ["eg", "sa", "ae", "ye", "et", "br", "vn", "us", "gb", "de"];

  logger.info("[Nople] Seeding coffee marketplace store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        { currency_code: "usd", is_default: true },
        { currency_code: "eur" },
        { currency_code: "egp" },
        { currency_code: "sar" },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_sales_channel_id: defaultSalesChannel[0].id },
    },
  });

  logger.info("[Nople] Seeding region data...");
  const regionModuleService = container.resolve(Modules.REGION);

  const existingRegions = await regionModuleService.listRegions(
    {},
    { relations: ["countries"] }
  );

  const assignedCountries = new Set<string>();
  for (const r of existingRegions) {
    for (const c of r.countries || []) {
      assignedCountries.add(c.iso_2);
    }
  }

  const unassignedCountries = countries.filter(
    (c) => !assignedCountries.has(c)
  );

  let region;
  if (unassignedCountries.length === 0) {
    region =
      existingRegions.find((r) =>
        r.countries?.some((c) => countries.includes(c.iso_2))
      ) || existingRegions[0];
    logger.info(
      "[Nople] Countries already assigned to a region, skipping region creation."
    );
  } else {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Coffee Trade Region",
            currency_code: "usd",
            countries: unassignedCountries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  }

  logger.info("[Nople] Seeding tax regions...");
  const taxModuleService = container.resolve(Modules.TAX);
  const existingTaxRegions = await taxModuleService.listTaxRegions();
  const existingCountryCodes = new Set(
    existingTaxRegions.map((tr) => tr.country_code)
  );
  const countriesToCreate = countries.filter(
    (c) => !existingCountryCodes.has(c)
  );

  if (countriesToCreate.length > 0) {
    await createTaxRegionsWorkflow(container).run({
      input: countriesToCreate.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  }

  logger.info("[Nople] Seeding stock location...");
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const existingStockLocations = await stockLocationModule.listStockLocations({
    name: "Nople Coffee Hub",
  });

  let stockLocation;
  if (existingStockLocations.length) {
    stockLocation = existingStockLocations[0];
    logger.info("[Nople] Stock location 'Nople Coffee Hub' already exists.");
  } else {
    const { result: stockLocationResult } =
      await createStockLocationsWorkflow(container).run({
        input: {
          locations: [
            {
              name: "Nople Coffee Hub",
              address: {
                city: "Cairo",
                country_code: "EG",
                address_1: "Nople Coffee Trade District",
              },
            },
          ],
        },
      });
    stockLocation = stockLocationResult[0];
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocation.id },
    },
  });

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });
  } catch (error: unknown) {
    if (
      !(error instanceof Error && error.message.includes("already exists"))
    ) {
      throw error;
    }
  }

  logger.info("[Nople] Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [{ name: "Default Shipping Profile", type: "default" }],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const existingFulfillmentSets =
    await fulfillmentModuleService.listFulfillmentSets({
      name: "Nople Coffee Delivery",
    });

  let fulfillmentSet;
  if (existingFulfillmentSets.length) {
    fulfillmentSet = existingFulfillmentSets[0];
  } else {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Nople Coffee Delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Middle East & Africa",
          geo_zones: [
            { country_code: "eg", type: "country" },
            { country_code: "sa", type: "country" },
            { country_code: "ae", type: "country" },
            { country_code: "ye", type: "country" },
            { country_code: "et", type: "country" },
          ],
        },
        {
          name: "Americas & Europe",
          geo_zones: [
            { country_code: "br", type: "country" },
            { country_code: "vn", type: "country" },
            { country_code: "us", type: "country" },
            { country_code: "gb", type: "country" },
            { country_code: "de", type: "country" },
          ],
        },
      ],
    });

    try {
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
        [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
      });
    } catch (error: unknown) {
      if (
        !(error instanceof Error && error.message.includes("already exists"))
      ) {
        throw error;
      }
    }

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Coffee Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Green & roasted coffee shipped in 5-7 days.",
            code: "standard",
          },
          prices: [
            { currency_code: "usd", amount: 15 },
            { currency_code: "eur", amount: 14 },
            { region_id: region.id, amount: 15 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "Express Cold Chain",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Temperature-controlled coffee delivery in 48 hours.",
            code: "express",
          },
          prices: [
            { currency_code: "usd", amount: 35 },
            { currency_code: "eur", amount: 32 },
            { region_id: region.id, amount: 35 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });
  }

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [defaultSalesChannel[0].id] },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already"))) {
      throw error;
    }
  }

  logger.info("[Nople] Seeding publishable API key...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: { type: "publishable" },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          { title: "Nople Webshop", type: "publishable", created_by: "" },
        ],
      },
    });
    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: publishableApiKey.id, add: [defaultSalesChannel[0].id] },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already"))) {
      throw error;
    }
  }

  logger.info("[Nople] Seeding coffee product categories...");
  const productCategoryModule = container.resolve(Modules.PRODUCT);
  const existingCategories = await productCategoryModule.listProductCategories({
    name: COFFEE_CATEGORY_NAMES,
  });

  let categoryResult;
  if (existingCategories.length === COFFEE_CATEGORY_NAMES.length) {
    categoryResult = existingCategories;
    logger.info("[Nople] Coffee categories already exist, skipping.");
  } else {
    const categoriesToCreate = COFFEE_CATEGORY_NAMES.filter(
      (name) => !existingCategories.find((c) => c.name === name)
    );
    const { result: newCategories } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: categoriesToCreate.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
    categoryResult = [...existingCategories, ...newCategories];
  }

  const findCat = (name: string) =>
    categoryResult.find((cat: { name: string }) => cat.name === name)!.id;

  logger.info("[Nople] Seeding coffee products...");
  const existingProducts = await productCategoryModule.listProducts({
    handle: PRODUCT_HANDLES,
  });

  if (existingProducts.length === PRODUCT_HANDLES.length) {
    logger.info("[Nople] Coffee products already exist, skipping.");
  } else {
    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Ethiopia Yirgacheffe Arabica — Green Beans",
            category_ids: [findCat("Arabica Beans")],
            description:
              "Single-origin Yirgacheffe Arabica green beans from the highlands of Ethiopia. Floral, citrus, and tea-like with a clean cup profile. Ideal for specialty roasters. Sold per kilogram.",
            handle: "ethiopia-yirgacheffe-arabica",
            weight: 1000,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              {
                url: COFFEE_IMAGE(
                  "1447933601400-1abdbb4f4a8c"
                ),
              },
            ],
            options: [
              { title: "Weight", values: ["1kg", "5kg", "25kg"] },
              { title: "Processing", values: ["Washed", "Natural"] },
            ],
            variants: [
              {
                title: "1kg / Washed",
                sku: "YIRG-1KG-WASHED",
                options: { Weight: "1kg", Processing: "Washed" },
                prices: [
                  { amount: 18, currency_code: "usd" },
                  { amount: 16, currency_code: "eur" },
                ],
              },
              {
                title: "5kg / Washed",
                sku: "YIRG-5KG-WASHED",
                options: { Weight: "5kg", Processing: "Washed" },
                prices: [
                  { amount: 80, currency_code: "usd" },
                  { amount: 72, currency_code: "eur" },
                ],
              },
              {
                title: "25kg / Washed",
                sku: "YIRG-25KG-WASHED",
                options: { Weight: "25kg", Processing: "Washed" },
                prices: [
                  { amount: 360, currency_code: "usd" },
                  { amount: 320, currency_code: "eur" },
                ],
              },
              {
                title: "1kg / Natural",
                sku: "YIRG-1KG-NATURAL",
                options: { Weight: "1kg", Processing: "Natural" },
                prices: [
                  { amount: 19, currency_code: "usd" },
                  { amount: 17, currency_code: "eur" },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Brazil Santos Arabica — Green Beans",
            category_ids: [findCat("Arabica Beans")],
            description:
              "Brazilian Santos Arabica green beans. Nutty, chocolatey, and low-acidity — a workhorse espresso base for blends. Sold per kilogram.",
            handle: "brazil-santos-arabica",
            weight: 1000,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              { url: COFFEE_IMAGE("1559598536287-f3c01f4bf94c") },
            ],
            options: [
              { title: "Weight", values: ["1kg", "5kg", "25kg"] },
            ],
            variants: [
              {
                title: "1kg",
                sku: "SANTOS-1KG",
                options: { Weight: "1kg" },
                prices: [
                  { amount: 12, currency_code: "usd" },
                  { amount: 11, currency_code: "eur" },
                ],
              },
              {
                title: "5kg",
                sku: "SANTOS-5KG",
                options: { Weight: "5kg" },
                prices: [
                  { amount: 55, currency_code: "usd" },
                  { amount: 50, currency_code: "eur" },
                ],
              },
              {
                title: "25kg",
                sku: "SANTOS-25KG",
                options: { Weight: "25kg" },
                prices: [
                  { amount: 250, currency_code: "usd" },
                  { amount: 225, currency_code: "eur" },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Vietnam Robusta — Green Beans",
            category_ids: [findCat("Robusta Beans")],
            description:
              "Vietnamese Robusta green beans. Bold, bitter, high-caffeine, and thick crema. The backbone of traditional espresso and iced coffee. Sold per kilogram.",
            handle: "vietnam-robusta",
            weight: 1000,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              { url: COFFEE_IMAGE("1497932130837-f3c01f4bf94c") },
            ],
            options: [
              { title: "Weight", values: ["1kg", "5kg", "25kg"] },
            ],
            variants: [
              {
                title: "1kg",
                sku: "ROB-VN-1KG",
                options: { Weight: "1kg" },
                prices: [
                  { amount: 8, currency_code: "usd" },
                  { amount: 7, currency_code: "eur" },
                ],
              },
              {
                title: "5kg",
                sku: "ROB-VN-5KG",
                options: { Weight: "5kg" },
                prices: [
                  { amount: 36, currency_code: "usd" },
                  { amount: 32, currency_code: "eur" },
                ],
              },
              {
                title: "25kg",
                sku: "ROB-VN-25KG",
                options: { Weight: "25kg" },
                prices: [
                  { amount: 160, currency_code: "usd" },
                  { amount: 145, currency_code: "eur" },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Nople House Blend — Roasted",
            category_ids: [findCat("Blended Roasts")],
            description:
              "A balanced 70/30 Arabica-Robusta blend roasted medium-dark. Caramel, hazelnut, and a smooth finish. Whole beans, freshly roasted to order.",
            handle: "house-blend",
            weight: 1000,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              { url: COFFEE_IMAGE("1559056199-6410ef3c0f4a") },
            ],
            options: [
              { title: "Weight", values: ["250g", "1kg", "5kg"] },
              { title: "Grind", values: ["Whole Bean", "Fine", "Medium", "Coarse"] },
            ],
            variants: [
              {
                title: "250g / Whole Bean",
                sku: "HOUSE-250G-WHOLE",
                options: { Weight: "250g", Grind: "Whole Bean" },
                prices: [
                  { amount: 9, currency_code: "usd" },
                  { amount: 8, currency_code: "eur" },
                ],
              },
              {
                title: "1kg / Whole Bean",
                sku: "HOUSE-1KG-WHOLE",
                options: { Weight: "1kg", Grind: "Whole Bean" },
                prices: [
                  { amount: 28, currency_code: "usd" },
                  { amount: 25, currency_code: "eur" },
                ],
              },
              {
                title: "5kg / Whole Bean",
                sku: "HOUSE-5KG-WHOLE",
                options: { Weight: "5kg", Grind: "Whole Bean" },
                prices: [
                  { amount: 120, currency_code: "usd" },
                  { amount: 108, currency_code: "eur" },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Espresso Ground Coffee — Pre-Ground",
            category_ids: [findCat("Ground Coffee")],
            description:
              "Finely ground espresso coffee, ready for immediate use in commercial espresso machines. Consistent particle size for reliable extraction.",
            handle: "espresso-ground",
            weight: 500,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              { url: COFFEE_IMAGE("1559598536-8b8c8c8c8c8c") },
            ],
            options: [
              { title: "Weight", values: ["250g", "500g", "1kg"] },
            ],
            variants: [
              {
                title: "250g",
                sku: "ESP-GROUND-250",
                options: { Weight: "250g" },
                prices: [
                  { amount: 7, currency_code: "usd" },
                  { amount: 6, currency_code: "eur" },
                ],
              },
              {
                title: "500g",
                sku: "ESP-GROUND-500",
                options: { Weight: "500g" },
                prices: [
                  { amount: 13, currency_code: "usd" },
                  { amount: 11, currency_code: "eur" },
                ],
              },
              {
                title: "1kg",
                sku: "ESP-GROUND-1KG",
                options: { Weight: "1kg" },
                prices: [
                  { amount: 24, currency_code: "usd" },
                  { amount: 21, currency_code: "eur" },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
        ],
      },
    });
  }
  logger.info("[Nople] Finished seeding coffee products.");

  logger.info("[Nople] Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryModule = container.resolve(Modules.INVENTORY);
  const existingLevels = await inventoryModule.listInventoryLevels({
    location_id: stockLocation.id,
  });
  const existingItemIds = new Set(
    existingLevels.map((l) => l.inventory_item_id)
  );

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    if (!existingItemIds.has(inventoryItem.id)) {
      inventoryLevels.push({
        location_id: stockLocation.id,
        stocked_quantity: 50000,
        inventory_item_id: inventoryItem.id,
      });
    }
  }

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    });
  }

  logger.info("[Nople] Seeding seller (vendor) defaults...");
  await createSellerDefaultsWorkflow(container).run({});

  logger.info(
    "[Nople] Coffee marketplace seed complete. " +
      "Run the vendor onboarding flow to create coffee-specific sellers " +
      "and fill the seller metadata with farm type, region, certifications, " +
      "and roasting level (see NOPLE_COFFEE_FIELDS.md)."
  );
}
