import assert from "node:assert/strict";
import {
  SELECT_SOURCE_MESSAGE,
  validateGenerationSelection,
} from "./generatorValidation.mjs";

assert.equal(validateGenerationSelection([]), SELECT_SOURCE_MESSAGE);
assert.equal(validateGenerationSelection([1]), "");

console.log("generator validation ok");
