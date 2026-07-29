import { Button, Input, Select, toast } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@components/common/form";
import { RouteDrawer, useRouteModal } from "@components/modals";
import { KeyboundForm } from "@components/utilities/keybound-form";
import { HttpTypes } from "@mercurjs/types";
import { useUpdateSeller } from "@hooks/api";

type StoreCoffeeProfileFormProps = {
  seller: HttpTypes.StoreSellerResponse["seller"];
};

const StoreCoffeeProfileSchema = zod.object({
  farm_type: zod.string().optional().or(zod.literal("")),
  region: zod.string().optional().or(zod.literal("")),
  altitude: zod.string().optional().or(zod.literal("")),
  organic_certifications: zod.string().optional().or(zod.literal("")),
  roasting_capabilities: zod.string().optional().or(zod.literal("")),
  processing_methods: zod.string().optional().or(zod.literal("")),
  harvest_season: zod.string().optional().or(zod.literal("")),
});

const FARM_TYPES = [
  { value: "large_estate", label: "Large Estate / Plantation" },
  { value: "smallholder", label: "Smallholder Co-op" },
  { value: "micro_mill", label: "Micro-Mill / Single Farm" },
  { value: "direct_trade", label: "Direct Trade Estate" },
];

const ROASTING_CAPABILITIES = [
  { value: "green_only", label: "Green Beans Only" },
  { value: "light_roast", label: "Light Roast" },
  { value: "medium_roast", label: "Medium Roast" },
  { value: "medium_dark", label: "Medium-Dark Roast" },
  { value: "dark_roast", label: "Dark Roast" },
  { value: "custom_roasting", label: "Custom / Full Roasting" },
];

const PROCESSING_METHODS = [
  { value: "washed", label: "Washed / Wet Process" },
  { value: "natural", label: "Natural / Dry Process" },
  { value: "honey", label: "Honey / Pulped Natural" },
  { value: "anaerobic", label: "Anaerobic Fermentation" },
  { value: "wet_hulled", label: "Wet-Hulled (Giling Basah)" },
];

type CoffeeMetadata = {
  farm_type?: string | null;
  region?: string | null;
  altitude?: string | null;
  organic_certifications?: string | null;
  roasting_capabilities?: string | null;
  processing_methods?: string | null;
  harvest_season?: string | null;
};

export const StoreCoffeeProfileForm = ({
  seller,
}: StoreCoffeeProfileFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();

  const coffee = ((seller.metadata ?? {}) as CoffeeMetadata) ?? {};

  const form = useForm<zod.infer<typeof StoreCoffeeProfileSchema>>({
    resolver: zodResolver(StoreCoffeeProfileSchema),
    defaultValues: {
      farm_type: coffee.farm_type ?? "",
      region: coffee.region ?? "",
      altitude: coffee.altitude ?? "",
      organic_certifications: coffee.organic_certifications ?? "",
      roasting_capabilities: coffee.roasting_capabilities ?? "",
      processing_methods: coffee.processing_methods ?? "",
      harvest_season: coffee.harvest_season ?? "",
    },
  });

  const { mutateAsync, isPending } = useUpdateSeller(seller.id);

  const handleSubmit = form.handleSubmit(async (values) => {
    await mutateAsync(
      {
        metadata: {
          ...(seller.metadata ?? {}),
          farm_type: values.farm_type || null,
          region: values.region || null,
          altitude: values.altitude || null,
          organic_certifications: values.organic_certifications || null,
          roasting_capabilities: values.roasting_capabilities || null,
          processing_methods: values.processing_methods || null,
          harvest_season: values.harvest_season || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            t("store.coffeeProfile.edit.successToast", "Coffee profile updated")
          );
          handleSuccess();
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  });

  const labelText = (key: string, fallback: string) =>
    t(`store.coffeeProfile.fields.${key}`, fallback);

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <RouteDrawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          <Form.Field
            control={form.control}
            name="farm_type"
            render={({ field: { onChange, value, ...field } }) => (
              <Form.Item>
                <Form.Label optional>
                  {labelText("farmType", "Farm Type")}
                </Form.Label>
                <Form.Control>
                  <Select
                    size="small"
                    value={value ?? ""}
                    onValueChange={onChange}
                    {...field}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select farm type" />
                    </Select.Trigger>
                    <Select.Content>
                      {FARM_TYPES.map((ft) => (
                        <Select.Item key={ft.value} value={ft.value}>
                          {ft.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="region"
            render={({ field }) => (
              <Form.Item>
                <Form.Label optional>
                  {labelText("region", "Region / Origin")}
                </Form.Label>
                <Form.Control>
                  <Input
                    size="small"
                    placeholder="e.g. Yirgacheffe, Ethiopia"
                    {...field}
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="altitude"
            render={({ field }) => (
              <Form.Item>
                <Form.Label optional>
                  {labelText("altitude", "Altitude (masl)")}
                </Form.Label>
                <Form.Control>
                  <Input
                    size="small"
                    placeholder="e.g. 1800-2200"
                    {...field}
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="organic_certifications"
            render={({ field }) => (
              <Form.Item>
                <Form.Label optional>
                  {labelText(
                    "organicCertifications",
                    "Organic Certifications"
                  )}
                </Form.Label>
                <Form.Control>
                  <Input
                    size="small"
                    placeholder="e.g. USDA Organic, Fair Trade, Rainforest"
                    {...field}
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="roasting_capabilities"
            render={({ field: { onChange, value, ...field } }) => (
              <Form.Item>
                <Form.Label optional>
                  {labelText("roastingCapabilities", "Roasting Capabilities")}
                </Form.Label>
                <Form.Control>
                  <Select
                    size="small"
                    value={value ?? ""}
                    onValueChange={onChange}
                    {...field}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select roasting capability" />
                    </Select.Trigger>
                    <Select.Content>
                      {ROASTING_CAPABILITIES.map((rc) => (
                        <Select.Item key={rc.value} value={rc.value}>
                          {rc.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="processing_methods"
            render={({ field: { onChange, value, ...field } }) => (
              <Form.Item>
                <Form.Label optional>
                  {labelText("processingMethods", "Processing Methods")}
                </Form.Label>
                <Form.Control>
                  <Select
                    size="small"
                    value={value ?? ""}
                    onValueChange={onChange}
                    {...field}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select processing method" />
                    </Select.Trigger>
                    <Select.Content>
                      {PROCESSING_METHODS.map((pm) => (
                        <Select.Item key={pm.value} value={pm.value}>
                          {pm.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="harvest_season"
            render={({ field }) => (
              <Form.Item>
                <Form.Label optional>
                  {labelText("harvestSeason", "Harvest Season")}
                </Form.Label>
                <Form.Control>
                  <Input
                    size="small"
                    placeholder="e.g. Nov-Feb (main), Jun-Aug (fly)"
                    {...field}
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
        </RouteDrawer.Body>
        <RouteDrawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteDrawer.Close asChild>
              <Button variant="secondary" size="small">
                {t("actions.cancel")}
              </Button>
            </RouteDrawer.Close>
            <Button type="submit" size="small" isLoading={isPending}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  );
};
