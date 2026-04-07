import { describe, it, expect } from "vitest";
import { calculateScholarshipMatch } from "../scholarship-matcher";

const baseStudent = {
  educationLevel: "undergrad_jr",
  fieldOfStudy: "STEM",
  major: "Computer Science",
  gpa: 3.7,
  gpaScale: 4.0,
  stateOfResidence: "CA",
  citizenship: "us_citizen",
  financialNeed: "medium",
  firstGeneration: true,
  minority: false,
  veteran: false,
  careerGoal: "software engineer at a health tech company",
  extracurriculars: JSON.stringify([{ name: "Robotics Club", role: "President" }]),
};

const baseScholarship = {
  id: "test-1",
  title: "STEM Excellence Award",
  provider: "Tech Foundation",
  description: "For outstanding STEM students pursuing technology careers",
  scholarshipType: "merit",
  minGPA: 3.5,
  educationLevels: JSON.stringify(["undergrad_jr", "undergrad_sr"]),
  fieldsOfStudy: JSON.stringify(["STEM"]),
  citizenshipRequired: "us_citizen",
  stateRestriction: null,
  tags: JSON.stringify(["technology", "engineering", "computer science"]),
};

describe("calculateScholarshipMatch", () => {
  it("returns high score for perfect match", () => {
    const result = calculateScholarshipMatch(baseStudent, baseScholarship);
    expect(result.score).toBeGreaterThan(85);
  });

  it("returns low score when GPA below minimum", () => {
    const lowGPA = { ...baseStudent, gpa: 2.5 };
    const result = calculateScholarshipMatch(lowGPA, baseScholarship);
    expect(result.score).toBeLessThan(30);
  });

  it("returns 0 when education level doesn't match", () => {
    const wrongLevel = { ...baseStudent, educationLevel: "phd" };
    const result = calculateScholarshipMatch(wrongLevel, baseScholarship);
    expect(result.score).toBe(0);
  });

  it("returns 0 when citizenship doesn't match", () => {
    const international = { ...baseStudent, citizenship: "international" };
    const scholarship = { ...baseScholarship, citizenshipRequired: "us_citizen" };
    const result = calculateScholarshipMatch(international, scholarship);
    expect(result.score).toBe(0);
  });

  it("boosts score for first-generation match", () => {
    const firstGenScholarship = {
      ...baseScholarship,
      tags: JSON.stringify(["first-generation", "technology"]),
    };
    const firstGen = { ...baseStudent, firstGeneration: true };
    const notFirstGen = { ...baseStudent, firstGeneration: false };
    const scoreWith = calculateScholarshipMatch(firstGen, firstGenScholarship);
    const scoreWithout = calculateScholarshipMatch(notFirstGen, firstGenScholarship);
    expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
  });

  it("includes breakdown in result", () => {
    const result = calculateScholarshipMatch(baseStudent, baseScholarship);
    expect(result.breakdown).toHaveProperty("educationLevel");
    expect(result.breakdown).toHaveProperty("fieldOfStudy");
    expect(result.breakdown).toHaveProperty("gpa");
    expect(result.breakdown).toHaveProperty("location");
    expect(result.breakdown).toHaveProperty("demographics");
    expect(result.breakdown).toHaveProperty("keywords");
  });
});
