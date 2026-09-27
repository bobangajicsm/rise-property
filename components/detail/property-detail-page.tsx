'use client';

import { ArchivedPropertyDetailPage } from "@/components/detail/archived-property-detail-page";
import type { Property } from "@/types/property";

interface PropertyDetailPageProps {
  property: Property;
  relatedProperties: Property[];
}

export function PropertyDetailPage(props: PropertyDetailPageProps) {
  return <ArchivedPropertyDetailPage {...props} />;
}
