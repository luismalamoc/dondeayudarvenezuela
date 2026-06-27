.PHONY: check lint format typecheck test

check: lint typecheck test
	@echo "✅ Todo verde"

lint:
	pnpm lint --max-warnings 0
	npx prettier --check "src/**/*.{ts,tsx}" "workers/**/*.ts"

format:
	npx prettier --write "src/**/*.{ts,tsx}" "workers/**/*.ts"

typecheck:
	pnpm typecheck

test:
	pnpm test
