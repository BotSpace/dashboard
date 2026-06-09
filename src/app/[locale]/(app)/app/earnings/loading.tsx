import { PageSkeleton } from "@/shared/components/common/page-skeleton";
export default function Loading() {
  return (
    <div className="space-y-6">
      <PageSkeleton variant="cards" />
      <PageSkeleton variant="table" rows={5} />
    </div>
  );
}
