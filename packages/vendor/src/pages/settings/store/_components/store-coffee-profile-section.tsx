import { CoffeeCup, PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";

import { ActionMenu } from "@components/common/action-menu";
import { IconAvatar } from "@components/common/icon-avatar";
import { HttpTypes } from "@mercurjs/types";

type StoreCoffeeProfileSectionProps = {
  seller: HttpTypes.StoreSellerResponse["seller"];
};

type CoffeeMetadata = {
  farm_type?: string;
  region?: string;
  altitude?: string;
  organic_certifications?: string;
  roasting_capabilities?: string;
  processing_methods?: string;
  harvest_season?: string;
};

const FIELD_LABELS: { key: keyof CoffeeMetadata; label: string }[] = [
  { key: "farm_type", label: "Farm Type" },
  { key: "region", label: "Region / Origin" },
  { key: "altitude", label: "Altitude (masl)" },
  { key: "organic_certifications", label: "Organic Certifications" },
  { key: "roasting_capabilities", label: "Roasting Capabilities" },
  { key: "processing_methods", label: "Processing Methods" },
  { key: "harvest_season", label: "Harvest Season" },
];

export const StoreCoffeeProfileSection = ({
  seller,
}: StoreCoffeeProfileSectionProps) => {
  const { t } = useTranslation();
  const coffee = (seller.metadata ?? {}) as CoffeeMetadata;

  const hasDetails = FIELD_LABELS.some(
    ({ key }) => coffee[key]
  );

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">
          {t("store.coffeeProfile.header", "Coffee Profile")}
        </Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.edit"),
                  icon: <PencilSquare />,
                  to: "coffee-profile",
                },
              ],
            },
          ]}
        />
      </div>
      {hasDetails ? (
        <div className="flex flex-col gap-2 px-2 pb-2">
          <div className="px-4 pb-2">
            <div className="flex items-center gap-4 pb-4">
              <IconAvatar size="large" variant="squared">
                <CoffeeCup />
              </IconAvatar>
              <div className="flex flex-1 flex-col">
                <Text size="small" leading="compact" weight="plus">
                  {coffee.farm_type || "-"}
                </Text>
                <Text
                  size="small"
                  leading="compact"
                  className="text-ui-fg-subtle"
                >
                  {coffee.region || "-"}
                </Text>
              </div>
            </div>
            <div className="divide-y">
              {FIELD_LABELS.filter(({ key }) => key !== "farm_type" && key !== "region")
                .map(({ key, label }) => (
                  <div
                    key={key}
                    className="grid grid-cols-2 px-0 py-3"
                  >
                    <Text size="small" weight="plus">
                      {label}
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      {coffee[key] || "-"}
                    </Text>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-y-1 pb-6 pt-2">
          <Text size="small" leading="compact" weight="plus">
            {t(
              "store.coffeeProfile.empty.title",
              "No coffee profile details"
            )}
          </Text>
          <Text size="small" className="text-ui-fg-muted">
            {t(
              "store.coffeeProfile.empty.message",
              "Add farm type, region, certifications, and roasting capabilities."
            )}
          </Text>
        </div>
      )}
    </Container>
  );
};
