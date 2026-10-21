import React from "react";
import { Server } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandButton } from "#/components/features/settings/brand-button";
import { I18nKey } from "#/i18n/declaration";

const ManageBackendsModal = React.lazy(() =>
  import("#/components/features/backends/manage-backends-modal").then((m) => ({
    default: m.ManageBackendsModal,
  })),
);

export function BackendsSettingsScreen() {
  const { t } = useTranslation("openhands");
  const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);

  return (
    <div
      data-testid="backends-settings-screen"
      className="flex flex-col items-start gap-6"
    >
      <BrandButton
        testId="manage-backends-settings-button"
        type="button"
        variant="secondary"
        aria-haspopup="dialog"
        aria-expanded={isManageModalOpen}
        onClick={() => setIsManageModalOpen(true)}
        startContent={
          <Server aria-hidden className="size-4" strokeWidth={2} />
        }
      >
        {t(I18nKey.BACKEND$MANAGE)}
      </BrandButton>

      {isManageModalOpen ? (
        <React.Suspense fallback={null}>
          <ManageBackendsModal onClose={() => setIsManageModalOpen(false)} />
        </React.Suspense>
      ) : null}
    </div>
  );
}

export default BackendsSettingsScreen;
