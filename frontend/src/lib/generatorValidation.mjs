export const SELECT_SOURCE_MESSAGE = "Select at least one source before generating content.";

export function validateGenerationSelection(sourceIds) {
  return sourceIds.length > 0 ? "" : SELECT_SOURCE_MESSAGE;
}
