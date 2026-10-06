// Run: node --experimental-strip-types lib/experience.test.mjs
import assert from "node:assert/strict";
import { hero, yearsOfExperience } from "./content.ts";

const at = (y, m, d = 15) => new Date(y, m - 1, d); // month is 1-12 here

// career start is Aug 2019: the count ticks up every August
assert.equal(yearsOfExperience(at(2019, 8)), 0);
assert.equal(yearsOfExperience(at(2020, 7)), 0);
assert.equal(yearsOfExperience(at(2020, 8)), 1);
assert.equal(yearsOfExperience(at(2025, 12)), 6);
assert.equal(yearsOfExperience(at(2026, 7)), 6);
assert.equal(yearsOfExperience(at(2026, 8)), 7);
assert.equal(yearsOfExperience(at(2026, 10)), 7);
assert.equal(yearsOfExperience(at(2033, 1)), 13);
assert.equal(yearsOfExperience(at(2018, 1)), 0, "never negative");

// the hero text follows the clock instead of a hard-coded number
const y = yearsOfExperience();
assert.ok(hero.body.en.startsWith(`${y}+ years`));
assert.ok(hero.body.vi.startsWith(`Hơn ${y} năm`));
assert.ok(!/\b(Six|Sáu)\b/.test(hero.body.en + hero.body.vi));

console.log("ok");
