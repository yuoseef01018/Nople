import { Heading } from "@medusajs/ui";
import { useTranslation } from "react-i18next";

import { RouteDrawer } from "@components/modals";
import { useMe } from "@hooks/api";

import { StoreCoffeeProfileForm } from "./store-coffee-profile-form";

export const Component = () => {
  const { t } = useTranslation();
  const { seller_member, isPending, isError, error } = useMe();

  const seller = seller_member?.seller;

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>
            {t("store.coffeeProfile.edit.header")}
          </Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t("store.coffeeProfile.edit.description")}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      {!isPending && seller && (
        <StoreCoffeeProfileForm seller={seller} />
      )}
    </RouteDrawer>
  );
};

export { Component as default };
