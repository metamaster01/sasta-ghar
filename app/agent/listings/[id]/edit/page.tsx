// app/agent/listings/[id]/edit/page.tsx
// Edit existing property listing.
// Next.js 15+: params must be awaited.

import AddEditListingPage from "@/components/agent/AddEditListingPage";

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  return <AddEditListingPage propertyId={id} />;
}