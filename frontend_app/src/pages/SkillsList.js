import React from "react";
import SkillsCatalog from "./SkillsCatalog";

/**
 * PUBLIC_INTERFACE
 * SkillsList - Compatibility wrapper for SkillsCatalog to satisfy routes expecting a SkillsList component.
 * This allows /skills to render the same list while keeping test imports and router declarations intact.
 */
export default function SkillsList() {
  return <SkillsCatalog />;
}
