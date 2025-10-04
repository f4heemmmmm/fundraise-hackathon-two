/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.test.ts"],
	transform: {
		"^.+\\.ts$": ["ts-jest", {}],
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	collectCoverageFrom: [
		"src/**/*.ts",
		"!src/**/*.test.ts",
		"!src/test-*.ts",
		"!src/index.ts",
	],
	coverageDirectory: "coverage",
	verbose: true,
}
